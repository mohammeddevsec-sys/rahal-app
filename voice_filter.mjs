import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// 1) فلترة أوامر الرحلة (صوت رنا) في بداية executeVoiceCommand
const oldStart = "  const map = getMap ? getMap() : null\n  console.log('VOICE_INPUT:', JSON.stringify(text))";
const oldStartCR = "  const map = getMap ? getMap() : null\r\n  console.log('VOICE_INPUT:', JSON.stringify(text))";

const filterBlock = `  // ignore Rana's own navigation phrases (mic echo)
  const ranaFilter = [
    '\\u0627\\u0646\\u0639\\u0637\\u0641', '\\u0627\\u0644\\u062A\\u0632\\u0645', '\\u0627\\u062A\\u062C\\u0647',
    '\\u0639\\u0644\\u0649 \\u0627\\u0644\\u0637\\u0631\\u064A\\u0642', '\\u062E\\u0630 \\u0627\\u0644\\u0645\\u062E\\u0631\\u062C',
    '\\u0627\\u0644\\u0622\\u0646', '\\u0628\\u0639\\u062F', '\\u0645\\u062A\\u0631', '\\u0648\\u0635\\u0644\\u062A',
    '\\u0627\\u0644\\u062D\\u0627\\u0641\\u0629', '\\u0645\\u0646\\u0637\\u0642\\u0629', '\\u0645\\u062A\\u0648\\u0633\\u0637',
    '\\u0628\\u0627\\u0644\\u0642\\u0631\\u0628', '\\u0642\\u0627\\u062F\\u0645', '\\u0642\\u0627\\u062F\\u0645\\u0629',
  ];
  for (const rf of ranaFilter) {
    if (text.includes(rf) && !text.includes('\\u0627\\u0643\\u0648') && !text.includes('\\u0633\\u064A\\u0637\\u0631\\u0629') && !text.includes('\\u062A\\u0641\\u062A\\u064A\\u0634') && !text.includes('\\u062D\\u0627\\u062F\\u062B')) {
      console.log('IGNORED_RANA:', text);
      return;
    }
  }

  const map = getMap ? getMap() : null
  console.log('VOICE_INPUT:', JSON.stringify(text))`;

if (c.includes(oldStart)) {
  c = c.replace(oldStart, filterBlock);
  changes++;
  console.log('FILTER: ADDED (LF)');
} else if (c.includes(oldStartCR)) {
  c = c.replace(oldStartCR, filterBlock);
  changes++;
  console.log('FILTER: ADDED (CRLF)');
} else {
  console.log('FILTER: NOT_FOUND');
}

// 2) أوقف رنا قبل بدء الاستماع
const oldStop = "  stopSpeaking()\n  say('\\u0623\\u0647\\u0644\\u0627 \\u0628\\u0643')";
const oldStopCR = "  stopSpeaking()\r\n  say('\\u0623\\u0647\\u0644\\u0627 \\u0628\\u0643')";

if (c.includes(oldStop) || c.includes(oldStopCR)) {
  console.log('STOP_SPEAKING: ALREADY EXISTS');
} else {
  console.log('STOP_SPEAKING: CHECK_MANUALLY');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);