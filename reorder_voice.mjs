import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1) احذف handleVoiceClick من موقعه الحالي
const handleBlock = `const handleVoiceClick = useCallback(() => {
    toggleVoiceControl({
      getMap: () => mapRef.current,
      setActiveTab,
      submitReport: async (type, gps) => {
        const rep = await addReport(type, gps)
        setReports((prev) => [...prev, rep])
      },
      onStartTrip: startTrip,
      hasRoute: !!routeInfo,
      onStateChange: setIsMicListening,
    })
  }, [])

  
`;

if (!c.includes(handleBlock)) {
  console.log('BLOCK_NOT_FOUND - trying alternate');
  // جرّب بدون newlines نهائية
  const alt = `const handleVoiceClick = useCallback(() => {
    toggleVoiceControl({
      getMap: () => mapRef.current,
      setActiveTab,
      submitReport: async (type, gps) => {
        const rep = await addReport(type, gps)
        setReports((prev) => [...prev, rep])
      },
      onStartTrip: startTrip,
      hasRoute: !!routeInfo,
      onStateChange: setIsMicListening,
    })
  }, [])

  `;
  if (c.includes(alt)) {
    c = c.replace(alt, '');
    console.log('REMOVED_ALT');
  } else {
    console.log('FAILED_REMOVE');
    process.exit(1);
  }
} else {
  c = c.replace(handleBlock, '');
  console.log('REMOVED');
}

// 2) أدرجها بعد startTrip
const startTripEnd = "  }, [routeInfo, location, applyRoute])\n";
const newHandle = `  }, [routeInfo, location, applyRoute])

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
      onStateChange: setIsMicListening,
    })
  }, [routeInfo, startTrip])

`;

if (c.includes(startTripEnd)) {
  c = c.replace(startTripEnd, newHandle);
  console.log('INSERTED_AFTER_STARTTRIP');
} else {
  // جرّب \r\n
  const cr = "  }, [routeInfo, location, applyRoute])\r\n";
  if (c.includes(cr)) {
    c = c.replace(cr, newHandle);
    console.log('INSERTED_AFTER_STARTTRIP (CRLF)');
  } else {
    console.log('STARTTRIP_END_NOT_FOUND');
    process.exit(1);
  }
}

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');