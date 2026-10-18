import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

// ابحث عن كتلة onresult القديمة (مع accumText) واستبدلها
const oldBlock = `  recognition.onresult = function (event) {
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

const newBlock = `  recognition.onresult = function (event) {
    // خذ آخر نتيجة فقط (تحتوي النص الكامل التراكمي)
    const last = event.results[event.results.length - 1]
    const latest = (last && last[0] && last[0].transcript) ? last[0].transcript.trim() : ''
    if (!latest) return
    accumText = latest
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

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  console.log('RESULT_HANDLER: FIXED');
} else {
  console.log('RESULT_HANDLER: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');