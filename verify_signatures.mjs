import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
const c = fs.readFileSync(f, 'utf8');

// 1. طباعة توقيع toggleVoiceControl
const toggleSig = c.match(/export function toggleVoiceControl\([^)]+\)/);
console.log('TOGGLE_SIGNATURE:', toggleSig ? toggleSig[0] : 'NOT_FOUND');

// 2. طباعة استدعاء executeVoiceCommand داخل toggleVoiceControl
const execCall = c.match(/executeVoiceCommand\(speechText,\s*\{[^}]+\}\)/);
console.log('EXEC_CALL:', execCall ? execCall[0] : 'NOT_FOUND');

// 3. التحقق من تعريف onStopTrip في التفكيك داخل executeVoiceCommand
const destructure = c.match(/const \{[^}]*\} = ctx/);
console.log('DESTRUCTURE:', destructure ? destructure[0] : 'NOT_FOUND');