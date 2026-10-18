import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

let changed = 0;

// 1. حقن onStopTrip في توقيع toggleVoiceControl
const toggleRegex = /export function toggleVoiceControl\(\{([^}]+)\}\)/;
if (toggleRegex.test(c)) {
  c = c.replace(toggleRegex, (match, args) => {
    if (!args.includes('onStopTrip')) {
      // نضيفها بعد onStartTrip
      const newArgs = args.replace('onStartTrip,', 'onStartTrip, onStopTrip,');
      // إذا لم نجد onStartTrip، نضيفها في البداية
      return `export function toggleVoiceControl({${args.includes('onStartTrip') ? newArgs : 'onStopTrip, ' + args}})`; 
    }
    return match;
  });
  changed++;
  console.log('TOGGLE: PATCHED');
}

// 2. حقن onStopTrip في توقيع executeVoiceCommand
const execRegex = /async function executeVoiceCommand\(\s*text\s*,\s*\{([^}]+)\}\s*\)/;
if (execRegex.test(c)) {
  c = c.replace(execRegex, (match, args) => {
    if (!args.includes('onStopTrip')) {
      const newArgs = args.replace('onStartTrip,', 'onStartTrip, onStopTrip,');
      return `async function executeVoiceCommand(text, {${args.includes('onStartTrip') ? newArgs : 'onStopTrip, ' + args}})`; 
    }
    return match;
  });
  changed++;
  console.log('EXEC: PATCHED');
}

// 3. التأكد من تمرير onStopTrip عند استدعاء executeVoiceCommand
const callRegex = /executeVoiceCommand\(\s*speechText\s*,\s*\{([^}]+)\}\s*\)/;
if (callRegex.test(c)) {
  c = c.replace(callRegex, (match, args) => {
    if (!args.includes('onStopTrip')) {
      const newArgs = args.replace('onStartTrip,', 'onStartTrip, onStopTrip,');
      return `executeVoiceCommand(speechText, {${args.includes('onStartTrip') ? newArgs : 'onStopTrip, ' + args}})`; 
    }
    return match;
  });
  changed++;
  console.log('CALL: PATCHED');
}

fs.writeFileSync(f, c, 'utf8');
console.log('TOTAL_CHANGES:', changed);