import fs from 'fs';

// ===== 1. Create gamification.js =====
const gfPath = 'D:/RAHAL/src/lib/gamification.js';
const gfCode = `const STATS_KEY = 'rahal.userStats';
export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
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
}`;
fs.writeFileSync(gfPath, gfCode, 'utf8');

// ===== 2. Patch App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// A) Import
if (!app.includes('gamification.js')) {
  app = app.replace("import { searchPlaces } from './lib/nominatim.js'", "import { searchPlaces } from './lib/nominatim.js'\nimport { loadStats, addPoints, getLevelName } from './lib/gamification.js'");
}

// B) State
if (!app.includes('userStats')) {
  app = app.replace("const [reports, setReports] = useState([])", "const [reports, setReports] = useState([])\n  const [userStats, setUserStats] = useState(() => loadStats())");
}

// C) Add points in handleAddReport
const handleAddMatch = "const rep = await addReport(typeId, coords)";
if (app.includes(handleAddMatch) && !app.includes('setUserStats(prev => addPoints(10, prev))')) {
  app = app.replace(handleAddMatch, handleAddMatch + "\n    setUserStats(prev => addPoints(10, prev))");
}

// D) Add points in Voice submitReport
const voiceSubmitMatch = "const rep = await addReport(type, gps)";
if (app.includes(voiceSubmitMatch) && !app.includes('setUserStats(prev => addPoints(10, prev))')) {
  app = app.replace(voiceSubmitMatch, voiceSubmitMatch + "\n        setUserStats(prev => addPoints(10, prev))");
}

// E) Inject UI Badge
const brandMatch = "</div>\n        <div className=\"top-actions\">";
if (app.includes(brandMatch) && !app.includes('user-stats-badge')) {
  const badgeUI = `</div>
        <div className="user-stats-badge" title="نقاطك">
          <span className="stats-level">{getLevelName(userStats.level)}</span>
          <span className="stats-points">{userStats.points} <small>نقطة</small></span>
        </div>
        <div className="top-actions">`;
  app = app.replace(brandMatch, badgeUI);
}

fs.writeFileSync(appPath, app, 'utf8');

// ===== 3. Patch App.css =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.user-stats-badge')) {
  css += `\n
/* GAMIFICATION BADGE */
.user-stats-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(2, 132, 199, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  margin-right: auto;
  margin-left: 12px;
}
.stats-level {
  font-family: 'Tajawal', sans-serif;
  font-weight: 800;
  font-size: 13px;
  color: #0284c7;
}
.stats-points {
  font-family: 'Tajawal', sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: #0f172a;
  margin-top: -2px;
}
.stats-points small {
  font-weight: 600;
  color: #64748b;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
}
console.log('DONE');