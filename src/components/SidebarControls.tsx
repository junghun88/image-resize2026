import React, { useState } from 'react';
import { 
  Upload, Layers, Sliders, Palette, Shield, Smartphone, Download, 
  RotateCcw, SlidersHorizontal, RefreshCw, FlipHorizontal, FlipVertical,
  Check, Eye, Sparkles, AlertCircle, Search, X, Loader2
} from 'lucide-react';
import { ImageSettings, FilterSettings, MockupOverlay, PresetImage, DevicePreset } from '../types';
import { PRESET_IMAGES, CLOCK_FONTS, PRESET_GRADIENTS } from '../presets';

interface SidebarControlsProps {
  imageSettings: ImageSettings;
  filterSettings: FilterSettings;
  mockupSettings: MockupOverlay;
  onChangeImageSettings: (settings: Partial<ImageSettings>) => void;
  onChangeFilterSettings: (settings: Partial<FilterSettings>) => void;
  onChangeMockupSettings: (settings: Partial<MockupOverlay>) => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPreset: (url: string) => void;
  onDownload: (includeOverlay: boolean, format: 'png' | 'jpeg') => void;
  onResetAll: () => void;
  imageUrl: string;
  selectedDevice: DevicePreset;
  onChangeDevice: (device: DevicePreset) => void;
  devicePresets: DevicePreset[];
  onAddCustomDevice: (device: DevicePreset) => void;
}

export default function SidebarControls({
  imageSettings,
  filterSettings,
  mockupSettings,
  onChangeImageSettings,
  onChangeFilterSettings,
  onChangeMockupSettings,
  onUploadImage,
  onSelectPreset,
  onDownload,
  onResetAll,
  imageUrl,
  selectedDevice,
  onChangeDevice,
  devicePresets,
  onAddCustomDevice
}: SidebarControlsProps) {
  const [activeTab, setActiveTab] = useState<'source' | 'adjust' | 'style' | 'overlay'>('source');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [includeOverlayOnExport, setIncludeOverlayOnExport] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // AI Resolution Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);

  // Quick reset functions
  const handleResetPosition = () => {
    onChangeImageSettings({
      scale: 1.0,
      rotation: 0,
      xOffset: 0,
      yOffset: 0,
      flipH: false,
      flipV: false
    });
  };

  const handleResetFilters = () => {
    onChangeFilterSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 0
    });
  };

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      await onDownload(includeOverlayOnExport, exportFormat);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAISearchResolution = async () => {
    if (!searchQuery.trim()) {
      setSearchError('모델명을 입력해주세요.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchSuccess(null);

    try {
      const response = await fetch('/api/search-resolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '스펙을 불러오지 못했습니다.');
      }

      const data: DevicePreset = await response.json();
      onAddCustomDevice(data);
      setSearchSuccess(`성공! ${data.name} (${data.width}x${data.height}px) 스펙을 적용했습니다.`);
      setSearchQuery('');
      
      // Auto dismiss success toast
      setTimeout(() => setSearchSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || '인터넷 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  const presetColors = [
    '#000000', '#ffffff', '#1e293b', '#ef4444', 
    '#f97316', '#eab308', '#22c55e', '#06b6d4', 
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
  ];

  const presetClockColors = [
    '#ffffff', '#000000', '#fecdd3', '#fed7aa', 
    '#fef08a', '#d9f99d', '#ccfbf1', '#e0f2fe', 
    '#e0e7ff', '#f3e8ff', '#fbcfe8', '#cbd5e1'
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 rounded-3xl border border-zinc-800/80 shadow-2xl backdrop-blur-md overflow-hidden">
      
      {/* Smartphone Model Selection Header Card */}
      <div className="bg-zinc-900/40 border-b border-zinc-800/80 p-4 flex flex-col gap-2.5">
        
        {/* Title and resolution display */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-tight text-zinc-300 flex items-center gap-1.5">
            <Smartphone size={14} className="text-sky-400" />
            대상 스마트폰 모델 선택 및 검색
          </label>
          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/15 px-2 py-0.5 rounded">
            {selectedDevice.width} × {selectedDevice.height} px
          </span>
        </div>

        {/* 1. 스마트폰 모델명 실시간 검색창 */}
        <div className="relative flex gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAISearchResolution();
                }
              }}
              placeholder="모델명 검색 (예: S24 Ultra, Note 20, Pixel 9)"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 pl-8.5 pr-8 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 placeholder-zinc-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 pointer-events-none">
              <Search size={13} />
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchError(null);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <button
            onClick={handleAISearchResolution}
            disabled={isSearching}
            className="px-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:from-zinc-800 disabled:to-zinc-800 text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
          >
            {isSearching ? (
              <Loader2 size={13} className="animate-spin text-white" />
            ) : (
              <Sparkles size={12} className="text-yellow-200" />
            )}
            AI 검색
          </button>
        </div>

        {/* Search Status (Loading, Error, Success) */}
        {isSearching && (
          <div className="text-[11px] text-sky-400 flex items-center gap-1.5 bg-sky-500/5 border border-sky-500/10 px-3 py-2 rounded-xl">
            <Loader2 size={12} className="animate-spin" />
            <span>AI가 인터넷에서 <strong>"{searchQuery}"</strong> 모델의 공식 해상도를 조회하는 중입니다...</span>
          </div>
        )}

        {searchError && (
          <div className="text-[11px] text-red-400 flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 px-3 py-2 rounded-xl">
            <AlertCircle size={12} className="shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {searchSuccess && (
          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl">
            <Check size={12} className="shrink-0" />
            <span>{searchSuccess}</span>
          </div>
        )}

        {/* 2. 스마트폰 선택 드롭다운 (실시간 검색어 필터링 지원) */}
        <div className="relative">
          <select
            value={selectedDevice.id}
            onChange={(e) => {
              const found = devicePresets.find(d => d.id === e.target.value);
              if (found) {
                onChangeDevice(found);
                setSearchError(null);
                setSearchSuccess(null);
              }
            }}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none cursor-pointer"
          >
            {/* Filtered drop-down results if query is present, otherwise full preset categories */}
            {searchQuery.trim() ? (
              <optgroup label={`"${searchQuery}" 검색 결과`} className="bg-zinc-950 text-sky-400 font-semibold text-[11px] py-1">
                {devicePresets
                  .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((dev) => (
                    <option key={dev.id} value={dev.id} className="bg-zinc-950 text-zinc-100 font-normal font-sans text-xs">
                      {dev.name} ({dev.screenSize}, {dev.width}×{dev.height})
                    </option>
                  ))
                }
                {devicePresets.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <option disabled className="bg-zinc-950 text-zinc-500 text-xs">
                    로컬 프리셋에 일치하는 모델 없음 (우측 'AI 검색'을 눌러보세요)
                  </option>
                )}
              </optgroup>
            ) : (
              <>
                {devicePresets.some(d => !d.id.startsWith('iphone-') && !d.id.startsWith('galaxy-')) && (
                  <optgroup label="✨ 최근 검색 / 사용자 기기" className="bg-zinc-950 text-amber-400 font-semibold text-[11px] py-1">
                    {devicePresets
                      .filter(d => !d.id.startsWith('iphone-') && !d.id.startsWith('galaxy-'))
                      .map((dev) => (
                        <option key={dev.id} value={dev.id} className="bg-zinc-950 text-zinc-100 font-normal font-sans text-xs">
                          {dev.name} ({dev.screenSize}, {dev.width}×{dev.height})
                        </option>
                      ))}
                  </optgroup>
                )}
                
                <optgroup label="Apple iPhone" className="bg-zinc-950 text-sky-400 font-semibold text-[11px] py-1">
                  {devicePresets.filter(d => d.id.startsWith('iphone-')).map((dev) => (
                    <option key={dev.id} value={dev.id} className="bg-zinc-950 text-zinc-100 font-normal font-sans text-xs">
                      {dev.name} ({dev.screenSize}, {dev.width}×{dev.height})
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="Samsung Galaxy S" className="bg-zinc-950 text-emerald-400 font-semibold text-[11px] py-1">
                  {devicePresets.filter(d => d.id.startsWith('galaxy-')).map((dev) => (
                    <option key={dev.id} value={dev.id} className="bg-zinc-950 text-zinc-100 font-normal font-sans text-xs">
                      {dev.name} ({dev.screenSize}, {dev.width}×{dev.height})
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
            <Smartphone size={13} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Selected device detail pills */}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          <span className="text-[9px] font-mono font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800/50 px-2 py-0.5 rounded">
            {selectedDevice.screenSize} Display
          </span>
          <span className="text-[9px] font-mono font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800/50 px-2 py-0.5 rounded">
            {selectedDevice.aspectRatio} Ratio
          </span>
          {selectedDevice.ppi && (
            <span className="text-[9px] font-mono font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800/50 px-2 py-0.5 rounded">
              {selectedDevice.ppi} ppi
            </span>
          )}
          <span className="text-[9px] font-mono font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800/50 px-2 py-0.5 rounded">
            Camera/Notch: {selectedDevice.notchType === 'dynamic-island' ? 'Dynamic Island' : selectedDevice.notchType === 'notch' ? 'Notch' : selectedDevice.notchType === 'punch-hole' ? 'Punch Hole' : 'None'}
          </span>
        </div>
      </div>
      
      {/* Tab Navigation Menu */}
      <div className="flex border-b border-zinc-800/80 bg-zinc-950/60 p-2 gap-1">
        {[
          { id: 'source', label: '이미지 선택', icon: Upload },
          { id: 'adjust', label: '맞춤 & 조절', icon: Sliders },
          { id: 'style', label: '필터 & 배경', icon: Palette },
          { id: 'overlay', label: '미리보기 설정', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-zinc-800 text-white shadow' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Icon size={16} className="mb-1" />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Controls Scrolling Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* ================= TAB 1: SOURCE ================= */}
        {activeTab === 'source' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <Upload size={16} className="text-sky-400" />
                이미지 삽입 (Upload & Select)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                선택한 {selectedDevice.name}에 맞출 이미지를 업로드하거나, 준비된 배경화면을 시험 삼아 선택해보세요.
              </p>
            </div>

            {/* Custom Upload Dropzone */}
            <div className="relative group">
              <label 
                htmlFor="wallpaper-file-input"
                className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-sky-500 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer p-4 text-center"
              >
                <div className="p-3 bg-zinc-800/80 rounded-full group-hover:scale-110 transition-transform duration-200">
                  <Upload size={20} className="text-zinc-400 group-hover:text-sky-400" />
                </div>
                <span className="mt-2.5 text-xs font-medium text-zinc-200">
                  컴퓨터나 모바일에서 이미지 선택
                </span>
                <span className="mt-1 text-[10px] text-zinc-500">
                  PNG, JPG, WEBP 파일 지원 (초고화질 권장)
                </span>
              </label>
              <input 
                id="wallpaper-file-input"
                type="file" 
                accept="image/*" 
                onChange={onUploadImage} 
                className="hidden"
              />
            </div>

            {/* Presets List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-300 block">
                추천 샘플 이미지 (Preset Gallery)
              </span>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_IMAGES.map((preset) => {
                  const isSelected = imageUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onSelectPreset(preset.url)}
                      className={`relative flex flex-col text-left rounded-xl overflow-hidden border bg-zinc-900 group transition-all duration-200 ${
                        isSelected 
                          ? 'border-sky-500 ring-1 ring-sky-500/30' 
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="h-20 w-full overflow-hidden relative">
                        <img 
                          src={preset.url} 
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="p-1 bg-sky-500 rounded-full text-white">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <span className="text-[10px] font-semibold text-zinc-200 block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[8px] text-zinc-500 block truncate mt-0.5">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ADJUST ================= */}
        {activeTab === 'adjust' && (
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Sliders size={16} className="text-sky-400" />
                  정밀 크기 및 위치 조정
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  회전, 대칭 및 미세한 스케일 조정을 통해 황금 비율을 맞추어보세요.
                </p>
              </div>
              <button 
                onClick={handleResetPosition}
                title="조정 초기화"
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Layout Fit Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                배경 채우기 모드 (Fit Mode)
              </label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => onChangeImageSettings({ fitMode: 'cover' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    imageSettings.fitMode === 'cover'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  꽉 채우기 (Cover)
                </button>
                <button
                  onClick={() => onChangeImageSettings({ fitMode: 'contain' })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                    imageSettings.fitMode === 'contain'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  비율 맞춤 (Contain)
                </button>
              </div>
            </div>

            {/* Scale (Zoom) Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-300">
                  배율 조절 (Scale / Zoom)
                </label>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                  {imageSettings.scale.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="4.0"
                step="0.05"
                value={imageSettings.scale}
                onChange={(e) => onChangeImageSettings({ scale: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>0.1x</span>
                <span>1.0x (원본)</span>
                <span>4.0x</span>
              </div>
            </div>

            {/* Rotation Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-300">
                  회전 각도 (Rotate)
                </label>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                  {imageSettings.rotation}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={imageSettings.rotation}
                onChange={(e) => onChangeImageSettings({ rotation: parseInt(e.target.value) })}
                className="w-full accent-sky-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>-180°</span>
                <span>0° (정방향)</span>
                <span>180°</span>
              </div>
            </div>

            {/* Manual X, Y Position Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-300">가로 이동 (X)</label>
                  <span className="text-[9px] font-mono text-zinc-500">{Math.round(imageSettings.xOffset)}px</span>
                </div>
                <input
                  type="range"
                  min="-800"
                  max="800"
                  value={imageSettings.xOffset}
                  onChange={(e) => onChangeImageSettings({ xOffset: parseInt(e.target.value) })}
                  className="w-full accent-sky-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-300">세로 이동 (Y)</label>
                  <span className="text-[9px] font-mono text-zinc-500">{Math.round(imageSettings.yOffset)}px</span>
                </div>
                <input
                  type="range"
                  min="-1200"
                  max="1200"
                  value={imageSettings.yOffset}
                  onChange={(e) => onChangeImageSettings({ yOffset: parseInt(e.target.value) })}
                  className="w-full accent-sky-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Flips (Symmetry) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 block">좌우/상하 반전</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onChangeImageSettings({ flipH: !imageSettings.flipH })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    imageSettings.flipH 
                      ? 'bg-zinc-800 border-sky-500 text-sky-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <FlipHorizontal size={14} />
                  좌우 대칭 반전
                </button>
                <button
                  onClick={() => onChangeImageSettings({ flipV: !imageSettings.flipV })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    imageSettings.flipV 
                      ? 'bg-zinc-800 border-sky-500 text-sky-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <FlipVertical size={14} />
                  상하 대칭 반전
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: STYLE ================= */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            
            {/* 1. Background options (When contain mode) */}
            {imageSettings.fitMode === 'contain' && (
              <div className="space-y-4 border-b border-zinc-900 pb-5">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">배경 스타일링 (Contain Mode Background)</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">화면 비율 맞춤 모드에서만 적용되는 배경 설정입니다.</p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  {(['color', 'gradient', 'blur'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onChangeImageSettings({ bgStyle: style })}
                      className={`py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        imageSettings.bgStyle === style
                          ? 'bg-zinc-800 text-white shadow'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {style === 'color' && '단색'}
                      {style === 'gradient' && '그라디언트'}
                      {style === 'blur' && '이미지 블러'}
                    </button>
                  ))}
                </div>

                {/* Color Background options */}
                {imageSettings.bgStyle === 'color' && (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <span className="text-[11px] text-zinc-400">색상 선택:</span>
                      <input 
                        type="color" 
                        value={imageSettings.bgColor}
                        onChange={(e) => onChangeImageSettings({ bgColor: e.target.value })}
                        className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">{imageSettings.bgColor}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => onChangeImageSettings({ bgColor: color })}
                          className={`w-full h-6 rounded-md border border-zinc-800 transition-transform ${
                            imageSettings.bgColor === color ? 'scale-110 ring-1 ring-sky-500' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Gradient Background options */}
                {imageSettings.bgStyle === 'gradient' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400">시작:</span>
                        <input 
                          type="color" 
                          value={imageSettings.bgGradientStart}
                          onChange={(e) => onChangeImageSettings({ bgGradientStart: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{imageSettings.bgGradientStart}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-400">종료:</span>
                        <input 
                          type="color" 
                          value={imageSettings.bgGradientEnd}
                          onChange={(e) => onChangeImageSettings({ bgGradientEnd: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">{imageSettings.bgGradientEnd}</span>
                      </div>
                    </div>
                    {/* Presets Gradients */}
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_GRADIENTS.map((grad, idx) => (
                        <button
                          key={idx}
                          onClick={() => onChangeImageSettings({ bgGradientStart: grad.start, bgGradientEnd: grad.end })}
                          className="h-7 rounded-lg border border-zinc-800 flex items-center justify-center p-1 hover:scale-[1.02] transition-transform"
                          style={{ background: `linear-gradient(90deg, ${grad.start}, ${grad.end})` }}
                        >
                          <span className="text-[9px] font-medium text-white px-1 py-0.5 rounded bg-black/45 select-none">{grad.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blur Background Options */}
                {imageSettings.bgStyle === 'blur' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>배경 흐림 강도 (Blur Radius)</span>
                      <span className="font-mono">{imageSettings.bgBlurAmount}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={imageSettings.bgBlurAmount}
                      onChange={(e) => onChangeImageSettings({ bgBlurAmount: parseInt(e.target.value) })}
                      className="w-full accent-sky-500 h-1 bg-zinc-800 rounded appearance-none cursor-pointer"
                    />
                  </div>
                )}

              </div>
            )}

            {/* 2. Image Filters */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-zinc-400" />
                  이미지 필터 (Filters)
                </h4>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  <RotateCcw size={10} /> 필터 초기화
                </button>
              </div>

              {/* Slider list */}
              <div className="space-y-3">
                
                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">밝기 (Brightness)</span>
                    <span className="text-zinc-300 font-mono">{filterSettings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={filterSettings.brightness}
                    onChange={(e) => onChangeFilterSettings({ brightness: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">대비 (Contrast)</span>
                    <span className="text-zinc-300 font-mono">{filterSettings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={filterSettings.contrast}
                    onChange={(e) => onChangeFilterSettings({ contrast: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">채도 (Saturation)</span>
                    <span className="text-zinc-300 font-mono">{filterSettings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filterSettings.saturation}
                    onChange={(e) => onChangeFilterSettings({ saturation: parseInt(e.target.value) })}
                    className="w-full accent-amber-400 h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">블러 효과 (Blur)</span>
                    <span className="text-zinc-300 font-mono">{filterSettings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={filterSettings.blur}
                    onChange={(e) => onChangeFilterSettings({ blur: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                  />
                </div>

                {/* Grayscale & Sepia in Grid */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">흑백</span>
                      <span className="text-zinc-300 font-mono">{filterSettings.grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterSettings.grayscale}
                      onChange={(e) => onChangeFilterSettings({ grayscale: parseInt(e.target.value) })}
                      className="w-full accent-zinc-500 h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">세피아</span>
                      <span className="text-zinc-300 font-mono">{filterSettings.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterSettings.sepia}
                      onChange={(e) => onChangeFilterSettings({ sepia: parseInt(e.target.value) })}
                      className="w-full accent-orange-600 h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 4: OVERLAY ================= */}
        {activeTab === 'overlay' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <Smartphone size={16} className="text-sky-400" />
                미리보기 화면 설정
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                실제 아이폰 인터페이스 요소를 켜고 꺼보면서 최적의 구도를 찾아내세요.
              </p>
            </div>

            {/* Toggle Switch Lists */}
            <div className="space-y-3 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
              <span className="text-xs font-semibold text-zinc-300 block mb-1">UI 활성화/비활성화</span>
              
              {/* StatusBar */}
              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <span className="text-xs text-zinc-300">상단 상태바 (시계/배터리/Wi-Fi)</span>
                <input 
                  type="checkbox"
                  checked={mockupSettings.showStatusBar}
                  onChange={(e) => onChangeMockupSettings({ showStatusBar: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 bg-zinc-800 border-zinc-700 accent-sky-500"
                />
              </label>

              {/* Dynamic Island */}
              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <span className="text-xs text-zinc-300">다이내믹 아일랜드 (Dynamic Island)</span>
                <input 
                  type="checkbox"
                  checked={mockupSettings.showDynamicIsland}
                  onChange={(e) => onChangeMockupSettings({ showDynamicIsland: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 bg-zinc-800 border-zinc-700 accent-sky-500"
                />
              </label>

              {/* Home indicator */}
              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <span className="text-xs text-zinc-300">하단 스와이프 바 (Home Indicator)</span>
                <input 
                  type="checkbox"
                  checked={mockupSettings.showHomeIndicator}
                  onChange={(e) => onChangeMockupSettings({ showHomeIndicator: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 bg-zinc-800 border-zinc-700 accent-sky-500"
                />
              </label>

              {/* App Screen vs Lock Screen Toggle */}
              <div className="pt-2 border-t border-zinc-800/80 mt-2">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">화면 모드 변경</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChangeMockupSettings({ showLockScreen: true, showHomeScreenIcons: false })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      !mockupSettings.showHomeScreenIcons
                        ? 'bg-zinc-800 text-white shadow border border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                    }`}
                  >
                    잠금 화면 (Lock)
                  </button>
                  <button
                    onClick={() => onChangeMockupSettings({ showLockScreen: false, showHomeScreenIcons: true })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      mockupSettings.showHomeScreenIcons
                        ? 'bg-zinc-800 text-white shadow border border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                    }`}
                  >
                    홈 화면 (Apps)
                  </button>
                </div>
              </div>
            </div>

            {/* Lockscreen clock and fonts customizer */}
            {!mockupSettings.showHomeScreenIcons && mockupSettings.showLockScreen && (
              <div className="space-y-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-300 block">잠금 화면 세부 커스텀</span>

                {/* Clock Font Family */}
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-400">시계 글꼴 (iOS 18 Font Style)</label>
                  <select
                    value={mockupSettings.clockFont}
                    onChange={(e) => onChangeMockupSettings({ clockFont: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl p-2 focus:ring-1 focus:ring-sky-500 outline-none"
                  >
                    {CLOCK_FONTS.map((font) => (
                      <option key={font.id} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clock Color Customizer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-zinc-400">오버레이 색상 (UI Color)</label>
                    <input 
                      type="color" 
                      value={mockupSettings.clockColor}
                      onChange={(e) => onChangeMockupSettings({ clockColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border border-zinc-700 bg-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {presetClockColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => onChangeMockupSettings({ clockColor: color })}
                        className={`w-full h-5 rounded-md border border-zinc-800 transition-transform ${
                          mockupSettings.clockColor.toLowerCase() === color.toLowerCase() ? 'scale-110 ring-1 ring-sky-500' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Date Text */}
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-400">날짜 표시 문구 커스텀 (옵션)</label>
                  <input
                    type="text"
                    value={mockupSettings.customDateText}
                    onChange={(e) => onChangeMockupSettings({ customDateText: e.target.value })}
                    placeholder="예: 금요일, 6월 26일"
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-xl p-2 outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ================= PERSISTENT BOTTOM DOWNLOAD PANEL ================= */}
      <div className="p-5 border-t border-zinc-800/80 bg-zinc-950/80 space-y-4">
        
        {/* Save Options */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          {/* Format Selection */}
          <div className="flex gap-2 items-center bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
            <span>포맷:</span>
            <button 
              onClick={() => setExportFormat('png')} 
              className={`font-semibold ${exportFormat === 'png' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PNG
            </button>
            <span className="text-zinc-700">|</span>
            <button 
              onClick={() => setExportFormat('jpeg')} 
              className={`font-semibold ${exportFormat === 'jpeg' ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              JPG
            </button>
          </div>

          {/* Toggle include overlays on export */}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200">
            <input 
              type="checkbox"
              checked={includeOverlayOnExport}
              onChange={(e) => setIncludeOverlayOnExport(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-700 accent-sky-500"
            />
            <span className="text-[11px] font-medium">iOS 화면 오버레이 포함</span>
          </label>
        </div>

        {/* Big download button */}
        <button
          onClick={handleExport}
          disabled={!imageUrl || isDownloading}
          className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg tracking-wide transition-all duration-200 cursor-pointer ${
            !imageUrl 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50' 
              : isDownloading 
                ? 'bg-sky-600/40 text-sky-200 cursor-wait' 
                : 'bg-sky-500 hover:bg-sky-600 text-white hover:scale-[1.01] active:scale-95'
          }`}
        >
          {isDownloading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              배경화면 생성 및 파일 압축 중...
            </>
          ) : (
            <>
              <Download size={14} />
              {exportFormat.toUpperCase()} 배경화면 다운로드 (1179 × 2556)
            </>
          )}
        </button>

        {/* Small warning disclaimer info */}
        <div className="flex gap-1.5 items-start text-[10px] text-zinc-500 leading-normal bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-800/40">
          <Sparkles size={13} className="text-amber-500/80 shrink-0 mt-0.5" />
          <span>
            다운로드 시 아이폰 16e의 완벽한 물리 하드웨어 규격인 <strong>1179 x 2556 픽셀</strong> 초고화질 비율로 1:1 크롭 가공된 오리지널 화질이 저장됩니다.
          </span>
        </div>
      </div>

    </div>
  );
}
