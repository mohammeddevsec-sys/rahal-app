import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// 1) ضبط الأوقات: 4 ثوانٍ نافذة + 700ms صمت + 2.5s cooldown
c = c.replace(/const MIC_WINDOW_MS = \d+/, 'const MIC_WINDOW_MS = 4000');
c = c.replace(/const SILENCE_MS = \d+/, 'const SILENCE_MS = 700');
if (!c.includes('COOLDOWN_MS')) {
  c = c.replace(
    "const SILENCE_MS = 700",
    "const SILENCE_MS = 700\nconst COOLDOWN_MS = 2500"
  );
  changes++;
  console.log('CONSTANTS: 4000/700/2500');
}

// 2) أضف متغير cooldown
if (!c.includes('let lastCommandAt')) {
  c = c.replace(
    "let accumText = ''",
    "let accumText = ''\nlet lastCommandAt = 0"
  );
  changes++;
  console.log('COOLDOWN_VAR: ADDED');
}

// 3) فلتر cooldown في onresult قبل المعالجة
const oldExecute = `    silenceTimer = setTimeout(() => {
      const speechText = accumText.trim().toLowerCase()
      accumText = ''
      if (!speechText) return
      console.log('VOICE_FINAL:', speechText)
      executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })
    }, SILENCE_MS)`;

const newExecute = `    silenceTimer = setTimeout(() => {
      const speechText = accumText.trim().toLowerCase()
      accumText = ''
      if (!speechText) return
      const now = Date.now()
      if (now - lastCommandAt < COOLDOWN_MS) {
        console.log('COOLDOWN_SKIP:', speechText)
        return
      }
      lastCommandAt = now
      console.log('VOICE_FINAL:', speechText)
      executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })
    }, SILENCE_MS)`;

if (c.includes(oldExecute)) {
  c = c.replace(oldExecute, newExecute);
  changes++;
  console.log('COOLDOWN: ENFORCED');
} else {
  console.log('COOLDOWN: PATTERN_NOT_FOUND');
}

// 4) أعد ترتيب الأوامر: Reports قبل Nearby Search
// استخرج كتلة Reports
const reportsStart = c.indexOf('  // ===== REPORTS =====');
const reportsEnd = c.lastIndexOf('navigator.geolocation.getCurrentPosition');
if (reportsStart === -1 || reportsEnd === -1) {
  console.log('REORDER: BLOCKS_NOT_FOUND');
} else {
  // احذف كتلة Nearby + Free Search + Reports (سنعيد ترتيبها)
  const nearbyStart = c.indexOf('  // ===== NEARBY SEARCH =====');
  if (nearbyStart === -1) {
    console.log('REORDER: NEARBY_NOT_FOUND');
  } else {
    // اقطع من بداية nearby إلى نهاية دالة executeVoiceCommand
    const afterReports = c.indexOf('\n}\n', reportsEnd);
    if (afterReports === -1) {
      console.log('REORDER: END_NOT_FOUND');
    } else {
      const beforeBlock = c.substring(0, nearbyStart);
      const reportsBlock = c.substring(reportsStart, afterReports + 3);
      const nearbyBlock = c.substring(nearbyStart, reportsStart);
      const rest = c.substring(afterReports + 3);
      
      // أعد الترتيب: reports أولاً، ثم nearby/free
      c = beforeBlock + reportsBlock + '\n' + nearbyBlock + rest;
      changes++;
      console.log('REORDER: REPORTS_BEFORE_NEARBY');
    }
  }
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);