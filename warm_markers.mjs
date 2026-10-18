import fs from 'fs';

// ===== 1. الترحيب: "أهلا بك" =====
const vf = 'D:/RAHAL/src/lib/voiceControl.js';
let v = fs.readFileSync(vf, 'utf8');
const oldW = "say('\\u0647\\u0644\\u0627 \\u0628\\u064A\\u0643')";
const newW = "say('\\u0623\\u0647\\u0644\\u0627 \\u0628\\u0643')";
if (v.includes(oldW)) {
  v = v.replace(oldW, newW);
  fs.writeFileSync(vf, v, 'utf8');
  console.log('WELCOME: أهلا بك');
} else {
  console.log('WELCOME: NO_MATCH');
}

// ===== 2. صوت رنا دافئ =====
const sf = 'D:/RAHAL/server/server.js';
let s = fs.readFileSync(sf, 'utf8');
const oldTts = "      const tts = new EdgeTTS(text, voiceName)";
const newTts = "      const tts = new EdgeTTS(text, voiceName, { rate: '-8%', pitch: '-3Hz', volume: '+0%' })";
if (s.includes(oldTts)) {
  s = s.replace(oldTts, newTts);
  fs.writeFileSync(sf, s, 'utf8');
  console.log('TTS: WARMER (rate -8%, pitch -3Hz)');
} else {
  console.log('TTS: NO_MATCH');
}

// ===== 3. App.jsx: علامات على الخريطة =====
const af = 'D:/RAHAL/src/App.jsx';
let a = fs.readFileSync(af, 'utf8');

// 3a. ref جديد
const oldRef = "const reportsMarkersRef = useRef([])";
const newRef = "const reportsMarkersRef = useRef([])\n  const searchResultMarkersRef = useRef([])";
if (a.includes(oldRef) && !a.includes('searchResultMarkersRef')) {
  a = a.replace(oldRef, newRef);
  console.log('REF: ADDED');
} else {
  console.log('REF: SKIPPED');
}

// 3b. useEffect لعرض العلامات
const anchor = "  }, [reports, mapReady])\r\n";
const anchorLF = "  }, [reports, mapReady])\n";

const effect = `  }, [reports, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const m of searchResultMarkersRef.current) {
      try { m.remove() } catch { /* noop */ }
    }
    searchResultMarkersRef.current = []
    if (!searchResults || searchResults.length === 0) return
    for (const r of searchResults) {
      if (typeof r.lat !== 'number' || typeof r.lng !== 'number') continue
      const el = document.createElement('div')
      el.className = 'search-result-marker'
      const marker = new Marker({ element: el, anchor: 'center' })
        .setLngLat([r.lng, r.lat])
        .addTo(map)
      searchResultMarkersRef.current.push(marker)
    }
    return () => {
      for (const m of searchResultMarkersRef.current) {
        try { m.remove() } catch { /* noop */ }
      }
      searchResultMarkersRef.current = []
    }
  }, [searchResults])
`;

if (!a.includes('searchResultMarkersRef.current = []\r\n    if (!searchResults')) {
  if (a.includes(anchor)) {
    a = a.replace(anchor, effect);
    console.log('EFFECT: ADDED (CRLF)');
  } else if (a.includes(anchorLF)) {
    a = a.replace(anchorLF, effect);
    console.log('EFFECT: ADDED (LF)');
  } else {
    console.log('EFFECT: ANCHOR_NOT_FOUND');
  }
} else {
  console.log('EFFECT: SKIPPED (exists)');
}

fs.writeFileSync(af, a, 'utf8');

// ===== 4. CSS =====
const cf = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cf, 'utf8');
const cssAdd = `

/* ===== SEARCH RESULT MARKERS ===== */
.search-result-marker {
  width: 18px;
  height: 18px;
  background: #0a2540;
  border: 2.5px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45), 0 0 0 3px rgba(10, 37, 64, 0.15);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.search-result-marker:hover {
  transform: scale(1.25);
  background: #f97316;
}
`;
if (!css.includes('SEARCH RESULT MARKERS')) {
  css += cssAdd;
  fs.writeFileSync(cf, css, 'utf8');
  console.log('CSS: ADDED');
} else {
  console.log('CSS: SKIPPED');
}

console.log('DONE');