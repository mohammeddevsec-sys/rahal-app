import fs from 'fs';
const vc = fs.readFileSync('D:/RAHAL/src/lib/voiceControl.js', 'utf8');
const app = fs.readFileSync('D:/RAHAL/src/App.jsx', 'utf8');

// هل tripActive موجود في الاستدعاء؟
const execCall = vc.match(/executeVoiceCommand\(speechText,\s*\{[^}]+\}\)/);
console.log('--- EXECUTE CALL ---');
console.log(execCall ? execCall[0] : 'NOT_FOUND');

// هل tripActive يمرر من App.jsx؟
console.log('\n--- APP_PASSES_TRIPACTIVE ---');
console.log(app.includes('tripActive: tripActive,') ? 'YES' : 'NO');