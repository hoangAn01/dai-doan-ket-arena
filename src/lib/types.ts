export type TeamId =
  | 'tien_phong'
  | 'tri_thuc'
  | 'xung_kich'
  | 'dan_toc_ton_giao'
  | 'kieu_bao'
  | 'ban_be_quoc_te';

export interface TeamInfo {
  id: TeamId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  hexColor: string;
  bgGradient: string;
  borderClass: string;
  badgeBg: string;
  meaning: string;
  slogan: string;
  targetCount: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: TeamId;
  score: number;
  streak: number;
  lastAnswer?: number; // 0, 1, 2, 3
  lastAnswerTime?: number; // timestamp in ms
  isCorrect?: boolean;
  pointsEarned?: number;
  isBot?: boolean;
}

export interface Question {
  id: number;
  round: 1 | 2;
  text: string;
  context?: string;
  options: string[];
  correctIndex: number; // 0: A, 1: B, 2: C, 3: D
  explanation?: string;
  timeLimit: number; // seconds (15 or 60)
  imageUrl?: string;
  imageCaption?: string;
}

export type GameStatus =
  | 'LOBBY'
  | 'ROUND_TRANSITION'
  | 'QUESTION'
  | 'REVEAL'
  | 'LEADERBOARD'
  | 'FINISHED'
  | 'CLOSED';

export interface RoomState {
  pin: string;
  status: GameStatus;
  round: 1 | 2;
  currentQuestionIndex: number;
  questionStartTime: number;
  timeLimit: number;
  teams: Record<
    TeamId,
    {
      name: string;
      score: number;
      count: number;
    }
  >;
  players: Record<string, Player>;
  lastUpdated?: number;
}
