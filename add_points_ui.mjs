import fs from 'fs';

// ===== 1. Fix gamification.js (empty catch) =====
const gfPath = 'D:/RAHAL/src/lib/gamification.js';
let gf = fs.readFileSync(gfPath, 'utf8');
gf = gf.replace(/catch\s*\{\s*\}/g, 'catch { /* noop */ }');
fs.writeFileSync(gfPath, gf, 'utf8');

// ===== 2. Fix App.jsx =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// 2a. Add popup state after userStats
if (!app.includes('showPointsPopup')) {
  app = app.replace(
    'const [userStats, setUserStats] = useState(() => loadStats())',
    'const [userStats, setUserStats] = useState(() => loadStats())\n  const [showPointsPopup, setShowPointsPopup] = useState(false)'
  );
}

// 2b. Create a popup helper before handleAddReport
if (!app.includes('triggerPointsPopup')) {
  const popupFn = `
  const triggerPointsPopup = useCallback(() => {
    setShowPointsPopup(true)
    setTimeout(() => setShowPointsPopup(false), 2500)
  }, [])

  `;
  // Insert before handleAddReport
  app = app.replace('const handleAddReport = useCallback', popupFn + 'const handleAddReport = useCallback');
}

// 2c. In handleAddReport: add points + popup
const handleMatch = /const rep = await addReport\(typeId, coords\)/;
if (handleMatch.test(app) && !app.includes('triggerPointsPopup()')) {
  app = app.replace(
    handleMatch,
    `const rep = await addReport(typeId, coords)
    setUserStats(prev => addPoints(10, prev))
    triggerPointsPopup()`
  );
}

// 2d. In voice submitReport: add points + popup
const voiceMatch = /const rep = await addReport\(type, gps\)/;
if (voiceMatch.test(app) && !app.includes('triggerPointsPopup()')) {
  app = app.replace(
    voiceMatch,
    `const rep = await addReport(type, gps)
        setUserStats(prev => addPoints(10, prev))
        triggerPointsPopup()`
  );
}

// 2e. Add popup JSX before closing main return (search for `</section>` at end of topbar or near nearby-alert)
if (!app.includes('points-popup-glow')) {
  const popupJSX = `
        {showPointsPopup && (
          <div className="points-popup-glow">
            <div className="popup-content">
              <span className="popup-star">⭐</span>
              <div className="popup-info">
                <strong>+10 نقاط</strong>
                <small>شكراً لتنبيه الطريق</small>
              </div>
            </div>
          </div>
        )}
`;
  // Insert before nearby-alert or before closing </main>
  if (app.includes('{nearbyReport &&')) {
    app = app.replace('{nearbyReport &&', popupJSX + '\n        {nearbyReport &&');
  } else if (app.includes('</main>')) {
    app = app.replace('</main>', popupJSX + '\n      </main>');
  }
}

fs.writeFileSync(appPath, app, 'utf8');

// ===== 3. Add CSS =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.points-popup-glow')) {
  css += `

/* ===== GAMIFICATION POPUP ===== */
.points-popup-glow {
  position: absolute;
  bottom: 220px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(234, 179, 8, 0.4);
  padding: 14px 24px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35), 0 0 30px rgba(234, 179, 8, 0.25);
  animation: popInFadeOut 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.popup-content {
  display: flex;
  align-items: center;
  gap: 14px;
  direction: rtl;
}
.popup-star {
  font-size: 28px;
  animation: spinStar 0.6s ease-out;
  display: inline-block;
}
.popup-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}
.popup-info strong {
  color: #eab308;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  font-family: 'Tajawal', sans-serif;
}
.popup-info small {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
  font-family: 'Tajawal', sans-serif;
}
@keyframes popInFadeOut {
  0% { opacity: 0; transform: translate(-50%, 40px) scale(0.9); }
  12% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  80% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
}
@keyframes spinStar {
  0% { transform: scale(0.5) rotate(-180deg); }
  100% { transform: scale(1) rotate(0deg); }
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
}

console.log('DONE');