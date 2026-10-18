import fs from 'fs';

// ===== 1. إصلاح voiceControl.js (تعريف onStopTrip) =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 1a. تحديث توقيع toggleVoiceControl
const toggleRegex = /export function toggleVoiceControl\(\{([^}]+)\}\)/;
const toggleMatch = vc.match(toggleRegex);
if (toggleMatch) {
  let args = toggleMatch[1];
  if (!args.includes('onStopTrip')) {
    args = args.replace('onStartTrip,', 'onStartTrip, onStopTrip,');
    vc = vc.replace(toggleRegex, `export function toggleVoiceControl({${args}})`);
    console.log('TOGGLE_SIGNATURE: FIXED');
  }
}

// 1b. تحديث استدعاء executeVoiceCommand
vc = vc.replace(/executeVoiceCommand\(speechText,\s*\{([^}]+)\}\)/g, (m, args) => {
  if (!args.includes('onStopTrip')) {
    args = args.replace('onStartTrip,', 'onStartTrip, onStopTrip,');
  }
  return `executeVoiceCommand(speechText, {${args}})`;
});
console.log('EXECUTE_CALL: FIXED');

// 1c. تحديث توقيع executeVoiceCommand
const execRegex = /async function executeVoiceCommand\(text,\s*\{([^}]+)\}\)/;
const execMatch = vc.match(execRegex);
if (execMatch) {
  let args = execMatch[1];
  if (!args.includes('onStopTrip')) {
    args = args.replace('onStartTrip,', 'onStartTrip, onStopTrip,');
    vc = vc.replace(execRegex, `async function executeVoiceCommand(text, {${args}})`);
    console.log('EXECUTE_SIGNATURE: FIXED');
  }
}

fs.writeFileSync(vcPath, vc, 'utf8');

// ===== 2. إصلاح App.jsx (تحذير الـ dependencies) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

const depsRegex = /\}, \[routeInfo, startTrip, handlePickCategory, handleVoiceFreeSearch\]\)/;
if (depsRegex.test(app)) {
  app = app.replace(depsRegex, '}, [routeInfo, startTrip, stopTrip, handlePickCategory, handleVoiceFreeSearch])');
  console.log('APP_DEPS: FIXED');
} else {
  console.log('APP_DEPS: NOT_FOUND');
}

fs.writeFileSync(appPath, app, 'utf8');
console.log('DONE');