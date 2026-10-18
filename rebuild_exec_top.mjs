import fs from 'fs';

const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 1. البحث عن بداية دالة executeVoiceCommand
const startIdx = vc.indexOf('async function executeVoiceCommand(text, ctx) {');
if (startIdx === -1) { console.log('FUNCTION_NOT_FOUND'); process.exit(1); }

// 2. البحث عن نهاية كتلة التفكيك
const destructureMarker = 'const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx';
const destructureIdx = vc.indexOf(destructureMarker, startIdx);
if (destructureIdx === -1) { console.log('DESTRUCTURE_NOT_FOUND'); process.exit(1); }

// 3. بناء الجزء الأول الصحيح (من بداية الدالة إلى ما بعد التفكيك + سطر map)
const newTop = `async function executeVoiceCommand(text, ctx) {
  const { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, tripActive, onNearbySearch, onFreeSearch } = ctx
  const map = getMap ? getMap() : null

  // ===== CANCEL TRIP (Smart) =====
  const cancelRegex = /\\u0644\\u063A|\\u0627\\u0644\\u063A|\\u0648\\u0642\\u0641|\\u0648\\u0643\\u0641|\\u0627\\u0646\\u0647\\u064A|\\u062E\\u0644\\u0627\\u0635|\\u062E\\u0644\\u0635|\\u0643\\u0646\\u0633\\u0644|\\u0643\\u0627\\u0646\\u0633\\u0644/;
  const isMisheard = (text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647')) && tripActive === true;
  
  if (cancelRegex.test(text) || isMisheard) {
    console.log('CANCEL_TRIP_TRIGGERED:', text, '| isMisheard:', isMisheard);
    if (typeof onStopTrip === 'function') {
      onStopTrip();
      setTimeout(() => { say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629'); }, 600);
    }
    return;
  }

  console.log('VOICE_INPUT:', JSON.stringify(text))
`;

// 4. البحث عن سطر "console.log('VOICE_INPUT:', ...)" القديم
const voiceInputIdx = vc.indexOf("console.log('VOICE_INPUT:'", destructureIdx);
if (voiceInputIdx === -1) { console.log('VOICE_INPUT_LOG_NOT_FOUND'); process.exit(1); }

// نهاية سطر console.log (نبحث عن نهاية السطر)
const voiceInputEnd = vc.indexOf('\n', voiceInputIdx) + 1;

// 5. استبدال كل شيء من بداية الدالة إلى نهاية console.log
vc = vc.substring(0, startIdx) + newTop + vc.substring(voiceInputEnd);

fs.writeFileSync(vcPath, vc, 'utf8');
console.log('DONE');