import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// نبحث عن مواقع تعريف الدوال
const stopTripIdx = c.indexOf('const stopTrip = useCallback');
const handleVoiceIdx = c.indexOf('const handleVoiceClick = useCallback');
console.log('stopTrip at:', stopTripIdx);
console.log('handleVoiceClick at:', handleVoiceIdx);

// نطبع محتوى دالة stopTrip
if (stopTripIdx !== -1) {
  console.log('--- stopTrip function ---');
  console.log(c.substring(stopTripIdx, stopTripIdx + 800));
}

// نطبع محتوى دالة handleVoiceClick (نبحث عن onStopTrip)
if (handleVoiceIdx !== -1) {
  console.log('--- handleVoiceClick (onStopTrip part) ---');
  const voBlock = c.substring(handleVoiceIdx, handleVoiceIdx + 1200);
  const onStopIdx = voBlock.indexOf('onStopTrip');
  if (onStopIdx !== -1) {
    console.log(voBlock.substring(onStopIdx - 100, onStopIdx + 200));
  } else {
    console.log('onStopTrip NOT in handleVoiceClick!');
    console.log(voBlock);
  }
}