import fs from 'fs';
const f = 'D:/RAHAL/src/lib/voiceControl.js';
let c = fs.readFileSync(f, 'utf8');
let changed = 0;

// 1) احذف نطق "بدأت الرحلة" (startTrip ينطق بنفسه)
const dupVoice = "      onStartTrip()\n      say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u062F \\u0628\\u062D\\u0630\\u0631')\n";
const dupVoiceCR = "      onStartTrip()\r\n      say('\\u0628\\u062F\\u0623\\u062A \\u0627\\u0644\\u0631\\u062D\\u0644\\u0629\\u060C \\u0642\\u062F \\u0628\\u062D\\u0630\\u0631')\r\n";

if (c.includes(dupVoice)) { c = c.replace(dupVoice, "      onStartTrip()\n"); changed++; console.log('DUP_VOICE: REMOVED (LF)'); }
else if (c.includes(dupVoiceCR)) { c = c.replace(dupVoiceCR, "      onStartTrip()\r\n"); changed++; console.log('DUP_VOICE: REMOVED (CRLF)'); }
else console.log('DUP_VOICE: NO_MATCH');

// 2) حسّن رسالة الخطأ في submitReport catch
const oldErr = "      } catch (e) {\r\n        console.error('VOICE_REPORT_ERR:', e)\r\n        say('\\u0641\\u0634\\u0644 \\u062A\\u0633\\u062C\\u064A\\u0644 \\u0627\\u0644\\u0628\\u0644\\u0627\\u063A')\r\n      }";
const oldErrLF = "      } catch (e) {\n        console.error('VOICE_REPORT_ERR:', e)\n        say('\\u0641\\u0634\\u0644 \\u062A\\u0633\\u062C\\u064A\\u0644 \\u0627\\u0644\\u0628\\u0644\\u0627\\u063A')\n      }";

const newErr = `      } catch (e) {
        console.error('VOICE_REPORT_ERR:', e)
        console.error('VOICE_REPORT_TYPE:', type)
        console.error('VOICE_REPORT_GPS:', JSON.stringify(gps))
        say('\\u0641\\u0634\\u0644 \\u062A\\u0633\\u062C\\u064A\\u0644 \\u0627\\u0644\\u0628\\u0644\\u0627\\u063A')
      }`;

if (c.includes(oldErr)) { c = c.replace(oldErr, newErr); changed++; console.log('ERR_LOG: UPGRADED (CRLF)'); }
else if (c.includes(oldErrLF)) { c = c.replace(oldErrLF, newErr); changed++; console.log('ERR_LOG: UPGRADED (LF)'); }
else console.log('ERR_LOG: NO_MATCH');

// 3) log للتأكد من استدعاء submitReport
const oldCall = "        await submitReport(type, gps)";
const newCall = "        console.log('VOICE_SUBMIT:', type, JSON.stringify(gps))\n        await submitReport(type, gps)";
if (c.includes(oldCall)) { c = c.replace(oldCall, newCall); changed++; console.log('SUBMIT_LOG: ADDED'); }
else console.log('SUBMIT_LOG: NO_MATCH');

fs.writeFileSync(f, c, 'utf8');
console.log('CHANGES:', changed);