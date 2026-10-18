import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1) احذف handleVoiceClick من موقعها الحالي
const blockRegex = /const handleVoiceClick = useCallback\(\(\) => \{[\s\S]*?\}, \[routeInfo, startTrip\]\)\r?\n\r?\n/g;
const match = c.match(blockRegex);
if (!match) {
  console.log('REMOVE: NO_MATCH');
  process.exit(1);
}
c = c.replace(blockRegex, '');
console.log('REMOVE: OK');

// 2) أدرجه بعد handlePickCategory (السطر الذي ينتهي بـ "}, [location])")
const anchor = "  }, [location])\r\n";
const anchorLF = "  }, [location])\n";

const newBlock = `  }, [location])

  const handleVoiceClick = useCallback(() => {
    toggleVoiceControl({
      getMap: () => mapRef.current,
      setActiveTab,
      submitReport: async (type, gps) => {
        const rep = await addReport(type, gps)
        setReports((prev) => [...prev, rep])
      },
      onStartTrip: startTrip,
      hasRoute: !!routeInfo,
      onNearbySearch: handlePickCategory,
      onStateChange: setIsMicListening,
    })
  }, [routeInfo, startTrip, handlePickCategory])

`;

if (c.includes(anchor)) {
  c = c.replace(anchor, newBlock);
  console.log('INSERT: CRLF');
} else if (c.includes(anchorLF)) {
  c = c.replace(anchorLF, newBlock);
  console.log('INSERT: LF');
} else {
  console.log('INSERT: ANCHOR_NOT_FOUND');
  process.exit(1);
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');