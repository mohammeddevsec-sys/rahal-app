import fs from 'fs';
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// البحث عن دالة startTrip واستخراجها
const startTripRegex = /const startTrip = useCallback\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\)/;
const match = app.match(startTripRegex);

if (match) {
  let funcCode = match[0];
  
  // التأكد من وجود stopSpeaking وإضافة النطق بعده مباشرة (لتجنب قطعه)
  if (!funcCode.includes('speakArabic(UI_TEXT.tripStarted')) {
    // نبحث عن setTripActive(true) ونضيف النطق بعده
    funcCode = funcCode.replace(
      "setTripActive(true)",
      "setTripActive(true)\n    stopSpeaking()\n    speakArabic(UI_TEXT.tripStarted + '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')"
    );
  }
  
  app = app.replace(match[0], funcCode);
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('START_TRIP_FUNCTION_PATCHED');
} else {
  console.log('START_TRIP_NOT_FOUND');
}