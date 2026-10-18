import fs from 'fs';
const cssPath = 'D:/RAHAL/src/App.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('/* ===== PROFESSIONAL UI REFINEMENTS ===== */')) {
  css += `

/* ===== PROFESSIONAL UI REFINEMENTS ===== */

/* 1. الشريط العلوي: توزيع المسافات بدقة (شعار يمين، موقعي ونقاط يسار) */
.topbar {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 12px 16px !important;
  background: #ffffff !important;
}
.topbar .brand {
  margin-left: auto !important;
}
.topbar .user-stats-badge {
  margin: 0 !important;
  background: rgba(2, 132, 199, 0.08) !important;
  border: 1px solid rgba(2, 132, 199, 0.2) !important;
  padding: 6px 12px !important;
}
.locate-btn {
  margin-right: 8px !important;
  margin-left: 8px !important;
}

/* 2. بطاقة الرحلة (الزجاجية بدل الأزرق الصريح) */
.eta-banner {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
}
.eta-banner * {
  color: #0f172a !important;
}
.eta-banner .eta-main span {
  color: #0f172a !important;
  font-weight: 800 !important;
}
.eta-banner .eta-dot {
  color: #94a3b8 !important;
}
.eta-banner .trip-btn.trip-start {
  background: #0284c7 !important;
  color: #ffffff !important;
  border-radius: 14px !important;
  padding: 12px 32px !important;
  font-weight: 800 !important;
  box-shadow: 0 6px 20px rgba(2, 132, 199, 0.35) !important;
  width: 100% !important;
  margin-top: 12px !important;
}

/* 3. دمج زر الإبلاغ مع النص */
.home-report-card, .report-cta {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 16px !important;
  margin: 0 16px 16px 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
}
.home-report-card button, .report-cta button {
  background: #0b63ce !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  padding: 10px 24px !important;
  font-weight: bold !important;
  box-shadow: 0 4px 10px rgba(11, 99, 206, 0.25) !important;
  border: none !important;
}

/* 4. شارة الموقع الحقيقي */
.location-badge {
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  left: auto !important;
  background: rgba(255, 255, 255, 0.95) !important;
  color: #0284c7 !important;
  border: 1px solid rgba(2, 132, 199, 0.3) !important;
  border-radius: 20px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  z-index: 100 !important;
}
`;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('DONE');
} else {
  console.log('ALREADY_APPLIED');
}