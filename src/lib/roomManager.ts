import { db, isFirebaseConfigured } from './firebase';
import {
  ref,
  set,
  onValue,
  get,
  remove,
  update,
  runTransaction,
} from 'firebase/database';
import { RoomState, TeamId, Player, PlayerAnswer } from './types';
import { TEAMS } from './teams';
import { calculateScore, getTeamMultiplier } from './scoring';
import { QUESTIONS } from './questions';

export const TEAM_KEYS: TeamId[] = [
  'tien_phong',
  'tri_thuc',
  'xung_kich',
  'dan_toc_ton_giao',
  'kieu_bao',
  'ban_be_quoc_te',
];

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function createInitialRoom(pin: string): RoomState {
  const initialTeams: Record<TeamId, { name: string; score: number; count: number }> = {
    tien_phong: { name: TEAMS.tien_phong.name, score: 0, count: 0 },
    tri_thuc: { name: TEAMS.tri_thuc.name, score: 0, count: 0 },
    xung_kich: { name: TEAMS.xung_kich.name, score: 0, count: 0 },
    dan_toc_ton_giao: { name: TEAMS.dan_toc_ton_giao.name, score: 0, count: 0 },
    kieu_bao: { name: TEAMS.kieu_bao.name, score: 0, count: 0 },
    ban_be_quoc_te: { name: TEAMS.ban_be_quoc_te.name, score: 0, count: 0 },
  };

  return {
    pin,
    status: 'LOBBY',
    round: 1,
    currentQuestionIndex: 0,
    questionStartTime: 0,
    timeLimit: QUESTIONS[0].timeLimit,
    teams: initialTeams,
    players: {},
    lastUpdated: Date.now(),
  };
}

// Lưu trữ trạng thái phòng ban đầu (khởi tạo, reset)
export async function saveRoomState(state: RoomState): Promise<void> {
  const cleanState = { ...state, lastUpdated: Date.now() };

  if (isFirebaseConfigured && db) {
    try {
      const roomRef = ref(db, `rooms/${state.pin}`);
      const firebaseSafeState = JSON.parse(JSON.stringify(cleanState));
      await set(roomRef, firebaseSafeState);
    } catch (e) {
      console.warn('Firebase saveRoomState notice:', e);
    }
  }
}

// Lắng nghe cập nhật phòng realtime (dành cho Host)
export function subscribeToRoom(
  pin: string,
  callback: (state: RoomState | null) => void
): () => void {
  let unsubscribeFirebase: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = ref(db, `rooms/${pin}`);
      unsubscribeFirebase = onValue(
        roomRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as RoomState;
            callback(data);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.warn('Firebase subscribeToRoom warning:', error);
        }
      );
    } catch (e) {
      console.warn('Firebase subscribe notice:', e);
    }
  }

  return () => {
    if (unsubscribeFirebase) unsubscribeFirebase();
  };
}

// Lắng nghe số lượng và phân bổ bài nộp cho câu hỏi hiện tại (Host dùng để vẽ chart & đếm)
export function subscribeToQuestionAnswers(
  pin: string,
  questionIndex: number,
  callback: (answers: Record<string, PlayerAnswer>) => void
): () => void {
  if (!isFirebaseConfigured || !db) return () => {};

  const answersRef = ref(db, `room_answers/${pin}/${questionIndex}`);
  const unsubscribe = onValue(
    answersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Record<string, PlayerAnswer>);
      } else {
        callback({});
      }
    },
    (error) => {
      console.warn('Firebase subscribeToQuestionAnswers warning:', error);
    }
  );

  return unsubscribe;
}

// Lấy toàn bộ bài nộp của 1 câu hỏi (1 lần)
export async function getQuestionAnswers(
  pin: string,
  questionIndex: number
): Promise<Record<string, PlayerAnswer>> {
  if (!isFirebaseConfigured || !db) return {};
  try {
    const answersSnap = await get(ref(db, `room_answers/${pin}/${questionIndex}`));
    if (answersSnap.exists()) {
      return answersSnap.val() as Record<string, PlayerAnswer>;
    }
  } catch (e) {
    console.warn('getQuestionAnswers error:', e);
  }
  return {};
}

// Lấy phòng 1 lần từ Firebase (không dùng fallback localStorage cũ để tránh stale state)
export async function getRoomState(pin: string): Promise<RoomState | null> {
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = ref(db, `rooms/${pin}`);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000)
      );
      const snapshot = await Promise.race([get(roomRef), timeoutPromise]);
      if (snapshot && 'exists' in snapshot && snapshot.exists()) {
        return snapshot.val() as RoomState;
      }
    } catch (e) {
      console.warn('Firebase getRoomState notice:', e);
    }
  }
  return null;
}

// Người chơi tham gia phòng — DÙNG ATOMIC TRANSACTION ĐỂ KHÔNG BAO GIỜ BỊ ĐÈ MẤT NHAU
export async function joinRoom(
  pin: string,
  playerName: string,
  teamId: TeamId,
  playerId?: string
): Promise<{ success: boolean; playerId: string; message?: string; room?: RoomState }> {
  if (!isFirebaseConfigured || !db) {
    return { success: false, playerId: '', message: 'Hệ thống chưa kết nối cơ sở dữ liệu.' };
  }

  // 1. Kiểm tra trạng thái phòng trước
  const roomSnap = await get(ref(db, `rooms/${pin}`));
  if (!roomSnap.exists()) {
    return {
      success: false,
      playerId: '',
      message: 'Không tìm thấy phòng với mã PIN này. Vui lòng kiểm tra lại từ Quản trò!',
    };
  }

  const roomData = roomSnap.val() as RoomState;
  if (roomData.status !== 'LOBBY') {
    return {
      success: false,
      playerId: '',
      message: 'Trò chơi đã bắt đầu, không thể tham gia mới lúc này!',
    };
  }

  const pId = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const playersRef = ref(db, `rooms/${pin}/players`);

  let failReason = '';
  let finalPlayer: Player | null = null;

  try {
    // Transaction nguyên tử trên node players: an toàn 100% khi 20–30 người cùng join
    const txResult = await runTransaction(playersRef, (currentPlayers) => {
      const playersMap = currentPlayers || {};
      const existingList = Object.values(playersMap) as Player[];

      // Đếm thành viên hiện tại của khối (trừ chính player này nếu đã từng vào)
      const currentTeamMembers = existingList.filter(
        (p) => p.teamId === teamId && p.id !== pId
      );

      if (currentTeamMembers.length >= 5) {
        failReason = 'Khối này đã đủ 5/5 người! Vui lòng chọn khối liên minh khác.';
        return; // Abort transaction
      }

      const prev = playersMap[pId] || {};
      finalPlayer = {
        id: pId,
        name: playerName.trim(),
        teamId,
        score: prev.score || 0,
        streak: prev.streak || 0,
        isBot: false,
      };

      playersMap[pId] = finalPlayer;
      return playersMap;
    });

    if (!txResult.committed || !finalPlayer) {
      return {
        success: false,
        playerId: '',
        message: failReason || 'Không thể tham gia khối lúc này, vui lòng thử lại!',
      };
    }

    // Cập nhật lại số lượng thành viên của các khối trên Firebase
    const updatedSnap = await get(playersRef);
    if (updatedSnap.exists()) {
      const allPlayers = Object.values(updatedSnap.val()) as Player[];
      const countUpdates: Record<string, number> = {};
      TEAM_KEYS.forEach((tid) => {
        countUpdates[`teams/${tid}/count`] = allPlayers.filter((p) => p.teamId === tid).length;
      });
      await update(ref(db, `rooms/${pin}`), countUpdates).catch(() => {});
    }

    const latestRoom = await getRoomState(pin);
    return { success: true, playerId: pId, room: latestRoom || undefined };
  } catch (err: any) {
    console.error('joinRoom transaction error:', err);
    return {
      success: false,
      playerId: '',
      message: 'Lỗi đồng bộ tham gia phòng, vui lòng thử lại.',
    };
  }
}

// Người chơi rời khỏi phòng (giải phóng vị trí trong khối cũ)
export async function leaveRoom(pin: string, playerId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !pin || !playerId) return false;
  try {
    await remove(ref(db, `rooms/${pin}/players/${playerId}`));
    const snapshot = await get(ref(db, `rooms/${pin}/players`));
    const allPlayers = snapshot.exists() ? (Object.values(snapshot.val()) as Player[]) : [];
    const countUpdates: Record<string, number> = {};
    TEAM_KEYS.forEach((tid) => {
      countUpdates[`teams/${tid}/count`] = allPlayers.filter((p) => p.teamId === tid).length;
    });
    await update(ref(db, `rooms/${pin}`), countUpdates).catch(() => {});
    return true;
  } catch (e) {
    console.warn('leaveRoom error:', e);
    return false;
  }
}

// Người chơi gửi đáp án — GẮN CHẶT QUESTION INDEX, KHÔNG GỌI getRoomState NẶNG QUA MẠNG
export async function submitAnswer(
  pin: string,
  playerId: string,
  questionIndex: number,
  answerIndex: number,
  timeUsed: number
): Promise<{ success: boolean; points: number; isCorrect: boolean; newStreak: number }> {
  if (!isFirebaseConfigured || !db || !pin || !playerId) {
    return { success: false, points: 0, isCorrect: false, newStreak: 0 };
  }

  const currentQ = QUESTIONS[questionIndex];
  if (!currentQ) {
    return { success: false, points: 0, isCorrect: false, newStreak: 0 };
  }

  // 1. Kiểm tra xem người chơi đã nộp câu này chưa trong room_answers
  const answerRef = ref(db, `room_answers/${pin}/${questionIndex}/${playerId}`);
  const existingAnsSnap = await get(answerRef);
  if (existingAnsSnap.exists()) {
    const existing = existingAnsSnap.val() as PlayerAnswer;
    return {
      success: true,
      points: existing.points,
      isCorrect: existing.isCorrect,
      newStreak: 0,
    };
  }

  // 2. Chấm điểm trực tiếp, chuẩn xác với câu hỏi hiển thị
  const isCorrect = answerIndex === currentQ.correctIndex;
  let points = 0;
  let newStreak = 0;

  // 3. Cập nhật streak và score của player bằng transaction nguyên tử
  const playerRef = ref(db, `rooms/${pin}/players/${playerId}`);
  try {
    await runTransaction(playerRef, (player) => {
      if (!player) return player;
      const currentStreak = player.streak || 0;
      const scoreResult = calculateScore(
        isCorrect,
        timeUsed,
        currentQ.timeLimit,
        currentStreak
      );
      points = scoreResult.points;
      newStreak = scoreResult.newStreak;

      player.score = (player.score || 0) + points;
      player.streak = newStreak;
      player.lastAnswer = answerIndex;
      player.lastAnswerQuestionIndex = questionIndex;
      player.isCorrect = isCorrect;
      player.pointsEarned = points;
      return player;
    });
  } catch (err) {
    console.warn('Player score update transaction warning:', err);
  }

  // 4. Ghi bài nộp vào đường dẫn riêng `room_answers/${pin}/${questionIndex}/${playerId}`
  // ĐẢM BẢO KHÔNG KÍCH HOẠT RE-RENDER CỦA 19 NGƯỜI CHƠI KHÁC!
  const answerRecord: PlayerAnswer = {
    questionIndex,
    answerIndex,
    timeUsed,
    points,
    isCorrect,
    submittedAt: Date.now(),
  };

  try {
    await set(answerRef, answerRecord);
  } catch (err) {
    console.warn('Set answerRecord error:', err);
  }

  return {
    success: true,
    points,
    isCorrect,
    newStreak,
  };
}

// Chuyển sang giai đoạn REVEAL và tính điểm Combo Đồng Thuận x2 cho các đội
export async function revealAnswersAndScoreTeams(pin: string): Promise<RoomState | null> {
  if (!isFirebaseConfigured || !db) return null;

  const roomRef = ref(db, `rooms/${pin}`);
  const roomSnap = await get(roomRef);
  if (!roomSnap.exists()) return null;

  const room = roomSnap.val() as RoomState;
  if (room.status === 'REVEAL') return room; // Chặn duplicate double-click

  const qIndex = room.currentQuestionIndex;
  const currentQ = QUESTIONS[qIndex];
  const isRound2 = currentQ?.round === 2;

  // Đọc danh sách bài nộp của đúng câu hỏi này từ room_answers
  const answersSnap = await get(ref(db, `room_answers/${pin}/${qIndex}`));
  const answersMap: Record<string, PlayerAnswer> = answersSnap.exists() ? answersSnap.val() : {};

  const playersMap = room.players || {};
  const updatedTeams = { ...room.teams };

  TEAM_KEYS.forEach((teamId) => {
    const teamPlayers = Object.values(playersMap).filter((p) => p.teamId === teamId);
    // Những thành viên có nộp bài ở câu hỏi này
    const answeredMembers = teamPlayers.filter((p) => answersMap[p.id] !== undefined);

    let questionTeamPoints = answeredMembers.reduce((sum, p) => {
      const ans = answersMap[p.id];
      return sum + (ans?.points || 0);
    }, 0);

    if (isRound2) {
      // Combo Đồng Thuận x2: Có đủ ít nhất 5 người và tất cả đều đúng
      const answeredList = answeredMembers.map((p) => answersMap[p.id]);
      const multiplierData = getTeamMultiplier(answeredList, 5);
      if (multiplierData.isConsensus) {
        questionTeamPoints = Math.round(questionTeamPoints * 2.0);
      }
    }

    const currentScore = updatedTeams[teamId]?.score || 0;
    updatedTeams[teamId] = {
      ...updatedTeams[teamId],
      score: currentScore + questionTeamPoints,
      count: teamPlayers.length,
    };
  });

  const updates: any = {
    status: 'REVEAL',
    teams: updatedTeams,
    lastUpdated: Date.now(),
  };

  try {
    await update(roomRef, updates);
  } catch (e) {
    console.warn('Firebase reveal save error:', e);
  }

  return {
    ...room,
    status: 'REVEAL',
    teams: updatedTeams,
  };
}

// Bắt đầu câu hỏi tiếp theo — KHÔNG CẦN CHẠY VÒNG LẶP XÓA BÀI CỦA TỪNG NGƯỜI
export async function startNextQuestion(pin: string): Promise<RoomState | null> {
  if (!isFirebaseConfigured || !db) return null;

  const roomRef = ref(db, `rooms/${pin}`);
  const roomSnap = await get(roomRef);
  if (!roomSnap.exists()) return null;

  const room = roomSnap.val() as RoomState;
  if (room.status === 'QUESTION') return room; // Chặn double-click

  // Nếu vừa hoàn thành Vòng 1 (câu 5, index 4) và đang chuyển sang Vòng 2
  if (room.status !== 'LOBBY' && room.currentQuestionIndex === 4 && room.status !== 'ROUND_TRANSITION') {
    const updates = {
      status: 'ROUND_TRANSITION',
      round: 2,
      currentQuestionIndex: 5,
      lastUpdated: Date.now(),
    };
    await update(roomRef, updates).catch((e) => console.warn(e));
    return { ...room, status: 'ROUND_TRANSITION', round: 2, currentQuestionIndex: 5 };
  }

  let nextIndex = room.currentQuestionIndex;
  let nextRound = room.round;

  if (room.status === 'ROUND_TRANSITION') {
    nextIndex = 5;
    nextRound = 2;
  } else if (room.status !== 'LOBBY') {
    nextIndex = room.currentQuestionIndex + 1;
  }

  if (nextIndex >= QUESTIONS.length) {
    const updates = {
      status: 'FINISHED',
      lastUpdated: Date.now(),
    };
    await update(roomRef, updates).catch((e) => console.warn(e));
    return { ...room, status: 'FINISHED' };
  }

  const question = QUESTIONS[nextIndex];
  nextRound = question.round;
  const now = Date.now();

  const updates: any = {
    status: 'QUESTION',
    round: nextRound,
    currentQuestionIndex: nextIndex,
    questionStartTime: now,
    timeLimit: question.timeLimit,
    lastUpdated: now,
  };

  try {
    await update(roomRef, updates);
  } catch (e) {
    console.warn('Firebase next question error:', e);
  }

  return {
    ...room,
    status: 'QUESTION',
    round: nextRound,
    currentQuestionIndex: nextIndex,
    questionStartTime: now,
    timeLimit: question.timeLimit,
  };
}

// Chuyển sang trạng thái LEADERBOARD
export async function showLeaderboard(pin: string): Promise<RoomState | null> {
  if (!isFirebaseConfigured || !db) return null;
  const roomRef = ref(db, `rooms/${pin}`);
  await update(roomRef, { status: 'LEADERBOARD', lastUpdated: Date.now() }).catch((e) =>
    console.warn(e)
  );
  const snap = await get(roomRef);
  return snap.exists() ? (snap.val() as RoomState) : null;
}

// Mô phỏng 30 Bot tham gia lớp học (5 bot mỗi khối)
export async function populateBotPlayers(pin: string): Promise<RoomState | null> {
  const room = await getRoomState(pin);
  if (!room || !db) return null;

  const botNames: Record<TeamId, string[]> = {
    tien_phong: ['Nguyễn Văn Công', 'Trần Thị Nông', 'Lê Bền Vững', 'Phạm Quyết Thắng', 'Hoàng Tiên Phong'],
    tri_thuc: ['GS. Đỗ Khai Phóng', 'TS. Nguyễn Sáng Tạo', 'Vũ Tinh Hoa', 'Bùi Trí Tuệ', 'Lý Kiến Thiết'],
    xung_kich: ['Đặng Xung Kích', 'Ngô Tuổi Trẻ', 'Lưu Bứt Phá', 'Dương Nhiệt Huyết', 'Phan Khát Vọng'],
    dan_toc_ton_giao: ['Y-Bling Êđê', 'Lò Văn Thái', 'Thạch Sa-Rương', 'Nguyễn Hòa Hợp', 'Lê Đoàn Kết'],
    kieu_bao: ['Alex Nguyễn (Mỹ)', 'Jean-Luc Trần (Pháp)', 'Elena Vũ (Nga)', 'Kenji Lê (Nhật)', 'Minh Kiều Tâm'],
    ban_be_quoc_te: ['John Peace (UN)', 'Marie Curie', 'Nelson Mandela', 'Hans Unity', 'Oliver Friendship'],
  };

  const updatedPlayers = { ...(room.players || {}) };
  TEAM_KEYS.forEach((teamId) => {
    botNames[teamId].forEach((name, idx) => {
      const botId = `bot_${teamId}_${idx + 1}`;
      if (!updatedPlayers[botId]) {
        updatedPlayers[botId] = {
          id: botId,
          name,
          teamId,
          score: 0,
          streak: 0,
          isBot: true,
        };
      }
    });
  });

  const updatedTeams = { ...room.teams };
  TEAM_KEYS.forEach((teamId) => {
    const count = Object.values(updatedPlayers).filter((p) => p.teamId === teamId).length;
    updatedTeams[teamId] = { ...updatedTeams[teamId], count };
  });

  await update(ref(db, `rooms/${pin}`), {
    players: updatedPlayers,
    teams: updatedTeams,
    lastUpdated: Date.now(),
  });

  return {
    ...room,
    players: updatedPlayers,
    teams: updatedTeams,
  };
}

// Xóa tất cả 30 Bot test
export async function clearAllBots(pin: string): Promise<RoomState | null> {
  const room = await getRoomState(pin);
  if (!room || !db) return null;

  const nonBotPlayers: Record<string, Player> = {};
  Object.values(room.players || {}).forEach((p) => {
    if (!p.isBot) {
      nonBotPlayers[p.id] = p;
    }
  });

  const updatedTeams = { ...room.teams };
  TEAM_KEYS.forEach((tid) => {
    const count = Object.values(nonBotPlayers).filter((p) => p.teamId === tid).length;
    updatedTeams[tid] = { ...updatedTeams[tid], count };
  });

  await update(ref(db, `rooms/${pin}`), {
    players: nonBotPlayers,
    teams: updatedTeams,
    lastUpdated: Date.now(),
  });

  return {
    ...room,
    players: nonBotPlayers,
    teams: updatedTeams,
  };
}

// Đặt lại toàn bộ phòng (Reset Players & Scores & Answers)
export async function resetRoom(pin: string): Promise<RoomState | null> {
  const freshRoom = createInitialRoom(pin);
  await saveRoomState(freshRoom);
  if (isFirebaseConfigured && db) {
    try {
      await remove(ref(db, `room_answers/${pin}`));
    } catch {}
  }
  return freshRoom;
}

// Tự động cho Bot trả lời câu hỏi hiện tại song song
export async function simulateBotAnswers(pin: string): Promise<void> {
  const room = await getRoomState(pin);
  if (!room || room.status !== 'QUESTION') return;

  const qIndex = room.currentQuestionIndex;
  const currentQ = QUESTIONS[qIndex];
  if (!currentQ) return;

  const existingAnswers = await getQuestionAnswers(pin, qIndex);

  const bots = Object.values(room.players || {}).filter(
    (p) => p.isBot && existingAnswers[p.id] === undefined
  );

  const botPromises = bots.map(async (bot) => {
    const chooseCorrect = Math.random() < 0.85;
    let chosenAnswer = currentQ.correctIndex;
    if (!chooseCorrect) {
      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
      chosenAnswer = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
    }

    const timeUsed = Math.min(
      Math.max(1.5 + Math.random() * (currentQ.timeLimit * 0.5), 1),
      currentQ.timeLimit - 1
    );

    return submitAnswer(pin, bot.id, qIndex, chosenAnswer, timeUsed);
  });

  await Promise.all(botPromises);
}

// Kết thúc phòng sớm
export async function finishRoomEarly(pin: string): Promise<RoomState | null> {
  if (!isFirebaseConfigured || !db) return null;
  const roomRef = ref(db, `rooms/${pin}`);
  await update(roomRef, { status: 'FINISHED', lastUpdated: Date.now() }).catch(() => {});
  const snap = await get(roomRef);
  return snap.exists() ? (snap.val() as RoomState) : null;
}

// Đóng và giải tán phòng — XÓA cả rooms và room_answers khỏi Firebase
export async function closeAndDestroyRoom(pin: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  try {
    // 1. Thông báo CLOSED cho client
    await update(ref(db, `rooms/${pin}`), { status: 'CLOSED', lastUpdated: Date.now() });
    // 2. Chờ 2s rồi xóa sạch
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await remove(ref(db, `rooms/${pin}`));
    await remove(ref(db, `room_answers/${pin}`));
  } catch (err) {
    console.warn('[closeAndDestroyRoom] Firebase delete error:', err);
  }
}

// Xóa một phòng cụ thể khỏi Firebase
export async function deleteRoomFromFirebase(pin: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await remove(ref(db, `rooms/${pin}`));
    await remove(ref(db, `room_answers/${pin}`));
  } catch (err) {
    console.warn(`[cleanup] Xóa phòng ${pin} thất bại:`, err);
  }
}
