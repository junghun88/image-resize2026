import { PresetImage, DevicePreset } from './types';

export const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'space-nebula',
    name: '우주 네뷸라 (Cosmic Space)',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
    description: '컬러풀한 은하와 별자리 배경화면'
  },
  {
    id: 'minimal-abstract',
    name: '파스텔 추상화 (Pastel Abstract)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: '부드러운 곡선과 미니멀한 감성 배경화면'
  },
  {
    id: 'cyberpunk',
    name: '네온 사이버펑크 (Cyberpunk Neon)',
    url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=1200&q=80',
    description: '도심 속 화려한 야경과 핑크/블루 네온 테마'
  },
  {
    id: 'sunset-mountain',
    name: '산과 일몰 (Sunset Mountain)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: '평화로운 산맥과 오렌지빛 일몰 풍경'
  },
  {
    id: 'autumn-cat',
    name: '귀여운 고양이 (Cozy Cat)',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    description: '아이폰 화면에 딱 들어오는 사랑스러운 고양이 스냅'
  }
];

export const CLOCK_FONTS = [
  { id: 'font-sf-bold', name: '기본 고딕 (SF Bold)', value: 'font-sans font-bold' },
  { id: 'font-sf-thin', name: '얇은 고딕 (SF Thin)', value: 'font-sans font-light' },
  { id: 'font-serif', name: '클래식 세리프 (Classic Serif)', value: 'font-serif font-semibold' },
  { id: 'font-mono', name: '테크 모노 (Tech Mono)', value: 'font-mono font-medium' },
  { id: 'font-rounded', name: '둥근 서체 (Rounded)', value: 'font-display font-bold' }
];

export const PRESET_GRADIENTS = [
  { name: '오로라 플로우', start: '#00c6ff', end: '#0072ff' },
  { name: '저녁 노을', start: '#f12711', end: '#f5af19' },
  { name: '라벤더 꿈', start: '#eecda3', end: '#ef629f' },
  { name: '네온 코랄', start: '#ff416c', end: '#ff4b2b' },
  { name: '심해수', start: '#12c2e9', end: '#c471ed' }
];

export const DEVICE_PRESETS: DevicePreset[] = [
  // --- iPhone 17 Series ---
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    width: 1320,
    height: 2868,
    aspectRatio: '19.5:9',
    screenSize: '6.9"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    width: 1206,
    height: 2622,
    aspectRatio: '19.5:9',
    screenSize: '6.3"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    width: 1206,
    height: 2622,
    aspectRatio: '19.5:9',
    screenSize: '6.3"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-17-slim',
    name: 'iPhone 17 Slim / Air',
    width: 1206,
    height: 2622,
    aspectRatio: '19.5:9',
    screenSize: '6.6"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  // --- iPhone 16 Series ---
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    width: 1320,
    height: 2868,
    aspectRatio: '19.5:9',
    screenSize: '6.9"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    width: 1206,
    height: 2622,
    aspectRatio: '19.5:9',
    screenSize: '6.3"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-16-plus',
    name: 'iPhone 16 Plus',
    width: 1290,
    height: 2796,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-16-16e',
    name: 'iPhone 16 / 16e',
    width: 1179,
    height: 2556,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  // --- iPhone 15 Series ---
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    width: 1290,
    height: 2796,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    width: 1179,
    height: 2556,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'dynamic-island',
    ppi: 461
  },
  {
    id: 'iphone-15-plus',
    name: 'iPhone 15 Plus',
    width: 1290,
    height: 2796,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    width: 1179,
    height: 2556,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  // --- iPhone 14 Series ---
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    width: 1290,
    height: 2796,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    width: 1179,
    height: 2556,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'dynamic-island',
    ppi: 460
  },
  {
    id: 'iphone-14-plus',
    name: 'iPhone 14 Plus',
    width: 1284,
    height: 2778,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'notch',
    ppi: 458
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    width: 1170,
    height: 2532,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'notch',
    ppi: 460
  },
  // --- iPhone 13 Series ---
  {
    id: 'iphone-13-pro-max',
    name: 'iPhone 13 Pro Max',
    width: 1284,
    height: 2778,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'notch',
    ppi: 458
  },
  {
    id: 'iphone-13-13-pro',
    name: 'iPhone 13 / 13 Pro',
    width: 1170,
    height: 2532,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'notch',
    ppi: 460
  },
  {
    id: 'iphone-13-mini',
    name: 'iPhone 13 mini',
    width: 1080,
    height: 2340,
    aspectRatio: '19.5:9',
    screenSize: '5.4"',
    notchType: 'notch',
    ppi: 476
  },
  // --- iPhone 12 Series ---
  {
    id: 'iphone-12-pro-max',
    name: 'iPhone 12 Pro Max',
    width: 1284,
    height: 2778,
    aspectRatio: '19.5:9',
    screenSize: '6.7"',
    notchType: 'notch',
    ppi: 458
  },
  {
    id: 'iphone-12-12-pro',
    name: 'iPhone 12 / 12 Pro',
    width: 1170,
    height: 2532,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'notch',
    ppi: 460
  },
  {
    id: 'iphone-12-mini',
    name: 'iPhone 12 mini',
    width: 1080,
    height: 2340,
    aspectRatio: '19.5:9',
    screenSize: '5.4"',
    notchType: 'notch',
    ppi: 476
  },
  // --- iPhone 11 Series ---
  {
    id: 'iphone-11-pro-max',
    name: 'iPhone 11 Pro Max / XS Max',
    width: 1242,
    height: 2688,
    aspectRatio: '19.5:9',
    screenSize: '6.5"',
    notchType: 'notch',
    ppi: 458
  },
  {
    id: 'iphone-11-pro',
    name: 'iPhone 11 Pro / XS / X',
    width: 1125,
    height: 2436,
    aspectRatio: '19.5:9',
    screenSize: '5.8"',
    notchType: 'notch',
    ppi: 458
  },
  {
    id: 'iphone-11-xr',
    name: 'iPhone 11 / XR',
    width: 828,
    height: 1792,
    aspectRatio: '19.5:9',
    screenSize: '6.1"',
    notchType: 'notch',
    ppi: 326
  }
];

