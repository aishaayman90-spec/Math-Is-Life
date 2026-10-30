import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PenTool,
  Eraser,
  Highlighter,
  Square,
  Circle,
  Triangle,
  Minus,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Bot,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

type Tool = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'numberLine' | 'fractionBar' | 'text';
type GridType = 'grid' | 'dots' | 'ruled' | 'blank';

export const InteractiveWhiteboard: React.FC = () => {
  const { lang, t, isRtl, theme, savedWhiteboardSnapshot, setSavedWhiteboardSnapshot } = useApp();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#4f46e5'); // Indigo default
  const [lineWidth, setLineWidth] = useState(3);
  const [gridType, setGridType] = useState<GridType>('grid');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Background Document / PDF / Image
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  // Text insertion state
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);

  // AI Handwriting Enhancement state
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [enhancedMathData, setEnhancedMathData] = useState<{
    enhancedText: string;
    latex?: string;
    identifiedElements?: string[];
  } | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [backupCanvasBeforeEnhance, setBackupCanvasBeforeEnhance] = useState<string | null>(null);

  // Ask AI About This Page
  const [askAiModalOpen, setAskAiModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingPage, setIsAnalyzingPage] = useState(false);
  const [pageQuestion, setPageQuestion] = useState('');

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1200;
    canvas.height = 750;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Fill background
      ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save initial snapshot
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
      setHistoryStep(0);
    }
  }, [theme]);

  // Redraw when background image or grid changes
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || historyStep < 0 || !history[historyStep]) return;

    ctx.putImageData(history[historyStep], 0, 0);
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, data]);
    setHistoryStep(newHistory.length);

    // Auto save snapshot
    try {
      const dataUrl = canvas.toDataURL();
      setSavedWhiteboardSnapshot(dataUrl);
    } catch {}
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history[prevStep]) {
        ctx.putImageData(history[prevStep], 0, 0);
      }
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx && history[nextStep]) {
        ctx.putImageData(history[nextStep], 0, 0);
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setBackgroundImage(null);
    setIsAiEnhanced(false);
    saveState();
  };

  // Mouse / Touch drawing handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);

    if (activeTool === 'text') {
      setTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = theme === 'dark' ? '#0f172a' : '#ffffff';
      ctx.lineWidth = lineWidth * 4;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)'; // Transparent yellow
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Shapes: restore previous state before drawing current preview
      if (historyStep >= 0 && history[historyStep]) {
        ctx.putImageData(history[historyStep], 0, 0);
      }
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      if (activeTool === 'rectangle') {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(x - startX, y - startY);
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === 'triangle') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.lineTo(startX - (x - startX), y);
        ctx.closePath();
        ctx.stroke();
      } else if (activeTool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === 'numberLine') {
        // Draw Number Line with ticks
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, startY);
        ctx.stroke();
        const dist = x - startX;
        const ticks = 6;
        for (let i = 0; i <= ticks; i++) {
          const tx = startX + (dist / ticks) * i;
          ctx.moveTo(tx, startY - 8);
          ctx.lineTo(tx, startY + 8);
          ctx.stroke();
        }
      } else if (activeTool === 'fractionBar') {
        // Draw fraction bar model
        const w = x - startX;
        const h = 40;
        ctx.strokeRect(startX, startY, w, h);
        for (let i = 1; i < 4; i++) {
          const segX = startX + (w / 4) * i;
          ctx.moveTo(segX, startY);
          ctx.lineTo(segX, startY + h);
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  // Text insertion submission
  const handleCommitText = () => {
    if (!textInput.trim() || !textPosition) {
      setTextPosition(null);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.font = `bold ${lineWidth * 5 + 14}px 'Fira Code', 'Cairo', monospace`;
      ctx.fillStyle = strokeColor;
      ctx.fillText(textInput, textPosition.x, textPosition.y);
      saveState();
    }
    setTextInput('');
    setTextPosition(null);
  };

  // Upload PDF or image to background
  const handleImportDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          setBackgroundImage(img);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveState();
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // AI Handwriting Enhancement
  const handleEnhanceHandwriting = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsEnhancing(true);
    setBackupCanvasBeforeEnhance(canvas.toDataURL());

    try {
      const base64 = canvas.toDataURL('image/png');
      const res = await fetch('/api/ai/handwriting-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasImage: base64, language: lang })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEnhancedMathData(json.data);
        setIsAiEnhanced(true);

        // Render enhanced typed mathematical formulation onto canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(79, 70, 229, 0.12)';
          ctx.fillRect(40, canvas.height - 100, canvas.width - 80, 70);
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 2;
          ctx.strokeRect(40, canvas.height - 100, canvas.width - 80, 70);

          ctx.font = "bold 22px 'Fira Code', monospace";
          ctx.fillStyle = '#4f46e5';
          ctx.fillText(`✨ AI Polished Math: ${json.data.enhancedText}`, 60, canvas.height - 58);
          saveState();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleToggleOriginalHandwriting = () => {
    if (!backupCanvasBeforeEnhance) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (isAiEnhanced) {
      // Revert to original
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setIsAiEnhanced(false);
      };
      img.src = backupCanvasBeforeEnhance;
    } else {
      setIsAiEnhanced(true);
    }
  };

  // "Ask AI About This Page"
  const handleAskAiAboutPage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setAskAiModalOpen(true);
    setIsAnalyzingPage(true);
    try {
      const base64 = canvas.toDataURL('image/png');
      const res = await fetch('/api/ai/ask-whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: pageQuestion,
          canvasImage: base64,
          language: lang
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiAnalysisResult(json.answer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingPage(false);
    }
  };

  // Export image
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `MathIsLife-Whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const palette = ['#0f172a', '#4f46e5', '#059669', '#dc2626', '#d97706', '#0284c7', '#9333ea', '#e11d48'];

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Header & AI Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.whiteboard.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.whiteboard.subtitle}
          </p>
        </div>

        {/* AI & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ask AI About This Page */}
          <button
            onClick={handleAskAiAboutPage}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>{t.whiteboard.askAiAboutPage}</span>
          </button>

          {/* AI Handwriting Enhancement */}
          <button
            onClick={handleEnhanceHandwriting}
            disabled={isEnhancing}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              isAiEnhanced
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>
              {isEnhancing
                ? (isRtl ? 'جاري التحسين...' : 'Polishing...')
                : isAiEnhanced
                ? t.whiteboard.aiEnhanceActive
                : t.whiteboard.aiEnhance}
            </span>
          </button>

          {backupCanvasBeforeEnhance && (
            <button
              onClick={handleToggleOriginalHandwriting}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold"
              title={t.whiteboard.viewOriginal}
            >
              {isAiEnhanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Import PDF/Textbook button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t.whiteboard.uploadPdf}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleImportDocument}
          />

          {/* Save Image */}
          <button
            onClick={handleExportPng}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title={t.whiteboard.exportPng}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Whiteboard Interactive Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTool === 'pen'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={t.whiteboard.pen}
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('highlighter')}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTool === 'highlighter'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={t.whiteboard.highlighter}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTool === 'eraser'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={t.whiteboard.eraser}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Geometric & Math Shapes */}
          <button
            onClick={() => setActiveTool('rectangle')}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              activeTool === 'rectangle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              activeTool === 'circle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('triangle')}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              activeTool === 'triangle' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Triangle"
          >
            <Triangle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('numberLine')}
            className={`px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'numberLine' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
            title={t.whiteboard.numberLine}
          >
            {t.whiteboard.numberLine}
          </button>

          <button
            onClick={() => setActiveTool('fractionBar')}
            className={`px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTool === 'fractionBar' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
            title={t.whiteboard.fractionModel}
          >
            {t.whiteboard.fractionModel}
          </button>

          <button
            onClick={() => setActiveTool('text')}
            className={`p-2 rounded-xl text-xs transition cursor-pointer ${
              activeTool === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
            title={t.whiteboard.text}
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {/* Colors & Stroke Width */}
        <div className="flex items-center gap-2.5">
          {/* Palette */}
          <div className="flex items-center gap-1">
            {palette.map((color) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                  strokeColor === color ? 'scale-125 ring-2 ring-indigo-400 ring-offset-2' : ''
                }`}
              />
            ))}
          </div>

          {/* Stroke Width Slider */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[10px] font-bold">1x</span>
            <input
              type="range"
              min="1"
              max="12"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 accent-indigo-600"
            />
            <span className="text-[10px] font-bold">12x</span>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Background Grid Pattern Selector */}
          <select
            value={gridType}
            onChange={(e: any) => setGridType(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          >
            <option value="grid">{t.whiteboard.gridSquare}</option>
            <option value="dots">{t.whiteboard.gridDots}</option>
            <option value="ruled">{t.whiteboard.gridRuled}</option>
            <option value="blank">{t.whiteboard.gridBlank}</option>
          </select>

          {/* Undo / Redo / Clear */}
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title={t.whiteboard.undo}
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            title={t.whiteboard.redo}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            title={t.whiteboard.clearBoard}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. The Digital Canvas */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-3xl border border-slate-300 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 ${
          gridType === 'grid'
            ? 'bg-math-grid'
            : gridType === 'dots'
            ? 'bg-math-dots'
            : gridType === 'ruled'
            ? 'bg-math-ruled'
            : ''
        }`}
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className="w-full h-auto cursor-crosshair block"
        />

        {/* Inline Text Input Bubble on click */}
        {textPosition && (
          <div
            className="absolute z-20 p-2 bg-white dark:bg-slate-900 border border-indigo-400 rounded-xl shadow-xl flex items-center gap-1.5"
            style={{
              left: `${(textPosition.x / 1200) * 100}%`,
              top: `${(textPosition.y / 750) * 100}%`
            }}
          >
            <input
              type="text"
              autoFocus
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommitText()}
              placeholder="e.g. 2x + 5 = 15"
              className="px-2 py-1 text-xs font-mono border rounded-md dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={handleCommitText}
              className="px-2 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold"
            >
              ✓
            </button>
            <button
              onClick={() => setTextPosition(null)}
              className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 4. MODAL: Ask AI About This Page */}
      {askAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.whiteboard.askAiAboutPage}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'تحليل ذكي ومباشر لمحتوى السبورة' : 'Real-time AI coaching for your whiteboard work'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAskAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={pageQuestion}
                onChange={(e) => setPageQuestion(e.target.value)}
                placeholder={isRtl ? 'مثال: كيف أحل المسألة المكتوبة باللون الأزرق؟' : 'e.g. Help me factor this equation or solve step 2'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs dark:text-white"
              />
              <button
                onClick={handleAskAiAboutPage}
                disabled={isAnalyzingPage}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isRtl ? 'تحليل' : 'Analyze'}
              </button>
            </div>

            {isAnalyzingPage ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{isRtl ? 'بيوي يقرأ السبورة ويدرس الخطوات...' : 'Piwi is scanning your board...'}</span>
              </div>
            ) : aiAnalysisResult ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {aiAnalysisResult}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
