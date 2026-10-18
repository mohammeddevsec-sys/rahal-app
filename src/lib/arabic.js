const ONES = ['', '\u0648\u0627\u062D\u062F', '\u0627\u062B\u0646\u0627\u0646', '\u062B\u0644\u0627\u062B\u0629', '\u0623\u0631\u0628\u0639\u0629', '\u062E\u0645\u0633\u0629', '\u0633\u062A\u0629', '\u0633\u0628\u0639\u0629', '\u062B\u0645\u0627\u0646\u064A\u0629', '\u062A\u0633\u0639\u0629']
const TEENS = ['\u0639\u0634\u0631\u0629', '\u0623\u062D\u062F \u0639\u0634\u0631', '\u0627\u062B\u0646\u0627 \u0639\u0634\u0631', '\u062B\u0644\u0627\u062B\u0629 \u0639\u0634\u0631', '\u0623\u0631\u0628\u0639\u0629 \u0639\u0634\u0631', '\u062E\u0645\u0633\u0629 \u0639\u0634\u0631', '\u0633\u062A\u0629 \u0639\u0634\u0631', '\u0633\u0628\u0639\u0629 \u0639\u0634\u0631', '\u062B\u0645\u0627\u0646\u064A\u0629 \u0639\u0634\u0631', '\u062A\u0633\u0639\u0629 \u0639\u0634\u0631']
const TENS = ['', '', '\u0639\u0634\u0631\u0648\u0646', '\u062B\u0644\u0627\u062B\u0648\u0646', '\u0623\u0631\u0628\u0639\u0648\u0646', '\u062E\u0645\u0633\u0648\u0646', '\u0633\u062A\u0648\u0646', '\u0633\u0628\u0639\u0648\u0646', '\u062B\u0645\u0627\u0646\u0648\u0646', '\u062A\u0633\u0639\u0648\u0646']
const HUNDREDS = ['', '\u0645\u0626\u0629', '\u0645\u0626\u062A\u0627\u0646', '\u062B\u0644\u0627\u062B\u0645\u0626\u0629', '\u0623\u0631\u0628\u0639\u0645\u0626\u0629', '\u062E\u0645\u0633\u0645\u0626\u0629', '\u0633\u062A\u0645\u0626\u0629', '\u0633\u0628\u0639\u0645\u0626\u0629', '\u062B\u0645\u0627\u0646\u0645\u0626\u0629', '\u062A\u0633\u0639\u0645\u0626\u0629']

const WAW = ' \u0648'
const THOUSAND = '\u0623\u0644\u0641'
const THOUSAND_DUAL = '\u0623\u0644\u0641\u0627\u0646'
const THOUSANDS = '\u0622\u0644\u0627\u0641'

export function numberToArabicWords(n) {
  if (n === 0) return '\u0635\u0641\u0631'
  if (n < 0) return numberToArabicWords(-n)
  if (!isFinite(n)) return String(n)
  n = Math.floor(n)

  if (n < 10) return ONES[n]
  if (n < 20) return TEENS[n - 10]
  if (n < 100) {
    const t = Math.floor(n / 10)
    const u = n % 10
    if (u === 0) return TENS[t]
    return ONES[u] + WAW + TENS[t]
  }
  if (n < 1000) {
    const h = Math.floor(n / 100)
    const r = n % 100
    if (r === 0) return HUNDREDS[h]
    return HUNDREDS[h] + WAW + numberToArabicWords(r)
  }
  if (n < 1000000) {
    const th = Math.floor(n / 1000)
    const r = n % 1000
    let thWord
    if (th === 1) thWord = THOUSAND
    else if (th === 2) thWord = THOUSAND_DUAL
    else if (th <= 10) thWord = numberToArabicWords(th) + ' ' + THOUSANDS
    else thWord = numberToArabicWords(th) + ' ' + THOUSAND
    if (r === 0) return thWord
    return thWord + WAW + numberToArabicWords(r)
  }
  return String(n)
}

const METER = '\u0645\u062A\u0631'
const KILOMETER = '\u0643\u064A\u0644\u0648\u0645\u062A\u0631'
const KILOMETER_DUAL = '\u0643\u064A\u0644\u0648\u0645\u062A\u0631\u064A\u0646'
const AFTER = '\u0628\u0639\u062F '
const NOW = '\u0627\u0644\u0622\u0646'

export function spokenDistancePhrase(meters) {
  if (meters === null || meters === undefined) return ''
  if (meters < 30) return NOW
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10
    return AFTER + numberToArabicWords(rounded) + ' ' + METER
  }
  const km = Math.round(meters / 1000)
  if (km === 1) return AFTER + KILOMETER + ' \u0648\u0627\u062D\u062F'
  if (km === 2) return AFTER + KILOMETER_DUAL
  return AFTER + numberToArabicWords(km) + ' ' + KILOMETER
}

const MINUTE = '\u062F\u0642\u064A\u0642\u0629'
const MINUTE_DUAL = '\u062F\u0642\u064A\u0642\u062A\u0627\u0646'
const HOUR = '\u0633\u0627\u0639\u0629'
const HOUR_DUAL = '\u0633\u0627\u0639\u062A\u0627\u0646'

export function spokenDurationPhrase(seconds) {
  if (seconds === null || seconds === undefined) return ''
  const mins = Math.round(seconds / 60)
  if (mins < 1) return '\u0623\u0642\u0644 \u0645\u0646 ' + MINUTE
  if (mins === 1) return MINUTE + ' \u0648\u0627\u062D\u062F\u0629'
  if (mins === 2) return MINUTE_DUAL
  if (mins < 60) return numberToArabicWords(mins) + ' ' + MINUTE
  const h = Math.floor(mins / 60)
  const m = mins % 60
  let hWord
  if (h === 1) hWord = HOUR + ' \u0648\u0627\u062D\u062F\u0629'
  else if (h === 2) hWord = HOUR_DUAL
  else hWord = numberToArabicWords(h) + ' ' + HOUR
  if (m === 0) return hWord
  return hWord + WAW + ' ' + numberToArabicWords(m) + ' ' + MINUTE
}