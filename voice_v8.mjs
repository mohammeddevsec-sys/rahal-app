import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1) احذف handleVoiceClick من مكانها الخاطئ (قبل handleSaveWork)
const blockRegex = /  const handleVoiceClick = useCallback\(\(\) => \{[\s\S]*?\}, \[routeInfo, startTrip, handlePickCategory\]\)\r?\n\r?\n/g;
if (!blockRegex.test(c)) {
  console.log('REMOVE: NO_MATCH');
  process.exit(1);
}
c = c.replace(blockRegex, '');
console.log('REMOVE: OK');

// 2) أدرجها قبل handleCloseCategories (بعد handlePickCategory)
const anchor = "  const handleCloseCategories = useCallback(() => {";
if (!c.includes(anchor)) {
  console.log('ANCHOR: NOT_FOUND');
  process.exit(1);
}

const block = `  const handleVoiceClick = useCallback(() => {
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

c = c.replace(anchor, block + anchor);
console.log('INSERT: BEFORE_HANDLE_CLOSE_CATEGORIES');

fs.writeFileSync(f, c, 'utf8');
console.log('DONE');