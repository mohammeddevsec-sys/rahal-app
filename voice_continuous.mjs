import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// 1) continuous = true
if (c.includes('recognition.continuous = false')) {
  c = c.replace('recognition.continuous = false', 'recognition.continuous = true');
  changes++;
  console.log('CONTINUOUS: true');
}

// 2) onend: restart if still listening
const oldOnEnd = `  recognition.onend = function () {
    isListening = false
    if (onStateChange) onStateChange(false)
  }`;

const newOnEnd = `  recognition.onend = function () {
    if (isListening) {
      // continuous mode: restart automatically
      try { recognition.start() } catch { /* noop */ }
      return
    }
    if (onStateChange) onStateChange(false)
  }`;

if (c.includes(oldOnEnd)) {
  c = c.replace(oldOnEnd, newOnEnd);
  changes++;
  console.log('ONEND: AUTO_RESTART_IF_LISTENING');
} else {
  console.log('ONEND: PATTERN_NOT_FOUND');
}

// 3) أضف إعادة تشغيل recognition بعد IGNORED_RANA
const oldIgnore = `      console.log('IGNORED_RANA:', text);
      return;`;

const newIgnore = `      console.log('IGNORED_RANA:', text);
      // أعِد الاستماع فوراً (لأن continuous قد يوقفه)
      try { recognition.start() } catch { /* noop */ }
      return;`;

if (c.includes(oldIgnore)) {
  c = c.replace(oldIgnore, newIgnore);
  changes++;
  console.log('IGNORE: RESTART_RECOGNITION');
} else {
  console.log('IGNORE: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);