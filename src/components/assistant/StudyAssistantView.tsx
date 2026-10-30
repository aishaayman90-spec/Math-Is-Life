import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyPlan } from '../../types';
import {
  CalendarDays,
  Sparkles,
  RefreshCw,
  GitBranch,
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCw,
  ThumbsUp,
  RotateCcw,
  Plus
} from 'lucide-react';

export const StudyAssistantView: React.FC = () => {
  const { flashcards, toggleCardMastered, user, lang, t, isRtl, addXp } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'mindmap' | 'flashcards'>('schedule');

  // Study Plan Generator inputs
  const [subject, setSubject] = useState('Algebra & Geometry');
  const [goal, setGoal] = useState('Midterm Revision in 2 weeks');
  const [dailyTarget, setDailyTarget] = useState(45);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

  // Flashcards player state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          goal,
          hoursPerDay: dailyTarget / 60,
          language: lang
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setStudyPlan(json.data);
        addXp(30);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard = flashcards[cardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const masteredCount = flashcards.filter((c) => c.mastered).length;
  const progressPercent = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.assistant.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.assistant.subtitle}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.assistant.studyRoadmap}
          </button>
          <button
            onClick={() => setActiveTab('mindmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'mindmap'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.assistant.mindMap}
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.assistant.flashcards} ({flashcards.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Study Roadmap & Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Plan generator card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>{t.assistant.generatePlan}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {isRtl ? 'المادة أو الوحدة' : 'Subject or Topic'}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {isRtl ? 'الهدف الدراسي' : 'Study Goal'}
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={t.assistant.goalPlaceholder}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.assistant.dailyTime} ({dailyTarget} {t.common.minutes})
                </label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="10"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full accent-violet-600 mt-2"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isRtl ? 'جاري تخطيط الجدول بالذكاء الاصطناعي...' : 'Crafting smart roadmap...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.assistant.generatePlan}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Plan Display */}
          {studyPlan && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {studyPlan.planTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {studyPlan.totalDurationWeeks} weeks • {studyPlan.dailyTargetMinutes} mins daily
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studyPlan.phases?.map((phase, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                        {phase.days}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {phase.phaseName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      🎯 {phase.milestone}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {phase.tasks?.map((tItem, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                            {tItem.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {tItem.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Interactive Mind Map */}
      {activeTab === 'mindmap' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isRtl ? 'الخريطة الذهنية التفاعلية لمفاهيم الرياضيات' : 'Interactive Concept Mind Map'}
            </h3>
          </div>

          {/* Node Graph visualizer */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-violet-950/20 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-8">
            {/* Center Core Hub */}
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-sm shadow-lg shadow-violet-500/30 flex items-center gap-2">
              <span>{user.curriculum.split(' ')[0]} Hub</span>
            </div>

            {/* Branches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-2 text-center">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                  {isRtl ? 'الجبر والمعادلات' : 'Algebra & Equations'}
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40">
                    Linear Equations
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40">
                    Factoring Quadratics
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40">
                    Inequalities
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2 text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  {isRtl ? 'الهندسة والقياس' : 'Geometry & Proofs'}
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40">
                    Pythagorean Theorem
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40">
                    Area & Volume
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40">
                    Coordinate Plane
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-sm space-y-2 text-center">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                  {isRtl ? 'الكسور والنسب' : 'Fractions & Ratios'}
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/40">
                    Unlike Denominators
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/40">
                    Percentages & Tax
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/40">
                    Unit Rates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Smart Flashcards Deck Player */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Deck Progress Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.assistant.cardProgress}: {masteredCount} / {flashcards.length} ({progressPercent}%)
              </span>
              <div className="w-48 sm:w-64 h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400">
              Card {cardIndex + 1} of {flashcards.length}
            </span>
          </div>

          {/* Flashcard 3D Card */}
          {currentCard && (
            <div className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-72 rounded-3xl border-2 border-violet-200 dark:border-violet-900/60 bg-gradient-to-br from-white to-violet-50/40 dark:from-slate-900 dark:to-violet-950/20 p-8 flex flex-col justify-between text-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    {currentCard.topic}
                  </span>
                  <span>{isFlipped ? (isRtl ? 'الإجابة' : 'Answer') : (isRtl ? 'السؤال' : 'Question')}</span>
                </div>

                <div className="my-auto space-y-3">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </h3>
                  <p className="text-xs text-violet-500 font-semibold">
                    {isFlipped ? '🔄 ' + (isRtl ? 'اضغط للقلب' : 'Click to flip back') : '💡 ' + t.assistant.flipCard}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400">
                  {currentCard.mastered ? '✅ ' + (isRtl ? 'تم إتقانها' : 'Marked as Mastered') : '⏳ ' + (isRtl ? 'تحتاج مراجعة' : 'Needs Review')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevCard}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  {isRtl ? 'السابق' : 'Previous'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCardMastered(currentCard.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      currentCard.mastered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{t.assistant.markMastered}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentCard.mastered) toggleCardMastered(currentCard.id);
                      handleNextCard();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    {t.assistant.markReview}
                  </button>
                </div>

                <button
                  onClick={handleNextCard}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isRtl ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
