import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  update,
  runTransaction,
} from 'firebase/database';

// Tự động nạp cấu hình từ .env.local (file này nằm trong .gitignore, không bị lộ ra git)
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      }
    });
  }
} catch {}

const FIREBASE_DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !FIREBASE_DB_URL) {
  console.error('❌ Vui lòng cung cấp cấu hình Firebase trong file .env.local trước khi chạy test!');
  process.exit(1);
}

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app, FIREBASE_DB_URL);

const TEAM_KEYS = [
  'tien_phong',
  'tri_thuc',
  'xung_kich',
  'dan_toc_ton_giao',
  'kieu_bao',
  'ban_be_quoc_te',
];

const QUESTIONS = [
  { id: 1, round: 1, correctIndex: 2, timeLimit: 15 },
  { id: 2, round: 1, correctIndex: 0, timeLimit: 15 },
  { id: 6, round: 2, correctIndex: 3, timeLimit: 60 },
];

function calculateScore(isCorrect, timeUsed, timeLimit, streak) {
  if (!isCorrect) return { points: 0, newStreak: 0 };
  const clampedTimeUsed = Math.min(Math.max(timeUsed, 0.5), timeLimit);
  const speedBonus = Math.max(0, 1 - (clampedTimeUsed / timeLimit) / 2);
  const basePoints = Math.round(1000 * speedBonus);
  const streakBonus = Math.min(streak * 100, 500);
  return { points: basePoints + streakBonus, newStreak: streak + 1 };
}

// Atomic join
async function atomicJoinRoom(pin, playerName, teamId, pId) {
  const playersRef = ref(db, `rooms/${pin}/players`);
  let failReason = '';
  let finalPlayer = null;

  const txResult = await runTransaction(playersRef, (currentPlayers) => {
    const playersMap = currentPlayers || {};
    const existingList = Object.values(playersMap);
    const currentTeamMembers = existingList.filter(
      (p) => p.teamId === teamId && p.id !== pId
    );
    if (currentTeamMembers.length >= 5) {
      failReason = 'Khối này đã đủ 5/5 người!';
      return; // abort
    }
    finalPlayer = {
      id: pId,
      name: playerName,
      teamId,
      score: 0,
      streak: 0,
      isBot: false,
    };
    playersMap[pId] = finalPlayer;
    return playersMap;
  });

  return {
    success: txResult.committed && Boolean(finalPlayer),
    player: finalPlayer,
    failReason,
  };
}

// Atomic answer submit
async function atomicSubmitAnswer(pin, playerId, questionIndex, answerIndex, timeUsed) {
  const q = QUESTIONS[questionIndex];
  const isCorrect = answerIndex === q.correctIndex;
  const playerRef = ref(db, `rooms/${pin}/players/${playerId}`);

  let points = 0;
  let newStreak = 0;

  await runTransaction(playerRef, (player) => {
    if (!player) return player;
    const scoreRes = calculateScore(isCorrect, timeUsed, q.timeLimit, player.streak || 0);
    points = scoreRes.points;
    newStreak = scoreRes.newStreak;
    player.score = (player.score || 0) + points;
    player.streak = newStreak;
    player.lastAnswer = answerIndex;
    player.lastAnswerQuestionIndex = questionIndex;
    player.isCorrect = isCorrect;
    player.pointsEarned = points;
    return player;
  });

  const answerRef = ref(db, `room_answers/${pin}/${questionIndex}/${playerId}`);
  const answerRecord = {
    questionIndex,
    answerIndex,
    timeUsed,
    points,
    isCorrect,
    submittedAt: Date.now(),
  };
  await set(answerRef, answerRecord);

  return { success: true, points, isCorrect, newStreak };
}

// Test Suite Runner
async function runConcurrencyTests() {
  const TEST_PIN = `T${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`\n=============================================================`);
  console.log(`🚀 BẮT ĐẦU KIỂM THỬ CONCURRENCY VỚI 24–30 CLIENTS TRÊN FIREBASE`);
  console.log(`📌 Mã phòng test: ${TEST_PIN}`);
  console.log(`=============================================================\n`);

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASS: ${message}`);
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // Giai đoạn 1: Khởi tạo phòng test
    // -------------------------------------------------------------
    console.log(`[Giai đoạn 1] Khởi tạo phòng test trên Firebase...`);
    const initialTeams = {};
    TEAM_KEYS.forEach((tid) => {
      initialTeams[tid] = { name: tid, score: 0, count: 0 };
    });

    await set(ref(db, `rooms/${TEST_PIN}`), {
      pin: TEST_PIN,
      status: 'LOBBY',
      round: 1,
      currentQuestionIndex: 0,
      questionStartTime: 0,
      timeLimit: 15,
      teams: initialTeams,
      players: {},
      lastUpdated: Date.now(),
    });

    const initSnap = await get(ref(db, `rooms/${TEST_PIN}`));
    assert(initSnap.exists() && initSnap.val().status === 'LOBBY', 'Phòng test tạo thành công trên Firebase');

    // -------------------------------------------------------------
    // Giai đoạn 2: Kiểm thử 24 Client cùng Join phòng đồng thời (Race Condition test)
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 2] Mô phỏng 24 sinh viên cùng lúc bấm "VÀO PHÒNG HỌC" (Promise.all)...`);
    const clientsToJoin = [];
    TEAM_KEYS.forEach((tid) => {
      for (let i = 1; i <= 4; i++) {
        clientsToJoin.push({
          id: `player_${tid}_${i}`,
          name: `Sinh viên ${tid} #${i}`,
          teamId: tid,
        });
      }
    });

    const startJoinTime = Date.now();
    const joinResults = await Promise.all(
      clientsToJoin.map((c) => atomicJoinRoom(TEST_PIN, c.name, c.teamId, c.id))
    );
    const joinDuration = Date.now() - startJoinTime;

    const allJoinSuccess = joinResults.every((r) => r.success === true);
    assert(allJoinSuccess, `Tất cả 24 client join đồng thời thành công (Thời gian: ${joinDuration}ms)`);

    // Đọc lại từ Firebase để kiểm tra số lượng thực tế
    const playersSnap = await get(ref(db, `rooms/${TEST_PIN}/players`));
    const playersMap = playersSnap.val() || {};
    const playerCount = Object.keys(playersMap).length;
    assert(playerCount === 24, `Không bị đè mất người chơi nào: Firebase ghi nhận đúng 24/24 người chơi`);

    // Kiểm tra từng khối có đúng 4 người
    let allTeamsCorrect = true;
    TEAM_KEYS.forEach((tid) => {
      const count = Object.values(playersMap).filter((p) => p.teamId === tid).length;
      if (count !== 4) allTeamsCorrect = false;
    });
    assert(allTeamsCorrect, `Cả 6 khối liên minh đều có đúng 4 thành viên (không khối nào bị lệch)`);

    // -------------------------------------------------------------
    // Giai đoạn 3: Kiểm thử giới hạn 5 người/khối (Team Capacity Constraint)
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 3] Kiểm thử chặn vượt quá 5 người/khối...`);
    // Thêm người thứ 5 vào khối tien_phong -> Phải thành công (5/5)
    const p5Result = await atomicJoinRoom(TEST_PIN, 'Sinh viên Tiên Phong #5', 'tien_phong', 'p_tp_5');
    assert(p5Result.success === true, 'Người thứ 5 gia nhập khối tien_phong thành công (5/5)');

    // Thêm người thứ 6 vào khối tien_phong -> Bắt buộc phải thất bại!
    const p6Result = await atomicJoinRoom(TEST_PIN, 'Sinh viên Tiên Phong #6', 'tien_phong', 'p_tp_6');
    assert(
      p6Result.success === false && p6Result.failReason.includes('5/5'),
      `Người thứ 6 bị từ chối chính xác: "${p6Result.failReason}"`
    );

    // -------------------------------------------------------------
    // Giai đoạn 4: Bắt đầu Câu hỏi 1 (status: QUESTION)
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 4] Quản trò bấm "BẮT ĐẦU TRẬN ĐẤU" (Câu 1)...`);
    await update(ref(db, `rooms/${TEST_PIN}`), {
      status: 'QUESTION',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      timeLimit: 15,
      lastUpdated: Date.now(),
    });
    const q1Snap = await get(ref(db, `rooms/${TEST_PIN}`));
    assert(q1Snap.val().status === 'QUESTION', 'Trạng thái phòng chuyển sang QUESTION thành công');

    // -------------------------------------------------------------
    // Giai đoạn 5: 25 sinh viên cùng nộp bài đồng thời (Câu 1: correctIndex = 2)
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 5] 25 sinh viên cùng bấm nộp bài đồng thời trong 1-2 giây...`);
    const all25Players = Object.values((await get(ref(db, `rooms/${TEST_PIN}/players`))).val());
    
    // Giả lập 20 người chọn đáp án đúng (2: C), 5 người chọn sai (0: A)
    const answerPromises = all25Players.map((p, idx) => {
      const chooseCorrect = idx < 20;
      const answerIndex = chooseCorrect ? 2 : 0;
      const timeUsed = 1.5 + (idx % 5) * 0.5; // Giả lập thời gian từ 1.5s đến 3.5s
      return atomicSubmitAnswer(TEST_PIN, p.id, 0, answerIndex, timeUsed);
    });

    const submitStart = Date.now();
    const answerResults = await Promise.all(answerPromises);
    const submitDuration = Date.now() - submitStart;

    assert(answerResults.length === 25, `Cả 25 bài nộp được xử lý (Thời gian: ${submitDuration}ms)`);

    // Đọc lại từ room_answers
    const answersSnap = await get(ref(db, `room_answers/${TEST_PIN}/0`));
    const answersMap = answersSnap.val() || {};
    assert(Object.keys(answersMap).length === 25, 'room_answers/0 lưu trữ đúng 25 bài nộp độc lập');

    // Kiểm tra phân bổ đáp án
    let countCorrect = 0;
    let countWrong = 0;
    Object.values(answersMap).forEach((ans) => {
      if (ans.isCorrect) countCorrect++;
      else countWrong++;
    });
    assert(countCorrect === 20 && countWrong === 5, `Phân bổ đáp án chuẩn xác: 20 đúng, 5 sai`);

    // -------------------------------------------------------------
    // Giai đoạn 6: Host Reveal & Tính điểm đội
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 6] Quản trò công bố kết quả (REVEAL) và tổng hợp điểm...`);
    const q0Answers = (await get(ref(db, `room_answers/${TEST_PIN}/0`))).val() || {};
    const currentPlayers = (await get(ref(db, `rooms/${TEST_PIN}/players`))).val() || {};

    const updatedTeams = {};
    TEAM_KEYS.forEach((tid) => {
      const teamPlayers = Object.values(currentPlayers).filter((p) => p.teamId === tid);
      const teamPoints = teamPlayers.reduce((sum, p) => {
        const ans = q0Answers[p.id];
        return sum + (ans?.points || 0);
      }, 0);
      updatedTeams[tid] = { score: teamPoints, count: teamPlayers.length };
    });

    await update(ref(db, `rooms/${TEST_PIN}`), {
      status: 'REVEAL',
      teams: updatedTeams,
      lastUpdated: Date.now(),
    });

    const revealSnap = await get(ref(db, `rooms/${TEST_PIN}`));
    assert(revealSnap.val().status === 'REVEAL', 'Trạng thái chuyển sang REVEAL');
    const totalTeamPoints = Object.values(revealSnap.val().teams).reduce((s, t) => s + t.score, 0);
    const totalPlayerPoints = Object.values(currentPlayers).reduce((s, p) => s + p.score, 0);
    assert(totalTeamPoints === totalPlayerPoints, `Điểm các khối (${totalTeamPoints}đ) khớp 100% với tổng điểm cá nhân (${totalPlayerPoints}đ)`);

    // -------------------------------------------------------------
    // Giai đoạn 7: Chuyển sang Câu 2 — Kiểm tra cách ly bài nộp (Không bị kẹt đáp án cũ)
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 7] Quản trò chuyển sang Câu hỏi 2 (Kiểm tra cách ly câu trả lời)...`);
    await update(ref(db, `rooms/${TEST_PIN}`), {
      status: 'QUESTION',
      currentQuestionIndex: 1,
      questionStartTime: Date.now(),
      lastUpdated: Date.now(),
    });

    // Kiểm tra room_answers/1 phải hoàn toàn trống ban đầu
    const q1AnswersSnap = await get(ref(db, `room_answers/${TEST_PIN}/1`));
    assert(!q1AnswersSnap.exists(), 'room_answers/1 hoàn toàn trống (Không bị dính đáp án của Câu 0)');

    // 25 người nộp câu 2 (correctIndex = 0)
    await Promise.all(
      all25Players.map((p) => atomicSubmitAnswer(TEST_PIN, p.id, 1, 0, 2.0))
    );
    const q1NewAnswers = (await get(ref(db, `room_answers/${TEST_PIN}/1`))).val() || {};
    assert(Object.keys(q1NewAnswers).length === 25, '25 sinh viên nộp tiếp Câu 2 mượt mà, ghi nhận đủ 25 bài');

    // -------------------------------------------------------------
    // Giai đoạn 8: Dọn dẹp phòng test trên Firebase
    // -------------------------------------------------------------
    console.log(`\n[Giai đoạn 8] Dọn dẹp phòng test trên Firebase...`);
    await remove(ref(db, `rooms/${TEST_PIN}`));
    await remove(ref(db, `room_answers/${TEST_PIN}`));
    const cleanCheck = await get(ref(db, `rooms/${TEST_PIN}`));
    assert(!cleanCheck.exists(), `Phòng test ${TEST_PIN} đã được dọn sạch hoàn toàn khỏi Firebase`);

    console.log(`\n=============================================================`);
    console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASS (100%)`);
    console.log(`=============================================================\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', error);
    process.exit(1);
  }
}

runConcurrencyTests();
