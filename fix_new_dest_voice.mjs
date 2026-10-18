import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. البحث عن دالة تغيير الوجهة أو تطبيق المسار
const routeDestRegex = /const routeToDestination = useCallback\([\s\S]*?\{/;
if (routeDestRegex.test(c)) {
  c = c.replace(routeDestRegex, (match) => {
    // إضافة النطق إذا كان المستخدم في رحلة وقرر تغيير الوجهة
    return match + `
    if (tripActive) {
      speakArabic(UI_TEXT.tripStarted + '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')
    }
`;
  });
  console.log('ROUTE_TO_DESTINATION: VOICE ADDED');
}

// 2. التأكد من وجود النطق في دالة startTrip أيضاً
const startTripRegex = /const startTrip = useCallback\(\(\) => \{/;
if (startTripRegex.test(c) && !c.includes('speakArabic(UI_TEXT.tripStarted')) {
  c = c.replace(startTripRegex, (match) => {
    return match + `
    speakArabic(UI_TEXT.tripStarted + '\\u060C \\u0642\\u064F\\u062F \\u0628\\u062D\\u0630\\u0631')
`;
  });
  console.log('START_TRIP: VOICE RESTORED');
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');