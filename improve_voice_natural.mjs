import fs from 'fs';
const serverPath = 'D:/RAHAL/server/server.js';
let server = fs.readFileSync(serverPath, 'utf8');

// البحث عن الإعدادات الحالية واستبدالها بإعدادات أكثر طبيعية
const oldTts = "{ rate: '-8%', pitch: '-3Hz', volume: '+0%' }";
const newTts = "{ rate: '-5%', pitch: '-1Hz', volume: '+0%' }";

if (server.includes(oldTts)) {
    server = server.replace(oldTts, newTts);
    fs.writeFileSync(serverPath, server, 'utf8');
    console.log('TTS_PARAMS_UPDATED_TO_NATURAL');
} else {
    console.log('PATTERN_NOT_FOUND');
}