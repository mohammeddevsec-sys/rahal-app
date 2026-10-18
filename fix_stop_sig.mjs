import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');

let changed = 0;

// 1. تحديث توقيع toggleVoiceControl
const oldToggle = "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch, onStateChange }) {";
const newToggle = "export function toggleVoiceControl({ getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch, onStateChange }) {";
if (c.includes(oldToggle)) {
  c = c.replace(oldToggle, newToggle);
  changed++;
  console.log('TOGGLE_SIGNATURE: FIXED');
}

// 2. تحديث توقيع executeVoiceCommand
const oldExec = "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, hasRoute, onNearbySearch, onFreeSearch }) {";
const newExec = "async function executeVoiceCommand(text, { getMap, setActiveTab, submitReport, onStartTrip, onStopTrip, hasRoute, onNearbySearch, onFreeSearch }) {";
if (c.includes(oldExec)) {
  c = c.replace(oldExec, newExec);
  changed++;
  console.log('EXEC_SIGNATURE: FIXED');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changed);