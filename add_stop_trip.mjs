import fs from 'fs';

// ===== 1. تحديث App.jsx لتمرير دالة stopTrip =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('onStopTrip: stopTrip')) {
  app = app.replace(
    'onStartTrip: startTrip,',
    'onStartTrip: startTrip,\n      onStopTrip: stopTrip,'
  );
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: onStopTrip ADDED');
}

// ===== 2. تحديث voiceControl.js للتعرف على أمر الإلغاء =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// 2a. تحديث توقيع الدالة
vc = vc.replace(
  "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch, onStateChange }) {",
  "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch, onStateChange }) {"
);

// 2b. تمرير المتغير للدالة التنفيذية
vc = vc.replace(
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch })",
  "executeVoiceCommand(speechText, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch })"
);

vc = vc.replace(
  "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch }) {",
  "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch }) {"
);

// 2c. إضافة منطق إلغاء الرحلة (قبل منطق بدء الرحلة)
const stopBlock = `  // ===== STOP TRIP =====
  if (text.includes('\\u0627\\u0644\\u063A\\u0627\\u0621') || text.includes('\\u0627\\u0644\\u063A\\u064A') || text.includes('\\u0627\\u0648\\u0642\\u0641') || text.includes('\\u0648\\u0642\\u0641') || text.includes('\\u0627\\u0646\\u0647\\u064A') || text.includes('\\u062E\\u0644\\u0635')) {
    if (typeof onStopTrip === 'function') {
      onStopTrip()
      say('\\u062A\\u0645 \\u0625\\u0644\\u063A\\u0627\\u0621 \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629')
    }
    return
  }

  // ===== START TRIP =====`;

if (vc.includes('// ===== START TRIP =====')) {
  vc = vc.replace('// ===== START TRIP =====', stopBlock);
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE_CONTROL: STOP_TRIP ADDED');
} else {
  console.log('VOICE_CONTROL: START_TRIP MARKER NOT FOUND');
}