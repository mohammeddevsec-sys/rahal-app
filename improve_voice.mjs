import fs from 'fs';
const serverPath = 'D:/RAHAL/server/server.js';
let server = fs.readFileSync(serverPath, 'utf8');

// البحث عن استدعاء EdgeTTS وتحديثه بالمعلمات الجديدة
const oldTts = "const tts = new EdgeTTS(text, voiceName)";
const newTts = "const tts = new EdgeTTS(text, voiceName, { rate: '-8%', pitch: '-2Hz', volume: '+0%' })";

if (server.includes(oldTts)) {
    server = server.replace(oldTts, newTts);
    fs.writeFileSync(serverPath, server, 'utf8');
    console.log('TTS_PARAMS_UPDATED');
} else {
    console.log('PATTERN_NOT_FOUND');
}