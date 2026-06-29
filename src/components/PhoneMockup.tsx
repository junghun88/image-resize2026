import React, { useRef, useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Camera, Lightbulb, Smartphone } from 'lucide-react';
import { ImageSettings, FilterSettings, MockupOverlay, DevicePreset } from '../types';

interface PhoneMockupProps {
  imageUrl: string;
  imageSettings: ImageSettings;
  filterSettings: FilterSettings;
  mockupSettings: MockupOverlay;
  onChangeSettings: (settings: Partial<ImageSettings>) => void;
  scaleFactor: number;
  displayWidth: number;
  displayHeight: number;
  selectedDevice: DevicePreset;
}

export default function PhoneMockup({
  imageUrl,
  imageSettings,
  filterSettings,
  mockupSettings,
  onChangeSettings,
  scaleFactor,
  displayWidth,
  displayHeight,
  selectedDevice
}: PhoneMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  // Update image natural dimensions when URL changes
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageUrl]);

  // Calculate base display size based on Fit Mode
  let baseW = displayWidth;
  let baseH = displayHeight;
  
  if (imgDimensions.width > 0 && imgDimensions.height > 0) {
    const imgAspect = imgDimensions.width / imgDimensions.height;
    const screenAspect = selectedDevice.width / selectedDevice.height;

    if (imageSettings.fitMode === 'cover') {
      if (imgAspect > screenAspect) {
        // Image is wider than screen aspect ratio
        baseH = displayHeight;
        baseW = displayHeight * imgAspect;
      } else {
        // Image is taller than screen aspect ratio
        baseW = displayWidth;
        baseH = displayWidth / imgAspect;
      }
    } else {
      // Contain
      if (imgAspect > screenAspect) {
        baseW = displayWidth;
        baseH = displayWidth / imgAspect;
      } else {
        baseH = displayHeight;
        baseW = displayHeight * imgAspect;
      }
    }
  }

  // Pointer Event handlers for drag-to-pan (works on mouse & touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only allow left click dragging
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { x: imageSettings.xOffset, y: imageSettings.yOffset };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Scale delta back to native 1179 x 2556 coordinate system
    const nativeDx = dx / scaleFactor;
    const nativeDy = dy / scaleFactor;
    
    onChangeSettings({
      xOffset: offsetStart.current.x + nativeDx,
      yOffset: offsetStart.current.y + nativeDy
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Build the CSS transform style
  const transformStyle = {
    width: `${baseW}px`,
    height: `${baseH}px`,
    left: `calc(50% - ${baseW / 2}px)`,
    top: `calc(50% - ${baseH / 2}px)`,
    transform: `
      translate(${imageSettings.xOffset * scaleFactor}px, ${imageSettings.yOffset * scaleFactor}px) 
      rotate(${imageSettings.rotation}deg) 
      scale(${imageSettings.scale * (imageSettings.flipH ? -1 : 1)}, ${imageSettings.scale * (imageSettings.flipV ? -1 : 1)})
    `,
    filter: `
      brightness(${filterSettings.brightness}%) 
      contrast(${filterSettings.contrast}%) 
      saturate(${filterSettings.saturation}%) 
      grayscale(${filterSettings.grayscale}%) 
      sepia(${filterSettings.sepia}%) 
      blur(${filterSettings.blur * scaleFactor}px)
      hue-rotate(${filterSettings.hueRotate}deg)
    `,
    position: 'absolute' as const,
    maxWidth: 'none',
    maxHeight: 'none',
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
  };

  // Render Lock Screen Day/Date (Korean localization)
  const renderDate = () => {
    if (mockupSettings.customDateText) {
      return mockupSettings.customDateText;
    }
    
    // Format: "6월 26일 금요일"
    const now = new Date();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayName = days[now.getDay()];
    return `${month}월 ${date}일 ${dayName}`;
  };

  // Dynamic status-bar text color or default to white
  const statusColorStyle = { color: mockupSettings.clockColor || '#ffffff' };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Phone Case Outer Border */}
      <div 
        id="iphone-16e-case"
        className="relative bg-zinc-900 p-3.5 rounded-[56px] shadow-2xl border border-zinc-800/80 ring-1 ring-black/10 flex items-center justify-center select-none"
        style={{
          width: `${displayWidth + 28}px`,
          height: `${displayHeight + 28}px`,
        }}
      >
        {/* Dynamic Island Physical Sensor (Above the screen glass on some frames, but we'll show it inside) */}
        
        {/* Screen Bezel / Glass */}
        <div 
          id="iphone-16e-screen"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative rounded-[42px] overflow-hidden bg-black flex flex-col justify-between cursor-grab active:cursor-grabbing select-none shadow-inner"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            touchAction: 'none'
          }}
        >
          {/* ================= BACKGROUND LAYER ================= */}
          {imageSettings.bgStyle === 'color' && (
            <div 
              className="absolute inset-0 z-0" 
              style={{ backgroundColor: imageSettings.bgColor }}
            />
          )}

          {imageSettings.bgStyle === 'gradient' && (
            <div 
              className="absolute inset-0 z-0" 
              style={{ 
                background: `linear-gradient(135deg, ${imageSettings.bgGradientStart}, ${imageSettings.bgGradientEnd})` 
              }}
            />
          )}

          {imageSettings.bgStyle === 'blur' && imageUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950">
              <img 
                src={imageUrl} 
                alt="Blurred Background"
                className="w-full h-full object-cover scale-150"
                style={{
                  filter: `blur(${imageSettings.bgBlurAmount * scaleFactor}px) brightness(0.65) saturate(1.2)`,
                }}
              />
            </div>
          )}

          {/* ================= CORE IMAGE LAYER ================= */}
          {imageUrl && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[42px]">
              <img 
                src={imageUrl} 
                alt="Wallpaper Canvas Source"
                style={transformStyle}
              />
            </div>
          )}

          {/* ================= WATERMARK/GUIDE GRID (Only when editing/dragging) ================= */}
          {isDragging && (
            <div className="absolute inset-0 z-20 pointer-events-none border-2 border-dashed border-sky-400/45 rounded-[42px] flex items-center justify-center">
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full opacity-40">
                <div className="border-r border-b border-sky-400/40"></div>
                <div className="border-r border-b border-sky-400/40"></div>
                <div className="border-b border-sky-400/40"></div>
                <div className="border-r border-b border-sky-400/40"></div>
                <div className="border-r border-b border-sky-400/40"></div>
                <div className="border-b border-sky-400/40"></div>
                <div className="border-r border-sky-400/40"></div>
                <div className="border-r border-sky-400/40"></div>
                <div></div>
              </div>
              <span className="absolute px-2.5 py-1 text-[10px] font-mono rounded bg-black/75 text-sky-400 font-medium">
                드래그하여 위치 이동 중... (dx: {Math.round(imageSettings.xOffset)}px, dy: {Math.round(imageSettings.yOffset)}px)
              </span>
            </div>
          )}

          {/* ================= INTERFACE OVERLAY LAYER ================= */}
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 pb-3.5 select-none text-white">
            
            {/* 1. TOP BAR (Status Bar & Dynamic Island) */}
            <div className="w-full flex items-center justify-between z-40 text-[11px] font-semibold px-2.5 pt-1.5">
              {/* Left: Clock */}
              {mockupSettings.showStatusBar && (
                <div className="w-14 text-left font-sans tracking-tight" style={statusColorStyle}>
                  {mockupSettings.clockTime}
                </div>
              )}

              {/* Center: Notch / Dynamic Island */}
              {mockupSettings.showDynamicIsland && selectedDevice.notchType === 'dynamic-island' && (
                <div 
                  id="dynamic-island"
                  className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[86px] h-6 bg-black rounded-full border border-zinc-800/50 shadow-lg flex items-center justify-between px-3 transition-all duration-300 pointer-events-auto hover:w-[120px] hover:h-8 group cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 group-hover:bg-amber-400/80 transition-colors"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 group-hover:bg-indigo-500/80 transition-colors"></div>
                </div>
              )}

              {mockupSettings.showDynamicIsland && selectedDevice.notchType === 'notch' && (
                <div 
                  id="notch"
                  className="absolute left-1/2 -translate-x-1/2 top-0 w-[130px] h-5 bg-black rounded-b-xl border-x border-b border-zinc-900/50 shadow-md flex items-center justify-center pointer-events-auto"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-950/90 border border-zinc-900 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-indigo-900"></div>
                  </div>
                </div>
              )}

              {/* Right: Signal / Wifi / Battery */}
              {mockupSettings.showStatusBar && (
                <div className="w-14 flex items-center justify-end gap-1" style={statusColorStyle}>
                  <Signal size={12} strokeWidth={2.5} />
                  <Wifi size={12} strokeWidth={2.5} />
                  <Battery size={14} strokeWidth={2.5} className="fill-current" />
                </div>
              )}
            </div>

            {/* 2. LOCK SCREEN OVERLAY */}
            {mockupSettings.showLockScreen && !mockupSettings.showHomeScreenIcons && (
              <div className="flex-1 flex flex-col items-center justify-start pt-8 text-center">
                {/* Date */}
                <p 
                  className="text-[12px] font-medium tracking-tight opacity-90 drop-shadow-md mb-0.5"
                  style={{ color: mockupSettings.clockColor }}
                >
                  {renderDate()}
                </p>
                {/* Big Clock */}
                <h1 
                  className={`text-[54px] leading-tight tracking-tight drop-shadow-lg select-none ${mockupSettings.clockFont}`}
                  style={{ color: mockupSettings.clockColor }}
                >
                  {mockupSettings.clockTime}
                </h1>
                
                {/* Visual Widget Space Spacer */}
                <div className="mt-2.5 px-3 py-1 bg-black/15 backdrop-blur-[2px] rounded-xl text-[9px] text-white/70 font-medium drop-shadow flex items-center gap-1 border border-white/5">
                  <Smartphone size={10} /> {selectedDevice.name} {selectedDevice.screenSize} ({selectedDevice.width}×{selectedDevice.height})
                </div>
              </div>
            )}

            {/* 3. HOME SCREEN ICONS OVERLAY */}
            {mockupSettings.showHomeScreenIcons && (
              <div className="flex-1 flex flex-col justify-end pt-12 pb-16">
                {/* Icon Grid */}
                <div className="grid grid-cols-4 gap-y-5 gap-x-3 px-1">
                  {[
                    { name: '전화', color: 'bg-green-500', icon: '📞' },
                    { name: '메시지', color: 'bg-green-400', icon: '💬' },
                    { name: 'Safari', color: 'bg-blue-500', icon: '🌐' },
                    { name: '음악', color: 'bg-pink-500', icon: '🎵' },
                    { name: '사진', color: 'bg-yellow-400', icon: '🖼️' },
                    { name: '카메라', color: 'bg-zinc-600', icon: '📷' },
                    { name: 'App Store', color: 'bg-sky-500', icon: '🅰️' },
                    { name: '설정', color: 'bg-gray-500', icon: '⚙️' },
                  ].map((app, index) => (
                    <div key={index} className="flex flex-col items-center gap-0.5">
                      <div className={`w-[44px] h-[44px] ${app.color} rounded-xl shadow-md flex items-center justify-center text-lg`}>
                        {app.icon}
                      </div>
                      <span className="text-[9px] font-medium text-white tracking-tight drop-shadow-md select-none text-center">
                        {app.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid Spacer */}
                <div className="flex-1"></div>

                {/* Dock */}
                <div className="bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex justify-around gap-1 shadow-lg mx-1 mt-6">
                  {['📞', '💬', '🌐', '🎵'].map((icon, index) => (
                    <div key={index} className="w-[44px] h-[44px] bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl shadow flex items-center justify-center text-lg transition-transform cursor-pointer">
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. BOTTOM BAR (Flashlight / Camera Shortcuts & Home Indicator) */}
            <div className="w-full flex flex-col items-center gap-4 z-40 px-2.5">
              {mockupSettings.showLockScreen && !mockupSettings.showHomeScreenIcons && (
                <div className="w-full flex items-center justify-between">
                  {/* Flashlight */}
                  <div className="w-[38px] h-[38px] bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-lg active:bg-white active:text-black transition-colors cursor-pointer">
                    <Lightbulb size={17} strokeWidth={2.2} />
                  </div>
                  {/* Swipe Guide Text */}
                  <span className="text-[10px] font-medium text-white/60 tracking-wider drop-shadow select-none">
                    쓸어올려서 열기
                  </span>
                  {/* Camera */}
                  <div className="w-[38px] h-[38px] bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-lg active:bg-white active:text-black transition-colors cursor-pointer">
                    <Camera size={17} strokeWidth={2.2} />
                  </div>
                </div>
              )}

              {/* Home swipe indicator bar */}
              {mockupSettings.showHomeIndicator && (
                <div 
                  id="home-indicator"
                  className="w-[90px] h-1.5 rounded-full drop-shadow shadow-md"
                  style={{ backgroundColor: mockupSettings.clockColor || '#ffffff' }}
                ></div>
              )}
            </div>

          </div>

          {/* Glass glare effect reflection overlay */}
          <div className="absolute inset-0 z-35 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-60"></div>
        </div>
      </div>

      {/* Screen diagonal / details subtitle under the phone */}
      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700 shadow">
          {selectedDevice.name} Screen Mockup — {selectedDevice.width} × {selectedDevice.height} ({selectedDevice.aspectRatio} Ratio)
        </span>
        <span className="text-[10px] text-zinc-500">
          마우스나 손가락으로 화면 안을 드래그하여 배경화면 위치를 맞출 수 있습니다.
        </span>
      </div>
    </div>
  );
}
