import fs from 'fs';

// ===== 1. إصلاح App.jsx (تمرير tripActive) =====
const appPath = 'D:/RAHAL/src/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');

// إضافة tripActive بعد hasRoute في دالة toggleVoiceControl
const appCallRegex = /(hasRoute:\s*!!routeInfo,)/;
if (appCallRegex.test(app) && !app.includes('tripActive: tripActive,')) {
  app = app.replace(appCallRegex, '$1\n      tripActive: tripActive,');
  fs.writeFileSync(appPath, app, 'utf8');
  console.log('APP_JSX: tripActive INJECTED');
}

// ===== 2. إصلاح voiceControl.js =====
const vcPath = 'D:/RAHAL/src/lib/voiceControl.js';
let vc = fs.readFileSync(vcPath, 'utf8');

// أ) تحديث توقيع toggleVoiceControl
vc = vc.replace(/export function toggleVoiceControl\(\{([^}]+)\}\)/g, (match, args) => {
  if (!args.includes('tripActive')) {
    return `export function toggleVoiceControl({${args.replace('hasRoute,', 'hasRoute, tripActive,')}})`;
  }
  return match;
});

// ب) تحديث استدعاء executeVoiceCommand
vc = vc.replace(/executeVoiceCommand\(speechText, \{([^}]+)\}\)/g, (match, args) => {
  if (!args.includes('tripActive')) {
    return `executeVoiceCommand(speechText, {${args.replace('hasRoute,', 'hasRoute, tripActive,')}})`;
  }
  return match;
});

// ج) تحديث توقيع executeVoiceCommand
vc = vc.replace(/async function executeVoiceCommand\(text, \{([^}]+)\}\)/g, (match, args) => {
  if (!args.includes('tripActive')) {
    return `async function executeVoiceCommand(text, {${args.replace('hasRoute,', 'hasRoute, tripActive,')}})`;
  }
  return match;
});

// د) تحديث التفكيك داخل executeVoiceCommand
vc = vc.replace(/const \{([^}]+)\} = ctx/g, (match, args) => {
  if (!args.includes('tripActive')) {
    return `const {${args.replace('hasRoute,', 'hasRoute, tripActive,')}} = ctx`;
  }
  return match;
});

// هـ) حقن منطق الإلغاء الذكي (الذي يستخدم tripActive)
const cancelRegexMatch = vc.match(/const cancelRegex = [^;]+;/);
if (cancelRegexMatch && !vc.includes('isMisheardCancel')) {
  const newCancel = cancelRegexMatch[0] + `\n  const isMisheardCancel = (text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0629') || text.includes('\\u0627\\u0644\\u0631\\u062D\\u0644\\u0647')) && tripActive;`;
  vc = vc.replace(cancelRegexMatch[0], newCancel);
  
  // تحديث شرط الفحص
  vc = vc.replace(/if \(cancelRegex\.test\(text\)\) \{/, `if (cancelRegex.test(text) || isMisheardCancel) {`);
  fs.writeFileSync(vcPath, vc, 'utf8');
  console.log('VOICE_CONTROL: SMART CANCEL INJECTED');
}
console.log('DONE');