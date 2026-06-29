export type FitMode = 'cover' | 'contain';

export type BackgroundStyle = 'color' | 'blur' | 'gradient';

export interface ImageSettings {
  scale: number;
  rotation: number;
  xOffset: number;
  yOffset: number;
  fitMode: FitMode;
  bgStyle: BackgroundStyle;
  bgColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgBlurAmount: number;
  flipH: boolean;
  flipV: boolean;
}

export interface FilterSettings {
  brightness: number;  // 0 - 200 (default 100)
  contrast: number;    // 0 - 200 (default 100)
  saturation: number;  // 0 - 200 (default 100)
  grayscale: number;   // 0 - 100 (default 0)
  sepia: number;       // 0 - 100 (default 0)
  blur: number;        // 0 - 20 (default 0)
  hueRotate: number;   // 0 - 360 (default 0)
}

export interface MockupOverlay {
  showStatusBar: boolean;
  showDynamicIsland: boolean;
  showLockScreen: boolean;
  showHomeScreenIcons: boolean;
  showHomeIndicator: boolean;
  clockFont: string;
  clockColor: string;
  clockTime: string;
  clockFormat24h: boolean;
  customDateText: string;
}

export interface PresetImage {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  screenSize: string;
  notchType: 'notch' | 'dynamic-island' | 'punch-hole' | 'none';
  ppi?: number;
}

