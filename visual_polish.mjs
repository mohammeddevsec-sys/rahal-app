import fs from 'fs';

// ===== 1. استبدال أيقونات شريط التنقل السفلي بأيقونات SVG احترافية =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const homeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
const starSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const pinSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const moreSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;

app = app.replace("<span>{'\\u2302'}</span>", homeSvg);
app = app.replace("<span>{'\\u2605'}</span>", starSvg);
app = app.replace("<span>{'\\u2316'}</span>", pinSvg);
app = app.replace("<span>{'\\u2630'}</span>", moreSvg);

fs.writeFileSync(appPath, app, 'utf8');
console.log('APP_JSX: SVG ICONS REPLACED');

// ===== 2. إضافة تأثير النبض الزجاجي لزر الميكروفون =====
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('/* MIC_PULSE_RING */')) {
  css += `

/* MIC_PULSE_RING */
.map-controls .mic-btn.mic-active {
  position: relative !important;
}
.map-controls .mic-btn.mic-active::before,
.map-controls .mic-btn.mic-active::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid rgba(249, 115, 22, 0.7);
  animation: micRingPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}
.map-controls .mic-btn.mic-active::after {
  animation-delay: 0.75s;
}
@keyframes micRingPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('CSS: MIC PULSE ADDED');
}

// ===== 3. تعديل CSS الأيقونات السفلية لتستوعب SVG =====
if (!css.includes('/* BOTTOM_NAV_SVG_FIX */')) {
  css += `

/* BOTTOM_NAV_SVG_FIX */
.bottom-nav button svg {
  width: 26px !important;
  height: 26px !important;
  color: #64748b !important;
  transition: all 0.2s ease !important;
}
.bottom-nav button.active svg {
  color: #0b63ce !important;
  transform: scale(1.1) !important;
}
.bottom-nav button small {
  margin-top: 4px !important;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('CSS: BOTTOM NAV SVG FIX ADDED');
}

console.log('DONE');