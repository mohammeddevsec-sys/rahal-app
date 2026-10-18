const STATS_KEY = 'rahal.userStats';
export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { points: 0, level: 1, reportsCount: 0 };
}
export function addPoints(amount, currentStats) {
  const newPoints = currentStats.points + amount;
  const newReports = currentStats.reportsCount + 1;
  const newLevel = calculateLevel(newPoints);
  const newStats = { points: newPoints, level: newLevel, reportsCount: newReports };
  localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  return newStats;
}
function calculateLevel(points) {
  if (points >= 1000) return 5;
  if (points >= 600) return 4;
  if (points >= 300) return 3;
  if (points >= 100) return 2;
  return 1;
}
export function getLevelName(level) {
  const names = { 1: 'مبتدئ', 2: 'مساعد', 3: 'خبير', 4: 'كابتن', 5: 'أسطورة' };
  return names[level] || 'مبتدئ';
}