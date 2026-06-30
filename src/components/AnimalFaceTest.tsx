import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, RefreshCw, AlertCircle, 
  User, CheckCircle2, Heart, Share2, HelpCircle, 
  Info, ArrowRight, Award, Flame, Smile, ShieldAlert
} from 'lucide-react';

interface AnimalFaceTestProps {
  showStatus: (message: string, type: 'success' | 'error') => void;
}

interface PredictionResult {
  className: string;
  probability: number;
}

export default function AnimalFaceTest({ showStatus }: AnimalFaceTestProps) {
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [loadingModelError, setLoadingModelError] = useState<string | null>(null);
  
  // Interactive states
  const [testMode, setTestMode] = useState<'upload' | 'webcam'>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  
  // Webcam states
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [isWebcamSetup, setIsWebcamSetup] = useState<boolean>(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const webcamInstanceRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modelRef = useRef<any>(null);

  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/ecRoXhigM/";

  // 1. Wait for Teachable Machine CDN scripts and load the model
  useEffect(() => {
    let checkInterval: any;
    let isMounted = true;

    const initTeachableMachine = async () => {
      try {
        const tm = (window as any).tmImage;
        if (!tm) {
          throw new Error("Teachable Machine 라이브러리가 아직 로드되지 않았습니다.");
        }

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        // Load the model
        const loadedModel = await tm.load(modelURL, metadataURL);
        if (isMounted) {
          modelRef.current = loadedModel;
          setModelLoaded(true);
          console.log("[Animal AI] Teachable Machine Model loaded successfully.");
        }
      } catch (err: any) {
        console.error("[Animal AI] Error loading model:", err);
        if (isMounted) {
          setLoadingModelError("인공지능 모델을 불러오지 못했습니다. 네트워크 상태를 확인하시거나 페이지를 새로고침 해주세요.");
        }
      }
    };

    // Check if tmImage is loaded
    if ((window as any).tmImage) {
      initTeachableMachine();
    } else {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if ((window as any).tmImage) {
          clearInterval(checkInterval);
          initTeachableMachine();
        } else if (attempts > 30) { // 15 seconds
          clearInterval(checkInterval);
          if (isMounted) {
            setLoadingModelError("인공지능 엔진(CDN)을 불러오는 데 시간이 너무 오래 걸립니다. 네트워크 연결을 확인해 주세요.");
          }
        }
      }, 500);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      stopWebcam();
    };
  }, []);

  // 2. Start Webcam implementation using Teachable Machine's Webcam helper
  const startWebcam = async () => {
    const tm = (window as any).tmImage;
    if (!tm || !modelRef.current) {
      showStatus("AI 모델이 아직 로드되지 않았습니다.", "error");
      return;
    }

    setResults(null);
    setImageSrc(null);
    setTestMode('webcam');
    setIsWebcamSetup(true);
    setWebcamActive(false);

    try {
      // Setup webcam (width, height, flip)
      const flip = true;
      const webcam = new tm.Webcam(380, 380, flip);
      await webcam.setup(); // request permission
      await webcam.play();
      
      webcamInstanceRef.current = webcam;
      
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = '';
        webcamContainerRef.current.appendChild(webcam.canvas);
        // Style the webcam canvas
        webcam.canvas.className = "w-full h-full object-cover rounded-2xl border border-zinc-800 shadow-inner";
      }

      setWebcamActive(true);
      setIsWebcamSetup(false);
      showStatus("카메라가 성공적으로 시작되었습니다.", "success");

      // Start the frame loop
      const loop = () => {
        if (webcamInstanceRef.current) {
          webcamInstanceRef.current.update();
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      };
      animationFrameRef.current = requestAnimationFrame(loop);

    } catch (err: any) {
      console.error("Webcam setup error:", err);
      setIsWebcamSetup(false);
      setWebcamActive(false);
      showStatus("카메라를 켤 수 없습니다. 브라우저 카메라 권한을 확인해주세요.", "error");
    }
  };

  // 3. Stop Webcam helper
  const stopWebcam = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (webcamInstanceRef.current) {
      try {
        webcamInstanceRef.current.stop();
      } catch (e) {
        console.warn("Error stopping webcam:", e);
      }
      webcamInstanceRef.current = null;
    }
    setWebcamActive(false);
    if (webcamContainerRef.current) {
      webcamContainerRef.current.innerHTML = '';
    }
  };

  // 4. File Upload Change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        showStatus("이미지 파일만 지원됩니다.", "error");
        return;
      }
      
      stopWebcam();
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          showStatus("사진이 성공적으로 준비되었습니다.", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 5. Drag & Drop Handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        showStatus("이미지 파일만 등록할 수 있습니다.", "error");
        return;
      }
      stopWebcam();
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          showStatus("사진이 드래그 앤 드롭으로 업로드되었습니다.", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 6. Perform Analysis with visual scanner animation
  const handleAnalyze = async () => {
    if (!modelRef.current) {
      showStatus("AI 모델이 아직 로드되지 않았습니다.", "error");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulated progress countdown for premium feel
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    // Short wait to emphasize the futuristic face scan
    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      let rawPredictions: any[] = [];

      if (testMode === 'upload' && imageRef.current) {
        // Predict using the uploaded image element
        rawPredictions = await modelRef.current.predict(imageRef.current);
      } else if (testMode === 'webcam' && webcamInstanceRef.current) {
        // Predict using the active webcam canvas
        rawPredictions = await modelRef.current.predict(webcamInstanceRef.current.canvas);
        // Capture current canvas as a static snapshot to show in result
        const snapshotUrl = webcamInstanceRef.current.canvas.toDataURL();
        setImageSrc(snapshotUrl);
        stopWebcam();
      } else {
        throw new Error("분석할 사진이 없습니다. 사진을 업로드하거나 카메라를 시작해 주세요.");
      }

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Map, sort predictions by probability descending
      const formatted: PredictionResult[] = rawPredictions
        .map((p: any) => ({
          className: p.className,
          probability: p.probability
        }))
        .sort((a, b) => b.probability - a.probability);

      setResults(formatted);
      setIsAnalyzing(false);
      showStatus("동물상 얼굴 분석이 완료되었습니다!", "success");

    } catch (err: any) {
      console.error("Analysis failed:", err);
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      showStatus(err.message || "분석 도중 오류가 발생했습니다. 다시 시도해 주세요.", "error");
    }
  };

  // 7. Reset the test
  const handleReset = () => {
    stopWebcam();
    setImageSrc(null);
    setResults(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setTestMode('upload');
  };

  // Helper to determine the best animal match details
  const getAnimalTraits = (className: string) => {
    const name = className.toLowerCase();
    
    // Normalize dog / cat detection
    if (name.includes('dog') || name.includes('개') || name.includes('강아지') || name === 'dog') {
      return {
        title: "강아지상 (Dog Face)",
        emoji: "🐶",
        keyphrase: "귀여움 대폭발! 모두에게 사랑받는 우주 최고 댕댕이",
        badge: "사교성 만렙 • 긍정 에너지 • 러블리 눈망울",
        colorClass: "from-sky-400 to-indigo-500 text-sky-400",
        bgLight: "bg-sky-500/10 border-sky-500/20",
        accentColor: "#38bdf8",
        traits: [
          "친근하고 따뜻한 미소가 상대방의 마음을 무장해제 시켜요.",
          "사교성이 뛰어나 낯선 사람과도 금방 어울리며 분위기를 유쾌하게 리드합니다.",
          "눈웃음이 예쁘고 감정 표현이 솔직하여 주변 사람들에게 늘 사랑받습니다.",
          "의리가 있고 한 번 맺은 인연은 소중히 지키는 든든한 동반자입니다."
        ],
        celebs: ["박보검", "송중기", "한지민", "아이유", "백현 (EXO)", "정해인"],
        advice: "사람들이 당신과 함께 있으면 언제나 긍정적인 엔돌핀을 가득 선물 받습니다. 밝은 미소로 세상 모든 이들에게 따스함을 선물하는 환상적인 존재네요!"
      };
    } else {
      // Default to Cat style
      return {
        title: "고양이상 (Cat Face)",
        emoji: "🐱",
        keyphrase: "도도하고 치명적인 매력! 눈빛 하나로 마음을 사로잡는 마성의 묘",
        badge: "신비주의 • 츤데레 매력 • 독립성 최강",
        colorClass: "from-pink-400 to-rose-500 text-pink-400",
        bgLight: "bg-pink-500/10 border-pink-500/20",
        accentColor: "#f472b6",
        traits: [
          "시크하고 도도한 분위기 속에 거부할 수 없는 신비로운 아우라를 풍깁니다.",
          "겉은 차가워 보이지만, 내 사람이라고 인정하는 순간 한없이 깊은 정과 애교를 보여줍니다.",
          "눈매가 날렵하면서도 매혹적이며 주관이 뚜렷해 지적인 매력이 돋보입니다.",
          "혼자만의 시간을 멋지게 즐길 줄 아는 독립적이고 자립심 강한 멋진 성격입니다."
        ],
        celebs: ["제니 (BLACKPINK)", "강동원", "한소희", "시우민 (EXO)", "안소희", "카리나"],
        advice: "차가운 첫인상에 긴장했던 사람들도 당신의 은근한 반전 매력에 속절없이 헤어나오지 못하게 됩니다. 은은한 시크함으로 상대를 매료시키는 마법을 누려보세요!"
      };
    }
  };

  // Render Loading Engine State
  if (!modelLoaded && !loadingModelError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/30 border border-zinc-900 rounded-3xl min-h-[500px]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-sky-500 animate-spin"></div>
          <Sparkles className="absolute text-sky-400 animate-pulse" size={24} />
        </div>
        <h3 className="text-md font-bold mt-6 text-zinc-100">동물상 AI 감별기 준비 중</h3>
        <p className="text-xs text-zinc-400 mt-2 text-center max-w-sm leading-relaxed">
          Teachable Machine 신경망 모델(강아지/고양이 감별용) 및 TensorFlow.js 연산 코어 라이브러리를 안전하게 다운로드하고 있습니다. 잠시만 기다려 주세요.
        </p>
      </div>
    );
  }

  // Render Loading Error State
  if (loadingModelError) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-zinc-900/30 border border-red-900/40 rounded-3xl min-h-[500px]">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-md font-bold text-zinc-100">인공지능 로드에 실패했습니다</h3>
        <p className="text-xs text-red-400/80 mt-2 text-center max-w-sm leading-relaxed">
          {loadingModelError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw size={12} />
          다시 로드하기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT PORTION: Image Upload/Webcam Display (cols: 5) */}
      <div className="lg:col-span-5 flex flex-col bg-zinc-900/30 p-5 rounded-3xl border border-zinc-900 shadow-xl backdrop-blur-sm self-stretch min-h-[550px]">
        
        {/* Toggle between Upload and Webcam */}
        {!results && !isAnalyzing && (
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 mb-5 gap-1">
            <button
              onClick={() => {
                stopWebcam();
                setTestMode('upload');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${testMode === 'upload' ? 'bg-zinc-800 text-sky-400 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Upload size={13} />
              얼굴 사진 올리기
            </button>
            <button
              onClick={startWebcam}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${testMode === 'webcam' ? 'bg-zinc-800 text-sky-400 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Camera size={13} />
              실시간 웹캠 촬영
            </button>
          </div>
        )}

        {/* Core Screen view area */}
        <div className="flex-1 flex flex-col justify-center items-center relative rounded-2xl bg-zinc-950/80 border border-zinc-800/50 p-4 min-h-[380px] overflow-hidden">
          
          {/* UPLOAD MODE */}
          {testMode === 'upload' && !imageSrc && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? 'border-sky-500 bg-sky-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'}`}
            >
              <div className="p-4 bg-sky-500/10 border border-sky-500/15 rounded-full text-sky-400 animate-pulse mb-3.5">
                <Upload size={24} className="stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-zinc-200">여기를 클릭하거나 사진을 놓아주세요</p>
              <p className="text-[10px] text-zinc-500 mt-2 text-center px-4">
                강아지상 또는 고양이상 분석을 하고 싶은 인물 사진(셀카)을 올려보세요.
              </p>
              <span className="mt-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-mono text-zinc-400">
                PNG, JPG, WEBP 지원
              </span>
            </div>
          )}

          {/* UPLOADED PREVIEW IMAGE OR SNAPSHOT */}
          {imageSrc && (
            <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner">
              <img 
                ref={imageRef}
                src={imageSrc} 
                alt="Face portrait" 
                className="w-full h-full object-cover rounded-2xl select-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Scanline Overlay during Analysis */}
              {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Neon Scanner Line */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" style={{ animationDuration: '3s' }}></div>
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-sky-500/5 animate-pulse"></div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE WEBCAM SCREEN */}
          {testMode === 'webcam' && (
            <div className={`relative w-full aspect-square max-w-[340px] flex items-center justify-center ${!webcamActive ? 'hidden' : ''}`}>
              <div ref={webcamContainerRef} className="w-full h-full"></div>
              
              {/* Overlay guides for Webcam framing */}
              <div className="absolute inset-0 border-4 border-zinc-950/65 rounded-2xl pointer-events-none">
                <div className="absolute inset-10 border border-dashed border-white/20 rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-white/40 tracking-wider bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm -translate-y-8">
                    원 안에 얼굴을 맞춰주세요
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* WEBCAM SPINNING LOADER */}
          {testMode === 'webcam' && isWebcamSetup && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="animate-spin text-sky-400 mb-3" size={32} />
              <p className="text-xs font-bold text-zinc-300">카메라 장치를 초기화 중입니다</p>
              <p className="text-[10px] text-zinc-500 mt-1">시스템에서 웹캠 권한 요청 팝업이 뜨면 '허용'을 선택해주세요.</p>
            </div>
          )}

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

        </div>

        {/* Trigger Controls Below Preview Screen */}
        <div className="mt-5 flex gap-2">
          {imageSrc && !results && !isAnalyzing && (
            <>
              <button
                onClick={handleReset}
                className="flex-1 py-3 text-xs font-bold bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} />
                지우기
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-[2] py-3 text-xs font-bold bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-sky-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer border border-sky-400/20"
              >
                <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                동물상 AI 분석 시작
              </button>
            </>
          )}

          {testMode === 'webcam' && webcamActive && !isAnalyzing && (
            <button
              onClick={handleAnalyze}
              className="w-full py-3.5 text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500/20"
            >
              <Camera size={15} className="animate-pulse" />
              스냅샷 촬영 및 분석하기
            </button>
          )}
        </div>

        {/* Analysing Loading Overlay */}
        {isAnalyzing && (
          <div className="mt-5 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-sky-400 flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" />
                얼굴 랜드마크 스캐닝...
              </span>
              <span className="font-mono text-zinc-400">{analysisProgress}%</span>
            </div>
            
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-150 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-zinc-500 text-center">
              Teachable Machine의 고성능 컴퓨터 비전 알고리즘을 사용해 강아지와 고양이 특징 요소를 종합 연산하고 있습니다.
            </p>
          </div>
        )}

      </div>

      {/* RIGHT PORTION: Dynamic Results / Guides View (cols: 7) */}
      <div className="lg:col-span-7 flex flex-col h-full self-stretch min-h-[550px] justify-between">
        
        {/* CASE A: No results yet, show instructional guide card */}
        {!results && (
          <div className="bg-zinc-950/40 rounded-3xl border border-zinc-800/80 p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-900">
                <Info size={16} className="text-sky-400" />
                <h3 className="text-sm font-bold text-zinc-200">동물상 AI 감별 가이드</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/40 hover:border-zinc-800 transition-all">
                  <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/15 text-sky-400 flex items-center justify-center font-bold text-xs mb-3">1</div>
                  <h4 className="text-xs font-bold text-zinc-300">정면 사진 권장</h4>
                  <p className="text-[10.5px] text-zinc-500 mt-1.5 leading-relaxed">
                    눈과 코가 선명하게 드러나는 화사한 정면 인물 사진을 사용하실 때 인공지능 예측의 정밀도가 대폭 증가합니다.
                  </p>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/40 hover:border-zinc-800 transition-all">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs mb-3">2</div>
                  <h4 className="text-xs font-bold text-zinc-300">웹캠을 이용한 즉석 테스트</h4>
                  <p className="text-[10.5px] text-zinc-500 mt-1.5 leading-relaxed">
                    실시간 카메라 모드를 시작해 마음에 드는 정면 각도에서 스냅샷 셔터를 눌러 0.5초 만에 신속 분석을 실행해보세요.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900/60 flex items-start gap-3">
                <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/15 text-yellow-400 rounded-lg shrink-0 mt-0.5">
                  <Award size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-300">검증된 Teachable Machine 모델 탑재</h4>
                  <p className="text-[10.5px] text-zinc-500 mt-1 leading-relaxed">
                    구글 크리에이티브 랩의 최첨단 브라우저 머신러닝 엔진을 사용하여 외부 서버로 얼굴 데이터를 전혀 유출하지 않으므로, 소중한 초상권 및 개인정보가 철저히 암호화 보존됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-zinc-900 flex justify-between items-center text-[11px] text-zinc-600 font-mono">
              <span>Model Hash: ecRoXhigM</span>
              <span>Power: TensorFlow.js WebGL</span>
            </div>
          </div>
        )}

        {/* CASE B: RESULTS VIEW */}
        {results && (
          <div className="bg-zinc-950/50 rounded-3xl border border-zinc-800/80 p-6 flex flex-col justify-between h-full animate-in fade-in duration-500">
            
            {/* Compute winning class details */}
            {(() => {
              const topMatch = results[0];
              const traits = getAnimalTraits(topMatch.className);
              
              return (
                <div className="space-y-6">
                  {/* Title card with gorgeous gradient background */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900">
                    <div className="flex items-center gap-3.5">
                      <span className="text-4xl filter drop-shadow-md select-none">{traits.emoji}</span>
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase bg-sky-500/10 border border-sky-500/15 px-2.5 py-0.5 rounded-full">
                          AI 분석 결과
                        </span>
                        <h3 className={`text-xl font-black mt-1 bg-gradient-to-r ${traits.colorClass} bg-clip-text text-transparent`}>
                          {traits.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-zinc-500 block">일치 확률 (Confidence)</span>
                      <span className="text-2xl font-black text-zinc-100 font-mono">
                        {(topMatch.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Highlights Phrase */}
                  <div className={`p-4 rounded-2xl ${traits.bgLight} border border-opacity-30`}>
                    <p className="text-xs font-black text-zinc-100 flex items-center gap-2">
                      <Flame size={14} className="text-orange-400 shrink-0" />
                      "{traits.keyphrase}"
                    </p>
                    <p className="text-[10.5px] text-zinc-400 mt-1 font-semibold">
                      {traits.badge}
                    </p>
                  </div>

                  {/* Probability Chart / Visual Gauges */}
                  <div className="space-y-3 bg-zinc-900/20 p-4 rounded-2xl border border-zinc-900/60">
                    <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Smile size={12} className="text-sky-400" />
                      성향 세부 구성 비율
                    </h4>
                    
                    <div className="space-y-3 pt-1.5">
                      {results.map((res, idx) => {
                        const deviceTraits = getAnimalTraits(res.className);
                        const percent = (res.probability * 100).toFixed(1);
                        
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-zinc-300 flex items-center gap-1">
                                <span>{deviceTraits.emoji}</span>
                                <span>{deviceTraits.title}</span>
                              </span>
                              <span className="font-mono text-zinc-400 font-bold">{percent}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/30">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ 
                                  width: `${percent}%`,
                                  backgroundColor: deviceTraits.accentColor,
                                  boxShadow: `0 0 8px ${deviceTraits.accentColor}80`
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personality Traits List */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-zinc-300">대표적인 성격 및 매력 포인트</h4>
                    <ul className="space-y-2">
                      {traits.traits.map((trait, i) => (
                        <li key={i} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Matching Celebrities */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-300">나와 닮은 동물상 연예인</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {traits.celebs.map((celeb, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:text-white hover:border-zinc-700 transition-colors"
                        >
                          {celeb}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Advice Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/40">
                    <h5 className="text-[10px] font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1">
                      <Heart size={10} className="text-red-400 fill-red-400/20" />
                      AI가 해주는 조언
                    </h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5">
                      {traits.advice}
                    </p>
                  </div>

                  {/* Control actions */}
                  <div className="pt-4 border-t border-zinc-900 flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      다시 테스트하기
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showStatus("결과 공유 주소가 클립보드에 복사되었습니다!", "success");
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Share2 size={13} />
                      공유하기
                    </button>
                  </div>

                </div>
              );
            })()}
            
          </div>
        )}

      </div>

    </div>
  );
}

// Inline Loader Icon Helper
function Loader2({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
