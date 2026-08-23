import { db, isFirebaseConfigured } from './firebase';
import { ref, set, onValue, get } from 'firebase/database';
import { RoomState, TeamId, Player } from './types';
import { TEAMS } from './teams';
import { calculateScore, getTeamMultiplier } from './scoring';
import { QUESTIONS } from './questions';

const LOCAL_STORAGE_KEY_PREFIX = 'arena_room_';
const BROADCAST_CHANNEL_NAME = 'arena_room_sync';

// Khởi tạo BroadcastChannel trên trình duyệt
let localBroadcast: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    localBroadcast = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {}
}

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

// Lưu trữ và đồng bộ trạng thái phòng
export async function saveRoomState(state: RoomState): Promise<void> {
  const cleanState = { ...state, lastUpdated: Date.now() };

  // 1. Luôn cập nhật LocalStorage & BroadcastChannel trước (đáp ứng tức thì 0ms)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY_PREFIX}${state.pin}`,
        JSON.stringify(cleanState)
      );
      localBroadcast?.postMessage({
        type: 'ROOM_UPDATE',
        pin: state.pin,
        state: cleanState,
      });
    } catch {}
  }

  // 2. Đồng bộ Firebase Realtime Database nếu được cấu hình
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = ref(db, `rooms/${state.pin}`);
      // Dùng Promise.race để không bị treo nếu không có mạng
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 2000)
      );
      await Promise.race([set(roomRef, cleanState), timeoutPromise]).catch(() => {});
    } catch (e) {
      console.warn('Firebase sync notice:', e);
    }
  }
}

// Lắng nghe cập nhật phòng realtime
export function subscribeToRoom(
  pin: string,
  callback: (state: RoomState | null) => void
): () => void {
  // Lấy dữ liệu ban đầu từ LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${pin}`);
      if (saved) {
        callback(JSON.parse(saved));
      } else {
        callback(null);
      }
    } catch {
      callback(null);
    }
  }

  // Nếu có cấu hình Firebase
  let unsubscribeFirebase: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = ref(db, `rooms/${pin}`);
      unsubscribeFirebase = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          callback(data as RoomState);
        }
      });
    } catch (e) {
      console.warn('Firebase subscribe notice:', e);
    }
  }

  // Lắng nghe qua BroadcastChannel giữa các Tab trình duyệt
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'ROOM_UPDATE' && event.data?.pin === pin) {
      callback(event.data.state);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${LOCAL_STORAGE_KEY_PREFIX}${pin}`) {
      if (e.newValue) {
        try {
          callback(JSON.parse(e.newValue));
        } catch {}
      } else {
        callback(null);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    localBroadcast?.addEventListener('message', handleMessage);
  }

  return () => {
    if (unsubscribeFirebase) unsubscribeFirebase();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      localBroadcast?.removeEventListener('message', handleMessage);
    }
  };
}

// Lấy phòng 1 lần
export async function getRoomState(pin: string): Promise<RoomState | null> {
  // Ưu tiên đọc từ local storage trước
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${pin}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }

  // Thử đọc từ Firebase nếu có
  if (isFirebaseConfigured && db) {
    try {
      const roomRef = ref(db, `rooms/${pin}`);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 1000)
      );
      const snapshot = await Promise.race([get(roomRef), timeoutPromise]);
      if (snapshot && 'exists' in snapshot && snapshot.exists()) {
        return snapshot.val() as RoomState;
      }
    } catch {}
  }

  return null;
}

// Người chơi tham gia phòng
export async function joinRoom(
  pin: string,
  playerName: string,
  teamId: TeamId,
  playerId?: string
): Promise<{ success: boolean; playerId: string; message?: string; room?: RoomState }> {
  const room = await getRoomState(pin);
  if (!room) {
    return { success: false, playerId: '', message: 'Không tìm thấy phòng với mã PIN này!' };
  }

  if (room.status !== 'LOBBY') {
    return { success: false, playerId: '', message: 'Trò chơi đã bắt đầu, không thể tham gia mới!' };
  }

  // Đếm số lượng thành viên hiện tại của khối
  const teamMembers = Object.values(room.players || {}).filter(
    (p) => p.teamId === teamId
  );
  
  if (teamMembers.length >= 5 && (!playerId || !room.players[playerId])) {
    return {
      success: false,
      playerId: '',
      message: 'Khối này đã đủ 5/5 người! Vui lòng chọn khối liên minh khác.',
    };
  }

  const pId = playerId || `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const updatedPlayers = { ...room.players };

  updatedPlayers[pId] = {
    id: pId,
    name: playerName.trim(),
    teamId,
    score: updatedPlayers[pId]?.score || 0,
    streak: updatedPlayers[pId]?.streak || 0,
    isBot: false,
  };

  // Cập nhật lại số lượng thành viên trong từng đội
  const updatedTeams = { ...room.teams };
  Object.keys(updatedTeams).forEach((tKey) => {
    const tid = tKey as TeamId;
    const count = Object.values(updatedPlayers).filter((p) => p.teamId === tid).length;
    updatedTeams[tid] = { ...updatedTeams[tid], count };
  });

  const updatedRoom: RoomState = {
    ...room,
    players: updatedPlayers,
    teams: updatedTeams,
  };

  await saveRoomState(updatedRoom);
  return { success: true, playerId: pId, room: updatedRoom };
}

// Người chơi gửi đáp án
export async function submitAnswer(
  pin: string,
  playerId: string,
  answerIndex: number,
  timeUsed: number
): Promise<{ success: boolean; points: number; isCorrect: boolean; newStreak: number }> {
  const room = await getRoomState(pin);
  if (!room || room.status !== 'QUESTION') {
    return { success: false, points: 0, isCorrect: false, newStreak: 0 };
  }

  const currentQ = QUESTIONS[room.currentQuestionIndex];
  if (!currentQ) {
    return { success: false, points: 0, isCorrect: false, newStreak: 0 };
  }

  const player = room.players[playerId];
  if (!player) {
    return { success: false, points: 0, isCorrect: false, newStreak: 0 };
  }

  // Nếu người chơi đã trả lời câu này rồi thì bỏ qua
  if (player.lastAnswer !== undefined) {
    return {
      success: true,
      points: player.pointsEarned || 0,
      isCorrect: player.isCorrect || false,
      newStreak: player.streak,
    };
  }

  const isCorrect = answerIndex === currentQ.correctIndex;
  const scoreResult = calculateScore(
    isCorrect,
    timeUsed,
    currentQ.timeLimit,
    player.streak || 0
  );

  const updatedPlayers = { ...room.players };
  updatedPlayers[playerId] = {
    ...player,
    lastAnswer: answerIndex,
    lastAnswerTime: Date.now(),
    isCorrect,
    pointsEarned: scoreResult.points,
    score: (player.score || 0) + scoreResult.points,
    streak: scoreResult.newStreak,
  };

  const updatedRoom: RoomState = {
    ...room,
    players: updatedPlayers,
  };

  await saveRoomState(updatedRoom);

  return {
    success: true,
    points: scoreResult.points,
    isCorrect,
    newStreak: scoreResult.newStreak,
  };
}

// Chuyển sang giai đoạn REVEAL và tính điểm Combo Đồng Thuận x2 cho các đội
export async function revealAnswersAndScoreTeams(pin: string): Promise<RoomState | null> {
  const room = await getRoomState(pin);
  if (!room) return null;

  const currentQ = QUESTIONS[room.currentQuestionIndex];
  const isRound2 = currentQ.round === 2;
  const updatedTeams = { ...room.teams };

  const teamKeys: TeamId[] = [
    'tien_phong',
    'tri_thuc',
    'xung_kich',
    'dan_toc_ton_giao',
    'kieu_bao',
    'ban_be_quoc_te',
  ];

  teamKeys.forEach((teamId) => {
    const teamMembers = Object.values(room.players || {}).filter(
      (p) => p.teamId === teamId
    );

    // Tính tổng điểm vòng này của các thành viên trong đội
    let questionTeamPoints = teamMembers.reduce(
      (sum, p) => sum + (p.pointsEarned || 0),
      0
    );

    if (isRound2) {
      const multiplierData = getTeamMultiplier(teamMembers, 5);
      if (multiplierData.isConsensus) {
        questionTeamPoints = Math.round(questionTeamPoints * 2.0);
      }
    }

    const currentScore = updatedTeams[teamId]?.score || 0;
    updatedTeams[teamId] = {
      ...updatedTeams[teamId],
      score: currentScore + questionTeamPoints,
      count: teamMembers.length,
    };
  });

  const updatedRoom: RoomState = {
    ...room,
    status: 'REVEAL',
    teams: updatedTeams,
  };

  await saveRoomState(updatedRoom);
  return updatedRoom;
}

// Bắt đầu câu hỏi tiếp theo
export async function startNextQuestion(pin: string): Promise<RoomState | null> {
  const room = await getRoomState(pin);
  if (!room) return null;

  let nextIndex = room.currentQuestionIndex;
  let nextRound = room.round;

  if (room.status !== 'LOBBY') {
    nextIndex = room.currentQuestionIndex + 1;
  }

  if (nextIndex >= QUESTIONS.length) {
    // Đã kết thúc toàn bộ trận đấu
    const finishedRoom: RoomState = {
      ...room,
      status: 'FINISHED',
    };
    await saveRoomState(finishedRoom);
    return finishedRoom;
  }

  const question = QUESTIONS[nextIndex];
  nextRound = question.round;

  // Reset câu trả lời của tất cả người chơi cho câu mới
  const resetPlayers = { ...room.players };
  Object.keys(resetPlayers).forEach((pId) => {
    resetPlayers[pId] = {
      ...resetPlayers[pId],
      lastAnswer: undefined,
      lastAnswerTime: undefined,
      isCorrect: undefined,
      pointsEarned: undefined,
    };
  });

  const updatedRoom: RoomState = {
    ...room,
    status: 'QUESTION',
    round: nextRound,
    currentQuestionIndex: nextIndex,
    questionStartTime: Date.now(),
    timeLimit: question.timeLimit,
    players: resetPlayers,
  };

  await saveRoomState(updatedRoom);
  return updatedRoom;
}

// Mô phỏng 30 Bot tham gia lớp học (5 bot mỗi khối)
export async function populateBotPlayers(pin: string): Promise<RoomState | null> {
  const room = await getRoomState(pin);
  if (!room) return null;

  const botNames: Record<TeamId, string[]> = {
    tien_phong: ['Nguyễn Văn Công', 'Trần Thị Nông', 'Lê Bền Vững', 'Phạm Quyết Thắng', 'Hoàng Tiên Phong'],
    tri_thuc: ['GS. Đỗ Khai Phóng', 'TS. Nguyễn Sáng Tạo', 'Vũ Tinh Hoa', 'Bùi Trí Tuệ', 'Lý Kiến Thiết'],
    xung_kich: ['Đặng Xung Kích', 'Ngô Tuổi Trẻ', 'Lưu Bứt Phá', 'Dương Nhiệt Huyết', 'Phan Khát Vọng'],
    dan_toc_ton_giao: ['Y-Bling Êđê', 'Lò Văn Thái', 'Thạch Sa-Rương', 'Nguyễn Hòa Hợp', 'Lê Đoàn Kết'],
    kieu_bao: ['Alex Nguyễn (Mỹ)', 'Jean-Luc Trần (Pháp)', 'Elena Vũ (Nga)', 'Kenji Lê (Nhật)', 'Minh Kiều Tâm'],
    ban_be_quoc_te: ['John Peace (UN)', 'Marie Curie', 'Nelson Mandela', 'Hans Unity', 'Oliver Friendship'],
  };

  const updatedPlayers = { ...room.players };
  const teamKeys = Object.keys(botNames) as TeamId[];

  teamKeys.forEach((teamId) => {
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
  teamKeys.forEach((teamId) => {
    const count = Object.values(updatedPlayers).filter((p) => p.teamId === teamId).length;
    updatedTeams[teamId] = { ...updatedTeams[teamId], count };
  });

  const updatedRoom: RoomState = {
    ...room,
    players: updatedPlayers,
    teams: updatedTeams,
  };

  await saveRoomState(updatedRoom);
  return updatedRoom;
}

// Tự động cho Bot trả lời câu hỏi hiện tại
export async function simulateBotAnswers(pin: string): Promise<void> {
  const room = await getRoomState(pin);
  if (!room || room.status !== 'QUESTION') return;

  const currentQ = QUESTIONS[room.currentQuestionIndex];
  if (!currentQ) return;

  const bots = Object.values(room.players || {}).filter(
    (p) => p.isBot && p.lastAnswer === undefined
  );

  for (const bot of bots) {
    // 85% chọn đúng, 15% chọn ngẫu nhiên
    const chooseCorrect = Math.random() < 0.85;
    let chosenAnswer = currentQ.correctIndex;
    if (!chooseCorrect) {
      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
      chosenAnswer = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
    }

    const timeUsed = Math.min(
      Math.max(1.5 + Math.random() * (currentQ.timeLimit * 0.6), 1),
      currentQ.timeLimit - 1
    );

    await submitAnswer(pin, bot.id, chosenAnswer, timeUsed);
  }
}
