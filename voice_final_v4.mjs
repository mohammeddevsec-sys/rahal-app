import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// ===== 1) أضف hasAko قبل البحث القريب =====
const oldNearbyStart = `  // ===== NEARBY SEARCH =====
  const nearbyMap = [`;

const newNearbyStart = `  // ===== NEARBY SEARCH =====
  const hasAko = text.includes('\\u0627\\u0643\\u0648') || text.includes('\\u0627\\u0643\\u0648\\u0646') || text.includes('\\u0647\\u0646\\u0627\\u0643')
  const nearbyMap = [`;

if (c.includes(oldNearbyStart)) {
  c = c.replace(oldNearbyStart, newNearbyStart);
  changes++;
  console.log('HAS_AKO: ADDED');
} else {
  console.log('HAS_AKO: PATTERN_NOT_FOUND');
}

// ===== 2) لُف حلقة nearby search بـ if (!hasAko) =====
const oldLoop = `  for (const entry of nearbyMap) {
    for (const kw of entry.kw) {
      if (text.includes(kw)) {
        if (typeof onNearbySearch !== 'function') { say('\\u0627\\u0644\\u0628\\u062D\\u062B \\u063A\\u064A\\u0631 \\u0645\\u062A\\u0627\\u062D'); return }
        say(entry.say)
        setTimeout(() => { onNearbySearch(entry.id) }, 1200)
        return
      }
    }
  }`;

const newLoop = `  if (!hasAko) {
    for (const entry of nearbyMap) {
      for (const kw of entry.kw) {
        if (text.includes(kw)) {
          if (typeof onNearbySearch !== 'function') { say('\\u0627\\u0644\\u0628\\u062D\\u062B \\u063A\\u064A\\u0631 \\u0645\\u062A\\u0627\\u062D'); return }
          say(entry.say)
          setTimeout(() => { onNearbySearch(entry.id) }, 1200)
          return
        }
      }
    }
  }`;

if (c.includes(oldLoop)) {
  c = c.replace(oldLoop, newLoop);
  changes++;
  console.log('NEARBY: GUARDED_BY_HAS_AKO');
} else {
  console.log('NEARBY: LOOP_NOT_FOUND');
}

// ===== 3) لُف free search أيضاً =====
const oldFree = `  const freeTriggers = ['\\u0627\\u0628\\u062D\\u062B \\u0639\\u0646', '\\u0648\\u064A\\u0646', '\\u062F\\u0648\\u0631', '\\u0634\\u0648\\u0641 \\u0644\\u064A']
  for (const trig of freeTriggers) {
    if (text.includes(trig)) {
      const query = text.substring(text.indexOf(trig) + trig.length).trim()
      if (query.length >= 2 && typeof onFreeSearch === 'function') {
        say('\\u062C\\u0627\\u0631\\u064A \\u0627\\u0644\\u0628\\u062D\\u062B \\u0639\\u0646 ' + query)
        setTimeout(() => { onFreeSearch(query) }, 1200)
        return
      }
    }
  }`;

const newFree = `  if (!hasAko) {
    const freeTriggers = ['\\u0627\\u0628\\u062D\\u062B \\u0639\\u0646', '\\u0648\\u064A\\u0646', '\\u062F\\u0648\\u0631', '\\u0634\\u0648\\u0641 \\u0644\\u064A']
    for (const trig of freeTriggers) {
      if (text.includes(trig)) {
        const query = text.substring(text.indexOf(trig) + trig.length).trim()
        if (query.length >= 2 && typeof onFreeSearch === 'function') {
          say('\\u062C\\u0627\\u0631\\u064A \\u0627\\u0644\\u0628\\u062D\\u062B \\u0639\\u0646 ' + query)
          setTimeout(() => { onFreeSearch(query) }, 1200)
          return
        }
      }
    }
  }`;

if (c.includes(oldFree)) {
  c = c.replace(oldFree, newFree);
  changes++;
  console.log('FREE: GUARDED_BY_HAS_AKO');
} else {
  console.log('FREE: PATTERN_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);