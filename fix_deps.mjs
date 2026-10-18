import fs from 'fs';
const f = 'D:/RAHAL/src/App.jsx';
let c = fs.readFileSync(f, 'utf8');

// البحث عن دالة routeToDestination وإضافة tripActive إلى مصفوفة الاعتماديات
const regex = /const routeToDestination = useCallback\(([\s\S]*?)\}, \[([^\]]*)\]\)/;
if (regex.test(c)) {
  c = c.replace(regex, (match, body, deps) => {
    let newDeps = deps;
    if (!newDeps.includes('tripActive')) {
      newDeps = newDeps.trim() ? newDeps + ', tripActive' : 'tripActive';
    }
    return `const routeToDestination = useCallback(${body}}, [${newDeps}])`;
  });
  fs.writeFileSync(f, c, 'utf8');
  console.log('DEPENDENCIES_FIXED');
} else {
  console.log('NOT_FOUND');
}