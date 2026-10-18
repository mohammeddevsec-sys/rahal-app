import fs from 'fs';
const appPath = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(appPath, 'utf8');

// 1. إضافة حالة isDark إذا لم تكن موجودة
if (!c.includes('const [isDark, setIsDark]')) {
  c = c.replace(
    "const [isMicListening, setIsMicListening] = useState(false)",
    "const [isMicListening, setIsMicListening] = useState(false)\n  const [isDark, setIsDark] = useState(() => localStorage.getItem('rahal-theme') === 'dark')"
  );
}

// 2. حقن الزر قبل زر "موقعي" أو قبل "top-actions"
const btnCode = `
          <button type="button" className="theme-btn" onClick={() => { const next = !isDark; setIsDark(next); localStorage.setItem('rahal-theme', next ? 'dark' : 'light'); window.location.reload(); }} aria-label="تغيير الوضع">
            {isDark ? '☀️' : '🌙'}
          </button>`;

if (!c.includes('theme-btn')) {
  // البحث عن زر موقعي أو الحاوية
  if (c.includes('<button type="button" className="locate-btn"')) {
    c = c.replace('<button type="button" className="locate-btn"', btnCode + '\n          <button type="button" className="locate-btn"');
  } else if (c.includes('aria-label="موقعي"')) {
    c = c.replace('aria-label="موقعي"', 'aria-label="موقعي"'); // Fallback
    // نبحث عن أول <button> داخل topbar أو نضعه في top-actions
    c = c.replace('<div className="top-actions">', '<div className="top-actions">\n' + btnCode);
  } else {
    // كخيار أخير، نضعه بعد الشعار
    c = c.replace('</div>\n        <div className="top-actions">', '</div>\n' + btnCode + '\n        <div className="top-actions">');
    c = c.replace('</header>', btnCode + '\n      </header>');
  }
}

fs.writeFileSync(appPath, c, 'utf8');
console.log('DONE');