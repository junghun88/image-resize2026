import { PresetImage } from './types';

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
