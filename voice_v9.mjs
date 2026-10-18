import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// 1) إضافة "الرحلة" لأوامر بدء الرحلة
const oldTrip = "if (text.includes('\\u0627\\u0628\\u062F\\u0623') || text.includes('\\u0627\\u0628\\u062F\\u0627') || text.includes('\\u0627\\u0628\\u062F\\u064A') || text.includes('\\u0645\\u0634\\u064A\\u0646\\u0627') || text.includes('\\u064A\\u0644\\u0627 \\u0631\\u0648\\u062D')) {";
const newTrip = "if (text.includes('\\u0627\\u0628\\u062F\\u0623') || text.includes('\\u0627\\u0628\\u062F\\u0627') || text.includes('\\u0627\\u0628\\u062F\\u064A') || text.includes('\\u0645\\u0634\\u064A\\u0646\\u0627') || text.includes('\\u064A\\u0644\\u0627 \\u0631\\u0648\\u062D') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647') || text.includes('\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0631\\u062D\\u0644\\u0647') || text.includes('\\u064A\\u0644\\u0627')) {";

if (c.includes(oldTrip)) {
  c = c.replace(oldTrip, newTrip);
  changes++;
  console.log('TRIP_KEYWORDS: EXPANDED');
} else {
  console.log('TRIP_KEYWORDS: NO_MATCH');
}

// 2) إضافة "محطه" لوقود
const oldFuel = "{ kw: ['\\u0645\\u062D\\u0637\\u0629 \\u0648\\u0642\\u0648\\u062F', '\\u0628\\u0646\\u0632\\u064A\\u0646', '\\u0648\\u0642\\u0648\\u062F', '\\u0628\\u0646\\u0632\\u064A\\u0646\\u0629'], id: 'fuel'";
const newFuel = "{ kw: ['\\u0645\\u062D\\u0637\\u0629 \\u0648\\u0642\\u0648\\u062F', '\\u0645\\u062D\\u0637\\u0647 \\u0648\\u0642\\u0648\\u062F', '\\u0645\\u062D\\u0637\\u0629 \\u0628\\u0646\\u0632\\u064A\\u0646', '\\u0645\\u062D\\u0637\\u0647 \\u0628\\u0646\\u0632\\u064A\\u0646', '\\u0628\\u0646\\u0632\\u064A\\u0646', '\\u0648\\u0642\\u0648\\u062F', '\\u0628\\u0646\\u0632\\u064A\\u0646\\u0629', '\\u0643\\u0627\\u0632'], id: 'fuel'";

if (c.includes(oldFuel)) {
  c = c.replace(oldFuel, newFuel);
  changes++;
  console.log('FUEL_KEYWORDS: EXPANDED');
} else {
  console.log('FUEL_KEYWORDS: NO_MATCH');
}

// 3) تأكيد أن الترحيب قصير
if (c.includes("say('\\u0647\\u0644\\u0627 \\u0628\\u064A\\u0643')")) {
  console.log('WELCOME: ALREADY_SHORT');
} else if (c.includes("say('\\u0623\\u0647\\u0644\\u0627\\u064B \\u0628\\u0643 \\u0646\\u0648\\u0631\\u062A')")) {
  c = c.replace("say('\\u0623\\u0647\\u0644\\u0627\\u064B \\u0628\\u0643 \\u0646\\u0648\\u0631\\u062A')", "say('\\u0647\\u0644\\u0627 \\u0628\\u064A\\u0643')");
  changes++;
  console.log('WELCOME: SHORTENED');
} else {
  console.log('WELCOME: PATTERN_UNKNOWN');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);