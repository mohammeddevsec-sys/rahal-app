import fs from 'fs';
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// 1. إزالة أي تعريف سابق لدالة triggerPointsPopup (لتجنب مشاكل الترتيب)
app = app.replace(/const triggerPointsPopup = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\)\r?\n?/g, '');

// 2. إصلاح بلوك الـ voice submitReport (إزالة التكرار واستخدام setState مباشرة)
const voiceBad = /submitReport: async \(type, gps\) => \{[\s\S]*?const rep = await addReport\(type, gps\)[\s\S]*?setReports\(\(prev\) => \[\.\.\.prev, rep\]\)[\s\S]*?\},/;
if (voiceBad.test(app)) {
  app = app.replace(voiceBad, `submitReport: async (type, gps) => {
        const rep = await addReport(type, gps)
        setUserStats(prev => addPoints(10, prev))
        setShowPointsPopup(true)
        setTimeout(() => setShowPointsPopup(false), 2500)
        setReports((prev) => [...prev, rep])
      },`);
  console.log('VOICE_SUBMIT: FIXED');
}

// 3. إصلاح بلوك الـ handleAddReport
const handleBad = /const rep = await addReport\(typeId, coords\)[\s\S]*?triggerPointsPopup\(\)/;
if (handleBad.test(app)) {
  app = app.replace(handleBad, `const rep = await addReport(typeId, coords)
    setUserStats(prev => addPoints(10, prev))
    setShowPointsPopup(true)
    setTimeout(() => setShowPointsPopup(false), 2500)`);
  console.log('HANDLE_ADD: FIXED');
}

// 4. التأكد من حقن شارة النقاط (Badge) في الشريط العلوي
if (!app.includes('user-stats-badge')) {
  const target = '<div className="top-actions">';
  const badge = `<div className="top-actions">
          <div className="user-stats-badge" title="مستواك ونقاطك">
            <span className="stats-level">{getLevelName(userStats.level)}</span>
            <span className="stats-points">{userStats.points} <small>نقطة</small></span>
          </div>`;
  if (app.includes(target)) {
    app = app.replace(target, badge);
    console.log('BADGE: ADDED');
  } else {
    // كخطة بديلة، نحقنها قبل زر موقعي إذا لم نجد top-actions
    app = app.replace('<button type="button" className="locate-btn"', badge + '\n<button type="button" className="locate-btn"');
    console.log('BADGE: ADDED_FALLBACK');
  }
}

fs.writeFileSync(appPath, app, 'utf8');
console.log('DONE');