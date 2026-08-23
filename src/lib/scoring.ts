// Logic tính điểm cá nhân: Tốc độ + Streak
export function calculateScore(
  isCorrect: boolean,
  timeUsed: number,
  timeLimit: number,
  streak: number
) {
  if (!isCorrect) {
    return { points: 0, newStreak: 0 };
  }
  // Tốc độ càng nhanh điểm càng cao (tối đa 1000đ, tối thiểu 500đ khi sát giờ)
  const clampedTimeUsed = Math.min(Math.max(timeUsed, 0.5), timeLimit);
  const speedBonus = Math.max(0, 1 - (clampedTimeUsed / timeLimit) / 2);
  const basePoints = Math.round(1000 * speedBonus);
  const streakBonus = Math.min(streak * 100, 500);
  
  return {
    points: basePoints + streakBonus,
    newStreak: streak + 1,
    basePoints,
    streakBonus,
  };
}

// Logic tính Combo Đồng Thuận x2 cho toàn đội (Vòng 2: Cả 5 thành viên cùng chọn đúng)
export function getTeamMultiplier(
  answers: { isCorrect?: boolean; lastAnswer?: number }[],
  targetTeamSize: number = 5
): { multiplier: number; isConsensus: boolean; correctCount: number } {
  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  // Nếu đội có đủ ít nhất targetTeamSize người và tất cả đều đúng
  const isConsensus =
    answers.length >= targetTeamSize && correctCount === answers.length;

  return {
    multiplier: isConsensus ? 2.0 : 1.0,
    isConsensus,
    correctCount,
  };
}
