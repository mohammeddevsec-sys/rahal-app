import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// 1. حذف أي بادج سابق
c = c.replace(/<div className="user-stats-badge"[\s\S]*?<\/div>\s*<\/div>/g, '');

// 2. البحث عن قسم topbar وحقن البادج مباشرة قبل إغلاقه
// نستخدم regex للبحث عن <header className="topbar"> ... </header>
const topbarRegex = /(<header className="topbar">[\s\S]*?)(<\/header>)/;
if (topbarRegex.test(c)) {
  const badgeHTML = `
        <div className="user-stats-badge" title="مستواك ونقاطك">
          <span className="stats-level">{getLevelName(userStats.level)}</span>
          <span className="stats-points">{userStats.points} <small>نقطة</small></span>
        </div>
`;
  c = c.replace(topbarRegex, `$1${badgeHTML}$2`);
  fs.writeFileSync(f, c, 'utf8');
  console.log('BADGE_INJECTED_IN_HEADER');
} else {
  console.log('HEADER_NOT_FOUND');
}