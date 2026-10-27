import fs from 'fs'
const path = 'build.gradle'
let src = fs.readFileSync(path, 'utf8')

// إضافة أمر إجباري لتخفيض المكتبات في نهاية الملف
const forceCode = `
// === FORCE DOWNGRADE TO FIX AAR METADATA ===
configurations.all {
    resolutionStrategy {
        force 'androidx.activity:activity:1.9.3'
        force 'androidx.core:core-ktx:1.13.1'
        force 'androidx.core:core:1.13.1'
    }
}
`

if (!src.includes('FORCE DOWNGRADE TO FIX AAR METADATA')) {
  fs.writeFileSync(path, src + forceCode, 'utf8')
  console.log('✅ SUCCESS: Force downgrade rules added to app/build.gradle.')
} else {
  console.log('ℹ️ NOTE: Force downgrade rules already exist.')
}
