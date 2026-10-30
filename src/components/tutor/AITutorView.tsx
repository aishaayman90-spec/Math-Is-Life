import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonExplanation, SolutionMethod } from '../../types';
import {
  BrainCircuit,
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Compass,
  Layers,
  Send,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Share2,
  Check,
  Maximize2
} from 'lucide-react';

export const AITutorView: React.FC = () => {
  const {
    user,
    lang,
    t,
    isRtl,
    saveLesson,
    activeLesson,
    setActiveLesson,
    addXp
  } = useApp();

  const [inputMode, setInputMode] = useState<'type' | 'upload'>('type');
  const [topicInput, setTopicInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(user.gradeLevel);
  const [selectedCurriculum, setSelectedCurriculum] = useState(user.curriculum);
  const [activeTab, setActiveTab] = useState<'summary' | 'steps' | 'reallife' | 'visual' | 'traps' | 'check'>('summary');
  
  // File upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<LessonExplanation | null>(activeLesson);

  // Advanced features state
  const [showExplainAgainModal, setShowExplainAgainModal] = useState(false);
  const [explainAgainData, setExplainAgainData] = useState<any>(null);
  const [explainAgainLoading, setExplainAgainLoading] = useState(false);

  const [showMistakeDetective, setShowMistakeDetective] = useState(false);
  const [studentWrongAnswer, setStudentWrongAnswer] = useState('');
  const [mistakeData, setMistakeData] = useState<any>(null);
  const [mistakeLoading, setMistakeLoading] = useState(false);

  const [showMultipleMethods, setShowMultipleMethods] = useState(false);
  const [multipleMethodsData, setMultipleMethodsData] = useState<SolutionMethod[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);

  // Follow-up chat
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'piwi'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Quick check state
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});

  // Preset sample textbook pages
  const sampleTextbookPages = [
    {
      title: isRtl ? 'صفحة: المعادلات الخطية البسيطة' : 'Sample: Solving Two-Step Linear Equations',
      topic: 'Solving Two-Step Linear Equations (Algebra)',
      previewText: '3x + 7 = 22, solve for x using inverse operations.'
    },
    {
      title: isRtl ? 'صفحة: جمع الكسور غير متحدة المقام' : 'Sample: Adding Unlike Fractions',
      topic: 'Adding Fractions with Unlike Denominators (3/4 + 1/2)',
      previewText: 'Find LCM of denominators, convert to equivalent fractions, then add numerators.'
    },
    {
      title: isRtl ? 'صفحة: نظرية فيثاغورس الهندسية' : 'Sample: Pythagorean Theorem Geometry',
      topic: 'Pythagorean Theorem: a² + b² = c² in Right Triangles',
      previewText: 'Calculate the hypotenuse c when legs are a=3 and b=4.'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      if (!topicInput) {
        setTopicInput(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof sampleTextbookPages[0]) => {
    setTopicInput(sample.topic);
    setFileName(sample.title);
    setInputMode('type');
  };

  const handleExplain = async () => {
    const topicToExplain = topicInput.trim() || (uploadedImage ? 'Textbook Material' : 'Fractions and Equations');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToExplain,
          gradeLevel: selectedGrade,
          curriculum: selectedCurriculum,
          language: lang,
          imageBase64: uploadedImage,
          imageMimeType: 'image/jpeg'
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setExplanation(json.data);
        setActiveLesson(json.data);
        saveLesson(json.data);
        addXp(25);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainAgain = async (angle: string) => {
    setExplainAgainLoading(true);
    try {
      const res = await fetch('/api/ai/explain-again', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: explanation?.topicTitle || topicInput,
          previousExplanation: explanation?.summary,
          angle,
          language: lang
        })
      });
      const json = await res.json();
      if (json.success) {
        setExplainAgainData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExplainAgainLoading(false);
    }
  };

  const handleMistakeDetective = async () => {
    if (!studentWrongAnswer.trim()) return;
    setMistakeLoading(true);
    try {
      const res = await fetch('/api/ai/mistake-detective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: explanation?.topicTitle || topicInput,
          studentAnswer: studentWrongAnswer,
          language: lang
        })
      });
      const json = await res.json();
      if (json.success) {
        setMistakeData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMistakeLoading(false);
    }
  };

  const handleFetchMultipleMethods = async () => {
    setShowMultipleMethods(true);
    setMethodsLoading(true);
    try {
      const res = await fetch('/api/ai/multiple-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: explanation?.topicTitle || topicInput || '24 ÷ 4',
          language: lang
        })
      });
      const json = await res.json();
      if (json.success && json.data?.methods) {
        setMultipleMethodsData(json.data.methods);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMethodsLoading(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!followUpQuestion.trim()) return;
    const q = followUpQuestion;
    setFollowUpQuestion('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${explanation?.topicTitle || topicInput}: ${q}`,
          gradeLevel: selectedGrade,
          curriculum: selectedCurriculum,
          language: lang
        })
      });
      const json = await res.json();
      const reply = json.data?.summary || (isRtl ? 'أحسنت السؤال! هذا المفهوم يعتمد على توازن المعادلة.' : 'Great question! Think of it like a balanced scale where both sides stay equivalent.');
      setChatMessages((prev) => [...prev, { sender: 'piwi', text: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'piwi',
          text: isRtl
            ? 'سؤال ممتاز! في الرياضيات، يمكنك التحقق دائماً بالتعويض المباشر.'
            : 'Excellent question! Remember, you can always test your result by plugging it back into the original formula.'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.tutor.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.tutor.subtitle}
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setInputMode('type')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              inputMode === 'type'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.tutor.typeTab}
          </button>
          <button
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              inputMode === 'upload'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.tutor.uploadTab}</span>
          </button>
        </div>
      </div>

      {/* 2. Input Box (Typed or Uploaded) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {inputMode === 'upload' ? (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 dark:border-indigo-700/60 rounded-2xl p-6 sm:p-8 text-center bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 transition cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.tutor.uploadPrompt}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.tutor.supportedFormats}
              </p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>

            {uploadedImage && (
              <div className="relative max-h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-950">
                <img
                  src={uploadedImage}
                  alt="Uploaded textbook page"
                  className="max-h-48 object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                placeholder={t.tutor.topicPlaceholder}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            {/* Popular Topics Quick Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400">
                {t.tutor.sampleTopics}
              </span>
              {sampleTextbookPages.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSample(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grade & Curriculum Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {t.tutor.gradeLevel}
            </label>
            <select
              value={selectedGrade}
              onChange={(e: any) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="Elementary (Grades 1-3)">Elementary (Grades 1-3)</option>
              <option value="Elementary (Grades 4-5)">Elementary (Grades 4-5)</option>
              <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
              <option value="High School (Grades 9-10)">High School (Grades 9-10)</option>
              <option value="High School (Grades 11-12)">High School (Grades 11-12)</option>
              <option value="College / Prep">College / Prep</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {t.tutor.curriculum}
            </label>
            <select
              value={selectedCurriculum}
              onChange={(e: any) => setSelectedCurriculum(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="Egyptian Ministry Curriculum">Egyptian Ministry Curriculum</option>
              <option value="Saudi National Curriculum">Saudi National Curriculum</option>
              <option value="Gulf / UAE Ministry Curriculum">Gulf / UAE Ministry Curriculum</option>
              <option value="US Common Core">US Common Core</option>
              <option value="UK National / GCSE / A-Level">UK National / GCSE / A-Level</option>
              <option value="International Baccalaureate (IB)">International Baccalaureate (IB)</option>
              <option value="CBSE / ICSE (India)">CBSE / ICSE (India)</option>
              <option value="General International">General International</option>
            </select>
          </div>
        </div>

        {/* Explain Action Button */}
        <button
          onClick={handleExplain}
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.tutor.explaining}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.tutor.explainBtn}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
      </div>

      {/* 3. Explanation Results Workspace */}
      {explanation && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Header & Quick Action Buttons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {selectedCurriculum} • {selectedGrade}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {explanation.topicTitle}
                </h2>
              </div>

              {/* Advanced Feature Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Explain It Again */}
                <button
                  onClick={() => {
                    setShowExplainAgainModal(true);
                    handleExplainAgain('simpler_analogy');
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/60 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.tutor.explainAgainBtn}</span>
                </button>

                {/* Mistake Detective */}
                <button
                  onClick={() => setShowMistakeDetective(!showMistakeDetective)}
                  className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/60 cursor-pointer"
                >
                  <span>🕵️</span>
                  <span>{t.tutor.mistakeDetectiveBtn}</span>
                </button>

                {/* Multiple Solution Methods */}
                <button
                  onClick={handleFetchMultipleMethods}
                  className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{t.tutor.multipleMethodsBtn}</span>
                </button>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.tutor.tabSummary}
              </button>

              <button
                onClick={() => setActiveTab('steps')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'steps'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.tutor.tabSteps} ({explanation.stepByStep?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('reallife')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'reallife'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.tutor.tabRealLife}
              </button>

              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.tutor.tabVisual}
              </button>

              <button
                onClick={() => setActiveTab('traps')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'traps'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.tutor.tabTraps}
              </button>

              <button
                onClick={() => setActiveTab('check')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'check'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t.tutor.tabCheck}
              </button>
            </div>
          </div>

          {/* Tab 1: Summary & Formulas */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{isRtl ? 'ملخص الفكرة الأساسية' : 'Core Concept Intuition'}</span>
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {explanation.summary}
                </p>

                {explanation.keyRulesAndFormulas?.length > 0 && (
                  <div className="pt-2 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {isRtl ? 'القوانين والقواعد الذهبية' : 'Golden Rules & Formulas'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {explanation.keyRulesAndFormulas.map((rule, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2.5"
                        >
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Step-by-Step Breakdown */}
          {activeTab === 'steps' && (
            <div className="space-y-3">
              {explanation.stepByStep?.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {step.stepNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
                    {step.explanation}
                  </p>

                  {step.mathExpression && (
                    <div className="ml-9 p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-xs sm:text-sm font-bold border border-slate-800">
                      {step.mathExpression}
                    </div>
                  )}

                  {step.tip && (
                    <div className="ml-9 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
                      <Lightbulb className="w-4 h-4 shrink-0" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Learn With Real Life */}
          {activeTab === 'reallife' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {explanation.realLifeExamples?.map((ex, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                      🌍
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {isRtl ? 'تطبيق حياتي واقعي' : 'Real-Life Scenario'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {ex.scenario}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    {ex.practicalApplication}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Visual Models & Diagrams */}
          {activeTab === 'visual' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>{isRtl ? 'التمثيل البصري التفاعلي' : 'Visual Model & Interactive Representation'}</span>
              </h3>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                {/* Visual Fraction Bar Graphic */}
                <div className="w-full max-w-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>0</span>
                    <span>1/4</span>
                    <span>1/2</span>
                    <span>3/4</span>
                    <span>1 (Whole)</span>
                  </div>
                  <div className="w-full h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex overflow-hidden border border-slate-300 dark:border-slate-700">
                    <div style={{ width: '50%' }} className="h-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                      1/2
                    </div>
                    <div style={{ width: '25%' }} className="h-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                      1/4
                    </div>
                    <div style={{ width: '25%' }} className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                      1/4
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-2">
                    {explanation.visualModel?.description || (isRtl ? 'شريط الكسور يوضح تساوي 2/4 مع 1/2' : 'Visual bar model showing equivalent fractional areas')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Common Traps & Mistakes */}
          {activeTab === 'traps' && (
            <div className="space-y-3">
              {explanation.commonMistakes?.map((trap, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{trap.mistake}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        {isRtl ? 'لماذا يقع الدماغ في هذا الفخ؟' : 'Why does this mistake happen?'}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">{trap.whyItHappens}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                        {isRtl ? 'كيف تتجنبه بذكاء؟' : 'How to avoid it:'}
                      </span>
                      <p className="text-emerald-800 dark:text-emerald-300 font-semibold">{trap.howToAvoid}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 6: Quick Understanding Check */}
          {activeTab === 'check' && (
            <div className="space-y-3">
              {explanation.checkUnderstandingQuestions?.map((item, idx) => {
                const isRevealed = revealedSolutions[idx];
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {isRtl ? `تمرين سريع #${idx + 1}` : `Quick Problem #${idx + 1}`}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.question}
                        </h4>
                      </div>

                      <button
                        onClick={() =>
                          setRevealedSolutions((prev) => ({
                            ...prev,
                            [idx]: !prev[idx]
                          }))
                        }
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition shrink-0 cursor-pointer"
                      >
                        {isRevealed ? (isRtl ? 'إخفاء الحل' : 'Hide Solution') : (isRtl ? 'عرض الحل' : 'Show Solution')}
                      </button>
                    </div>

                    {item.hint && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        💡 {isRtl ? 'تلميح:' : 'Hint:'} {item.hint}
                      </p>
                    )}

                    {isRevealed && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 animate-in fade-in">
                        <span className="font-bold block">{isRtl ? 'الحل النموذجي:' : 'Model Answer:'}</span>
                        <p className="font-medium font-mono">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Follow-up Chat with Piwi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>{t.tutor.askFollowUp}</span>
            </h3>

            {chatMessages.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'piwi' && <span className="text-lg">🦊</span>}
                    <div
                      className={`text-xs p-3 rounded-2xl max-w-md ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp()}
                placeholder={isRtl ? 'اسأل بيوي أي تفصيل لم يتضح لك...' : 'Ask Piwi anything you want clarified...'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
              <button
                onClick={handleSendFollowUp}
                disabled={chatLoading || !followUpQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.tutor.sendQuestion}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Explain It Again */}
      {showExplainAgainModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.tutor.explainAgainBtn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.tutor.explainAgainSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainAgainModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Angle buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleExplainAgain('simpler_analogy')}
                className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800 text-center cursor-pointer"
              >
                {isRtl ? 'مثال محسوس وقصة بسيطة' : 'Real-Life Story Analogy'}
              </button>
              <button
                onClick={() => handleExplainAgain('visual_model')}
                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800 text-center cursor-pointer"
              >
                {isRtl ? 'مخطط بصري ورسم بياني' : 'Visual & Geometric Diagram'}
              </button>
              <button
                onClick={() => handleExplainAgain('manipulatives')}
                className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/60 dark:border-amber-800 text-center cursor-pointer"
              >
                {isRtl ? 'مكعبات ومجسمات ملموسة' : 'Hands-On Manipulative Blocks'}
              </button>
              <button
                onClick={() => handleExplainAgain('step_breakdown')}
                className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/60 dark:border-purple-800 text-center cursor-pointer"
              >
                {isRtl ? 'تفكيك فائق الصغر للخطوات' : 'Micro-Step Breakdown'}
              </button>
            </div>

            {explainAgainLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{isRtl ? 'بيوي يستحضر زاوية شرح جديدة وممتعة...' : 'Piwi is brewing a fresh explanation...'}</span>
              </div>
            ) : explainAgainData ? (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {explainAgainData.newAngleTitle}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {explainAgainData.explanation}
                </p>
                {explainAgainData.visualMetaphor && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 font-medium">
                    💡 {explainAgainData.visualMetaphor}
                  </div>
                )}
                {explainAgainData.workedExample && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isRtl ? 'مثال عملي توضيحي:' : 'Worked Example:'} {explainAgainData.workedExample.problem}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      {explainAgainData.workedExample.solutionSteps?.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* DRAWER: Mistake Detective */}
      {showMistakeDetective && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕵️</span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
                  {isRtl ? 'محقق الأخطاء: افحص حلك واعرف أين كان الانزلاق' : 'Mistake Detective: Diagnose Your Work'}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {isRtl
                    ? 'اكتب حلك أو خطواتك، وسيقوم المحقق بتحديد الخطوة التي حدث فيها الخطأ دون إحراج!'
                    : 'Paste or type your solution steps and let the detective pinpoint the slip.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMistakeDetective(false)}
              className="text-amber-600 hover:text-amber-800 font-bold text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={studentWrongAnswer}
              onChange={(e) => setStudentWrongAnswer(e.target.value)}
              placeholder={isRtl ? 'اكتب حلك، مثلاً: 5 + 3 × 2 = 16 أو x = 4' : 'e.g. 5 + 3 * 2 = 16 or x = 4'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs dark:text-white"
            />
            <button
              onClick={handleMistakeDetective}
              disabled={mistakeLoading || !studentWrongAnswer.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {mistakeLoading ? (isRtl ? 'جاري الفحص...' : 'Investigating...') : (isRtl ? 'ابدأ التحقيق 🔍' : 'Investigate 🔍')}
            </button>
          </div>

          {mistakeData && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{isRtl ? 'نوع الخطأ المكتشف:' : 'Detected Trap:'} {mistakeData.mistakeType}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {mistakeData.detectiveDiagnosis}
              </p>
              {mistakeData.stepByStepFix && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isRtl ? 'خطوات التصحيح الموصى بها:' : 'Correct Step Sequence:'}
                  </span>
                  <ul className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                    {mistakeData.stepByStepFix.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {mistakeData.detectiveTip && (
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  🛡️ {isRtl ? 'درع الحماية للمرة القادمة:' : 'Detective Rule for Next Time:'} {mistakeData.detectiveTip}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 2: Multiple Solution Methods */}
      {showMultipleMethods && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📐</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.tutor.multipleMethodsBtn}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? '4 مسارات مختلفة لحل نفس المسألة الرياضية' : '4 distinct pathways to solve the same problem'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMultipleMethods(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {methodsLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{isRtl ? 'جاري بناء نماذج الحل المتعددة...' : 'Calculating 4 representation models...'}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {multipleMethodsData.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">
                            {m.methodName}
                          </h4>
                          <span className="text-[10px] text-slate-400">{m.subtitle}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {m.explanation}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 block mb-1">
                        {isRtl ? 'لماذا ينجح هذا المسار؟' : 'Why it works:'}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.whyItWorks}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
