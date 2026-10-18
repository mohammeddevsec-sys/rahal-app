// حساب المسافة والاتجاه والموقع على خط السير بدون مكتبات خارجية
const R = 6371000; // نصف قطر الأرض بالمتر

export const toRad = (d) => (d * Math.PI) / 180;
export const toDeg = (r) => (r * 180) / Math.PI;

// مسافة Haversine بالمتر بين نقطتين {lat, lng}
export function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// اتجاه البوصلة من a إلى b (0=شمال، 90=شرق)
export function bearing(a, b) {
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) -
            Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// يبني فهرس تراكمي للمسافات على طول الخط
export function buildRouteIndex(route) {
  const cum = [0];
  for (let i = 1; i < route.length; i++) {
    cum.push(cum[i - 1] + haversine(route[i - 1], route[i]));
  }
  return { route, cum, total: cum[cum.length - 1] || 0 };
}

// يعطي النقطة والاتجاه عند مسافة معينة (بالمتر) على الخط
export function pointAtDistance(index, distance) {
  const { route, cum, total } = index;
  if (!route.length) return { point: null, bearing: 0 };
  if (total === 0) return { point: route[0], bearing: 0 };
  const d = Math.max(0, Math.min(distance, total));

  // بحث ثنائي
  let lo = 0, hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= d) lo = mid; else hi = mid;
  }
  const segLen = (cum[hi] - cum[lo]) || 1e-9;
  const t = (d - cum[lo]) / segLen;
  const a = route[lo], b = route[hi];
  return {
    point: {
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t,
    },
    bearing: bearing(a, b),
  };
}
