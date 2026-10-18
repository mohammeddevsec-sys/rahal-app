import fs from 'fs';
const vc = fs.readFileSync('D:/RAHAL/src/lib/voiceControl.js', 'utf8');

// 1. هل tripActive مفكك في executeVoiceCommand؟
const execBody = vc.match(/const \{[^}]+\} = ctx/);
console.log('DESTRUCTURED:', execBody ? execBody[0] : 'NOT_FOUND');

// 2. طباعة بلوك الإلغاء
const idx = vc.indexOf('// ===== CANCEL TRIP');
if (idx !== -1) {
  const endIdx = vc.indexOf('return;', idx);
  console.log('--- CANCEL BLOCK ---');
  console.log(vc.substring(idx, endIdx + 7));
}

// 3. هل tripActive ممرر في App.jsx؟
const app = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');
console.log('--- APP HAS tripActive:', app.includes('tripActive: tripActive'));