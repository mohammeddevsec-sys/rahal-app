import fs from 'fs';

// ============ 1) voiceControl.js: تجميع الكلام ============
const vf = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vf, 'utf8');

// 1a) فعّل interimResults
v = v.replace(
  "recognition.interimResults = false",
  "recognition.interimResults = true"
);

// 1b) غيّر onresult ليجمع النص وينتظر السكوت
const oldOnResult = `  recognition.onresult = function (event) {
    const speechText = event.results[0][0].transcript.trim().toLowerCase()
    console.log('VOICE:', speechText)
    executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })
  }`;

const newOnResult = `  let accumText = ''
  let accumTimer = null

  recognition.onresult = function (event) {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript
      if (event.results[i].isFinal) final += chunk
      else interim += chunk
    }
    if (final) accumText += ' ' + final
    else if (interim) accumText += ' ' + interim
    accumText = accumText.trim()
    console.log('VOICE_PARTIAL:', accumText)

    if (accumTimer) clearTimeout(accumTimer)
    accumTimer = setTimeout(() => {
      const speechText = accumText.trim().toLowerCase()
      accumText = ''
      if (!speechText) return
      console.log('VOICE_FINAL:', speechText)
      executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })
    }, 1500)
  }`;

if (v.includes(oldOnResult)) {
  v = v.replace(oldOnResult, newOnResult);
  console.log('ACCUMULATE: ADDED');
} else {
  console.log('ACCUMULATE: PATTERN_NOT_FOUND');
}

fs.writeFileSync(vf, v, 'utf8');

// ============ 2) App.jsx: إصلاح stroke ============
const af = 'D:/RAHAL/src/App.jsx';
let a = fs.readFileSync(af, 'utf8');

// ابحث عن كل stroke-* داخل JSX (لا داخل السلاسل النصية)
const patterns = [
  ['stroke-width', 'strokeWidth'],
  ['stroke-linecap', 'strokeLinecap'],
  ['stroke-linejoin', 'strokeLinejoin'],
  ['fill-rule', 'fillRule'],
  ['clip-rule', 'clipRule'],
];

let totalFixed = 0;
for (const [dash, camel] of patterns) {
  // استبدل فقط عندما يسبقه مسافة ويكون داخل JSX (نتبع بعلامة =)
  const regex = new RegExp('\\s' + dash + '=', 'g');
  const before = a;
  a = a.replace(regex, ' ' + camel + '=');
  if (a !== before) {
    const diff = (before.match(regex) || []).length;
    totalFixed += diff;
    console.log(dash + ': FIXED ' + diff);
  }
}

fs.writeFileSync(af, a, 'utf8');
console.log('TOTAL_STROKE_FIXED:', totalFixed);
console.log('DONE');