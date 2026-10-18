import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');
let changes = 0;

// ===== 1) أضف ref جديد للبلاغات المُعلنة =====
const oldRef = "const searchResultMarkersRef = useRef([])";
const newRef = "const searchResultMarkersRef = useRef([])\n  const announcedReportsRef = useRef(new Set())";

if (c.includes(oldRef) && !c.includes('announcedReportsRef')) {
  c = c.replace(oldRef, newRef);
  changes++;
  console.log('REF: ADDED');
} else if (c.includes('announcedReportsRef')) {
  console.log('REF: ALREADY_EXISTS');
} else {
  console.log('REF: ANCHOR_NOT_FOUND');
}

// ===== 2) أضف useEffect بعد reports markers =====
const anchor = "  }, [reports, mapReady])\r\n";
const anchorLF = "  }, [reports, mapReady])\n";

const effect = `  }, [reports, mapReady])

  // ===== Predictive Proximity Alerts =====
  useEffect(() => {
    if (!tripActive || !location || !reports || reports.length === 0) return
    if (!mapReady) return

    const ANNOUNCE_MIN = 50
    const ANNOUNCE_MAX = 500
    const voiceLabel = {
      accident: '\\u062D\\u0627\\u062F\\u062B',
      traffic: '\\u0627\\u0632\\u062F\\u062D\\u0627\\u0645',
      traffic_heavy: '\\u0627\\u0632\\u062F\\u062D\\u0627\\u0645 \\u0634\\u062F\\u064A\\u062F',
      hazard: '\\u062E\\u0637\\u0631',
      road_work: '\\u0623\\u0639\\u0645\\u0627\\u0644 \\u0637\\u0631\\u0642',
      emergency: '\\u0637\\u0648\\u0627\\u0631\\u0626',
      bad_weather: '\\u0637\\u0642\\u0633 \\u0633\\u064A\\u0621',
      checkpoint: '\\u0633\\u064A\\u0637\\u0631\\u0629',
      camera: '\\u0643\\u0627\\u0645\\u064A\\u0631\\u0627',
      speed_bump: '\\u0645\\u0637\\u0628',
      fuel: '\\u0645\\u062D\\u0637\\u0629 \\u0648\\u0642\\u0648\\u062F',
      animals: '\\u062D\\u064A\\u0648\\u0627\\u0646\\u0627\\u062A',
    }
    const priority = {
      accident: 1, traffic_heavy: 2, checkpoint: 3, emergency: 4,
      speed_bump: 5, camera: 6, hazard: 7, animals: 8,
      traffic: 9, road_work: 10, bad_weather: 11, fuel: 12,
    }

    const candidates = []
    for (const r of reports) {
      if (announcedReportsRef.current.has(r.id)) continue
      const d = metersBetween(location, r)
      if (d >= ANNOUNCE_MIN && d <= ANNOUNCE_MAX) {
        candidates.push({ r, d })
      }
    }
    if (candidates.length === 0) return

    candidates.sort((a, b) => {
      const pa = priority[a.r.type] || 99
      const pb = priority[b.r.type] || 99
      if (pa !== pb) return pa - pb
      return a.d - b.d
    })

    const chosen = candidates[0]
    const lbl = voiceLabel[chosen.r.type]
    if (!lbl) return

    const distPhrase = spokenDistancePhrase(Math.round(chosen.d))
    const text = '\\u0623\\u0643\\u0648 ' + lbl + ' \\u0628\\u0639\\u062F ' + distPhrase
    console.log('PROXIMITY_ALERT:', chosen.r.type, Math.round(chosen.d), 'm')
    speakArabic(text)
    announcedReportsRef.current.add(chosen.r.id)
  }, [tripActive, location, reports, mapReady])

`;

if (c.includes(anchor)) {
  c = c.replace(anchor, effect);
  changes++;
  console.log('EFFECT: ADDED (CRLF)');
} else if (c.includes(anchorLF)) {
  c = c.replace(anchorLF, effect);
  changes++;
  console.log('EFFECT: ADDED (LF)');
} else {
  console.log('EFFECT: ANCHOR_NOT_FOUND');
}

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changes);