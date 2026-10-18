import fs from 'fs';

const vc = fs.readFileSync('D:/RAHAL/src/lib/voiceControl.js', 'utf8');
const app = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');

// 1. طباعة توقيع toggleVoiceControl
const toggleSig = vc.match(/export function toggleVoiceControl\([^)]+\)/);
console.log('--- TOGGLE SIGNATURE ---');
console.log(toggleSig ? toggleSig[0] : 'NOT_FOUND');

// 2. طباعة استدعاء executeVoiceCommand
const execCall = vc.match(/executeVoiceCommand\(speechText,\s*\{[^}]+\}\)/);
console.log('\n--- EXECUTE CALL ---');
console.log(execCall ? execCall[0] : 'NOT_FOUND');

// 3. طباعة أول 20 سطر من executeVoiceCommand
const startIdx = vc.indexOf('async function executeVoiceCommand');
console.log('\n--- EXECUTE FUNCTION START ---');
console.log(vc.substring(startIdx, startIdx + 1000));

// 4. طباعة استدعاء toggleVoiceControl في App.jsx
const appCallIdx = app.indexOf('toggleVoiceControl({');
console.log('\n--- APP.JSX CALL ---');
console.log(app.substring(appCallIdx, appCallIdx + 600));