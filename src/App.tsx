import React, { useState, useEffect } from 'react';
import { Smartphone, Sparkles, RefreshCw, Layers, Sliders, Palette, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { ImageSettings, FilterSettings, MockupOverlay, DevicePreset } from './types';
import { PRESET_IMAGES, CLOCK_FONTS, DEVICE_PRESETS } from './presets';
import PhoneMockup from './components/PhoneMockup';
import SidebarControls from './components/SidebarControls';

export default function App() {
  // 1. Initial State Definitions
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(
    DEVICE_PRESETS.find(d => d.id === 'iphone-16-16e') || DEVICE_PRESETS[7]
  );
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    scale: 1.0,
    rotation: 0,
    xOffset: 0,
    yOffset: 0,
    fitMode: 'cover',
    bgStyle: 'blur',
    bgColor: '#121214',
    bgGradientStart: '#00c6ff',
    bgGradientEnd: '#0072ff',
    bgBlurAmount: 30,
    flipH: false,
    flipV: false
  });

  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    blur: 0,
    hueRotate: 0
  });

  const [mockupSettings, setMockupSettings] = useState<MockupOverlay>({
    showStatusBar: true,
    showDynamicIsland: true,
    showLockScreen: true,
    showHomeScreenIcons: false,
    showHomeIndicator: true,
    clockFont: CLOCK_FONTS[0].value,
    clockColor: '#ffffff',
    clockTime: '12:00',
    clockFormat24h: true,
    customDateText: ''
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 2. Real-time Clock Sync Hook
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setMockupSettings(prev => ({
        ...prev,
        clockTime: `${hours}:${minutes}`
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Status Notification Timeout helper
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification]);

  // 4. File Upload Handler
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validation check
      if (!file.type.startsWith('image/')) {
        showStatus('이미지 파일만 업로드할 수 있습니다.', 'error');
        return;
      }

      // Convert file into object URL
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      
      // Reset layout adjustments for the new image
      setImageSettings(prev => ({
        ...prev,
        scale: 1.0,
        rotation: 0,
        xOffset: 0,
        yOffset: 0,
        flipH: false,
        flipV: false
      }));

      showStatus('이미지가 성공적으로 업로드되었습니다. 원하는 크기로 맞춰보세요!', 'success');
    }
  };

  // Preset Selection Helper
  const handleSelectPreset = (url: string) => {
    setImageUrl(url);
    setImageSettings(prev => ({
      ...prev,
      scale: 1.0,
      rotation: 0,
      xOffset: 0,
      yOffset: 0,
      flipH: false,
      flipV: false
    }));
    showStatus('샘플 프리셋 이미지가 적용되었습니다.', 'success');
  };

  // Status Notification helper
  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  // State update callbacks
  const handleImageSettingsChange = (newSettings: Partial<ImageSettings>) => {
    setImageSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleFilterSettingsChange = (newSettings: Partial<FilterSettings>) => {
    setFilterSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleMockupSettingsChange = (newSettings: Partial<MockupOverlay>) => {
    setMockupSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleResetAll = () => {
    setImageSettings({
      scale: 1.0,
      rotation: 0,
      xOffset: 0,
      yOffset: 0,
      fitMode: 'cover',
      bgStyle: 'blur',
      bgColor: '#121214',
      bgGradientStart: '#00c6ff',
      bgGradientEnd: '#0072ff',
      bgBlurAmount: 30,
      flipH: false,
      flipV: false
    });
    setFilterSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 0
    });
    showStatus('모든 설정이 기본값으로 초기화되었습니다.', 'success');
  };

  // 5. Native Canvas Export Core Logic
  const handleDownload = async (includeOverlay: boolean, format: 'png' | 'jpeg') => {
    return new Promise<void>((resolve, reject) => {
      if (!imageUrl) {
        reject(new Error('No image loaded'));
        return;
      }

      const targetW = selectedDevice.width;
      const targetH = selectedDevice.height;

      const rx = targetW / 1179;
      const ry = targetH / 2556;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context could not be initialized'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      img.onload = () => {
        try {
          // A. Draw Background if Contain mode
          if (imageSettings.fitMode === 'contain') {
            if (imageSettings.bgStyle === 'color') {
              ctx.fillStyle = imageSettings.bgColor;
              ctx.fillRect(0, 0, targetW, targetH);
            } else if (imageSettings.bgStyle === 'gradient') {
              const grad = ctx.createLinearGradient(0, 0, targetW, targetH);
              grad.addColorStop(0, imageSettings.bgGradientStart);
              grad.addColorStop(1, imageSettings.bgGradientEnd);
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, targetW, targetH);
            } else if (imageSettings.bgStyle === 'blur') {
              ctx.save();
              // Native high-res canvas filter blur
              ctx.filter = `blur(${imageSettings.bgBlurAmount * (targetH / 580)}px) brightness(0.65) saturate(1.2)`;
              ctx.drawImage(img, -200 * rx, -200 * ry, targetW + 400 * rx, targetH + 400 * ry);
              ctx.restore();
              ctx.filter = 'none';
            }
          } else {
            // Fill background with black in Cover to avoid side gaps
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, targetW, targetH);
          }

          // B. Draw Main Image with position, rotation, scale, and filters
          ctx.save();

          const imgAspect = img.naturalWidth / img.naturalHeight;
          const screenAspect = targetW / targetH;
          let baseW = targetW;
          let baseH = targetH;

          if (imageSettings.fitMode === 'cover') {
            if (imgAspect > screenAspect) {
              baseH = targetH;
              baseW = targetH * imgAspect;
            } else {
              baseW = targetW;
              baseH = targetW / imgAspect;
            }
          } else {
            // contain
            if (imgAspect > screenAspect) {
              baseW = targetW;
              baseH = targetW / imgAspect;
            } else {
              baseH = targetH;
              baseW = targetH * imgAspect;
            }
          }

          // Translate to center + dragging offsets
          ctx.translate(targetW / 2 + imageSettings.xOffset * rx, targetH / 2 + imageSettings.yOffset * ry);
          
          // Rotate
          ctx.rotate((imageSettings.rotation * Math.PI) / 180);

          // Scale & Flip (flips achieved by negative scale)
          ctx.scale(
            imageSettings.scale * (imageSettings.flipH ? -1 : 1),
            imageSettings.scale * (imageSettings.flipV ? -1 : 1)
          );

          // Apply full CSS filters list to high-res canvas
          ctx.filter = `
            brightness(${filterSettings.brightness}%) 
            contrast(${filterSettings.contrast}%) 
            saturate(${filterSettings.saturation}%) 
            grayscale(${filterSettings.grayscale}%) 
            sepia(${filterSettings.sepia}%) 
            blur(${filterSettings.blur * (targetH / 580)}px) 
            hue-rotate(${filterSettings.hueRotate}deg)
          `;

          // Draw image centered at (0,0) of transformed space
          ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);

          ctx.restore();
          ctx.filter = 'none'; // reset

          // C. Optionally draw Apple iOS interface overlays
          if (includeOverlay) {
            ctx.save();
            ctx.fillStyle = mockupSettings.clockColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 1. Lock Screen Details (Clock / Date / Widgets)
            if (mockupSettings.showLockScreen && !mockupSettings.showHomeScreenIcons) {
              
              // Render Date
              ctx.font = `500 ${Math.round(48 * rx)}px sans-serif`;
              let dateText = mockupSettings.customDateText;
              if (!dateText) {
                const now = new Date();
                const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
                const month = now.getMonth() + 1;
                const date = now.getDate();
                const dayName = days[now.getDay()];
                dateText = `${month}월 ${date}일 ${dayName}`;
              }
              ctx.fillText(dateText, targetW / 2, 380 * ry);

              // Render Big iOS 18 Clock
              let canvasFont = `bold ${Math.round(220 * rx)}px sans-serif`;
              if (mockupSettings.clockFont.includes('font-light')) {
                canvasFont = `300 ${Math.round(220 * rx)}px sans-serif`;
              } else if (mockupSettings.clockFont.includes('font-serif')) {
                canvasFont = `600 ${Math.round(210 * rx)}px Georgia, serif`;
              } else if (mockupSettings.clockFont.includes('font-mono')) {
                canvasFont = `500 ${Math.round(190 * rx)}px monospace`;
              } else if (mockupSettings.clockFont.includes('font-display')) {
                canvasFont = `bold ${Math.round(220 * rx)}px "Space Grotesk", sans-serif`;
              }
              ctx.font = canvasFont;
              ctx.fillText(mockupSettings.clockTime, targetW / 2, 535 * ry);

              // Flashlight Circular Overlay Shortcut
              ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
              ctx.beginPath();
              ctx.arc(170 * rx, 2330 * ry, 75 * rx, 0, 2 * Math.PI);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = `${Math.round(40 * rx)}px sans-serif`;
              ctx.fillText('💡', 170 * rx, 2330 * ry);

              // Center Swipe bar text
              ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
              ctx.font = `500 ${Math.round(36 * rx)}px sans-serif`;
              const swipeText = selectedDevice.id.startsWith('galaxy-') ? '밀어서 잠금해제' : '쓸어올려서 열기';
              ctx.fillText(swipeText, targetW / 2, 2330 * ry);

              // Camera Circular Overlay Shortcut
              ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
              ctx.beginPath();
              ctx.arc(targetW - 170 * rx, 2330 * ry, 75 * rx, 0, 2 * Math.PI);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = `${Math.round(40 * rx)}px sans-serif`;
              ctx.fillText('📷', targetW - 170 * rx, 2330 * ry);
            }

            // 2. Home Screen Apps Grid Overlay
            if (mockupSettings.showHomeScreenIcons) {
              const apps = [
                { name: '전화', color: '#22c55e', icon: '📞' },
                { name: '메시지', color: '#4ade80', icon: '💬' },
                { name: 'Safari', color: '#3b82f6', icon: '🌐' },
                { name: '음악', color: '#ec4899', icon: '🎵' },
                { name: '사진', color: '#eab308', icon: '🖼️' },
                { name: '카메라', color: '#52525b', icon: '📷' },
                { name: 'App Store', color: '#0ea5e9', icon: '🅰️' },
                { name: '설정', color: '#6b7280', icon: '⚙️' },
              ];

              const gridStartX = 180 * rx;
              const gridStartY = 450 * ry;
              const colWidth = 270 * rx;
              const rowHeight = 250 * ry;
              const iconSize = 170 * rx;

              apps.forEach((app, idx) => {
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                const x = gridStartX + col * colWidth;
                const y = gridStartY + row * rowHeight;

                ctx.save();
                ctx.fillStyle = app.color;
                drawRoundedRect(ctx, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize, 36 * rx);
                ctx.fill();
                ctx.restore();

                ctx.font = `${Math.round(80 * rx)}px sans-serif`;
                ctx.fillText(app.icon, x, y);

                ctx.fillStyle = '#ffffff';
                ctx.font = `500 ${Math.round(32 * rx)}px sans-serif`;
                ctx.fillText(app.name, x, y + iconSize / 2 + 40 * ry);
              });

              // Bottom Dock Container
              ctx.save();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
              drawRoundedRect(ctx, 80 * rx, 2060 * ry, targetW - 160 * rx, 240 * ry, 60 * rx);
              ctx.fill();

              // Dock Apps
              const dockIcons = ['📞', '💬', '🌐', '🎵'];
              const dockStartX = 200 * rx;
              const dockSpacing = 260 * rx;
              dockIcons.forEach((icon, idx) => {
                const x = dockStartX + idx * dockSpacing;
                const y = 2180 * ry;
                
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                drawRoundedRect(ctx, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize, 36 * rx);
                ctx.fill();
                
                ctx.font = `${Math.round(80 * rx)}px sans-serif`;
                ctx.fillText(icon, x, y);
              });
              ctx.restore();
            }

            // 3. Status Bar Text & Icons
            if (mockupSettings.showStatusBar) {
              ctx.fillStyle = mockupSettings.clockColor;
              ctx.font = `600 ${Math.round(44 * rx)}px sans-serif`;
              ctx.textAlign = 'left';
              ctx.fillText(mockupSettings.clockTime, 140 * rx, 115 * ry);

              // Signal representation
              ctx.textAlign = 'right';
              ctx.font = `${Math.round(40 * rx)}px sans-serif`;
              ctx.fillText('📶  📶  🔋', targetW - 140 * rx, 115 * ry);
            }

            // 4. Notch / Dynamic Island / Punch Hole Overlay on Export
            if (mockupSettings.showDynamicIsland) {
              ctx.fillStyle = '#000000';
              if (selectedDevice.notchType === 'dynamic-island') {
                drawRoundedRect(ctx, targetW / 2 - 180 * rx, 50 * ry, 360 * rx, 100 * ry, 50 * rx);
                ctx.fill();
              } else if (selectedDevice.notchType === 'notch') {
                drawRoundedRect(ctx, targetW / 2 - 300 * rx, -10, 600 * rx, 100 * ry, 35 * rx);
                ctx.fill();
              } else if (selectedDevice.notchType === 'punch-hole') {
                ctx.beginPath();
                ctx.arc(targetW / 2, 75 * ry, 20 * rx, 0, 2 * Math.PI);
                ctx.fill();
              }
            }

            // 5. Home Swipe Indicator
            if (mockupSettings.showHomeIndicator) {
              ctx.fillStyle = mockupSettings.clockColor;
              drawRoundedRect(ctx, targetW / 2 - 200 * rx, targetH - 41 * ry, 400 * rx, 18 * ry, 9 * rx);
              ctx.fill();
            }

            ctx.restore();
          }

          // D. Initiate File Save Trigger
          const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
          const ext = format === 'png' ? 'png' : 'jpg';
          const quality = format === 'png' ? undefined : 0.95;

          const dataUrl = canvas.toDataURL(mimeType, quality);
          const downloadLink = document.createElement('a');
          
          const now = new Date();
          const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
          const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
          
          const sanitizedDeviceName = selectedDevice.name.replace(/[^a-zA-Z0-9]/g, '_');
          downloadLink.download = `${sanitizedDeviceName}_wallpaper_${dateStr}_${timeStr}.${ext}`;
          downloadLink.href = dataUrl;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          showStatus('배경화면이 완벽한 고해상도로 다운로드되었습니다!', 'success');
          resolve();
        } catch (err: any) {
          showStatus(`오류가 발생했습니다: ${err.message}`, 'error');
          reject(err);
        }
      };

      img.onerror = () => {
        showStatus('이미지를 불러오지 못했습니다. 크로스오리진(CORS) 제한이나 유효하지 않은 파일일 수 있습니다. 직접 이미지를 다시 올려보세요.', 'error');
        reject(new Error('Failed to load image on canvas'));
      };
    });
  };

  // Canvas rounding utility
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Fixed visual dimensions for preview mapping (Height = 580px)
  const displayHeight = 580;
  const displayWidth = displayHeight * (selectedDevice.width / selectedDevice.height);
  const scaleFactor = displayHeight / selectedDevice.height;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col justify-between">
      
      {/* Background ambient neon glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-sky-900/10 blur-[130px] pointer-events-none -z-10"></div>

      {/* ================= HEADER ================= */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl shadow-md text-white flex items-center justify-center">
              <Smartphone size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                아이폰 & 갤럭시 만능 배경화면 레졸루션 피터
                <span className="text-[10px] font-mono bg-indigo-500/15 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">v2.5</span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium">
                원하는 기종(iPhone / Galaxy)을 선택하고 이미지를 삽입하면 해당 모델 스크린 규격에 초고화질 최적화하여 맞춤 가공해줍니다.
              </p>
            </div>
          </div>

          {/* Quick Info & Resets */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetAll}
              className="px-3.5 py-2 text-xs font-semibold bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              설정 전체 초기화
            </button>
          </div>

        </div>
      </header>

      {/* ================= MAIN SCREEN CONTAINER ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Interactive Phone Mockup (cols: 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-zinc-900/30 p-6 rounded-3xl border border-zinc-900 shadow-xl backdrop-blur-sm self-stretch min-h-[660px]">
          <PhoneMockup 
            imageUrl={imageUrl}
            imageSettings={imageSettings}
            filterSettings={filterSettings}
            mockupSettings={mockupSettings}
            onChangeSettings={handleImageSettingsChange}
            scaleFactor={scaleFactor}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            selectedDevice={selectedDevice}
          />
        </div>

        {/* RIGHT COLUMN: Sidebar Configuration Controls (cols: 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full self-stretch min-h-[660px]">
          <SidebarControls 
            imageSettings={imageSettings}
            filterSettings={filterSettings}
            mockupSettings={mockupSettings}
            onChangeImageSettings={handleImageSettingsChange}
            onChangeFilterSettings={handleFilterSettingsChange}
            onChangeMockupSettings={handleMockupSettingsChange}
            onUploadImage={handleUploadImage}
            onSelectPreset={handleSelectPreset}
            onDownload={handleDownload}
            onResetAll={handleResetAll}
            imageUrl={imageUrl}
            selectedDevice={selectedDevice}
            onChangeDevice={setSelectedDevice}
          />
        </div>

      </main>

      {/* ================= STATUS / TOAST NOTIFICATIONS ================= */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm flex items-center gap-3 bg-zinc-900 border border-zinc-800 text-zinc-100 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className={`p-1.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <HelpCircle size={16} />}
          </div>
          <p className="text-xs font-semibold leading-snug">{notification.message}</p>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-6 text-center text-[11px] text-zinc-500 space-y-2">
        <p className="font-mono">
          {selectedDevice.name} Specifications: {selectedDevice.screenSize} Display • {selectedDevice.width} x {selectedDevice.height} px {selectedDevice.ppi ? `• ${selectedDevice.ppi} ppi` : ''} • {selectedDevice.aspectRatio} Aspect Ratio
        </p>
        <p className="text-zinc-600">
          본 사이트는 클라이언트 사이드 단독 동작 솔루션으로 제작되어, 사용자의 개인 사진이 서버로 전송되지 않고 브라우저 내에서 안전하고 신속하게 처리됩니다.
        </p>
      </footer>

    </div>
  );
}
