import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Flame,
  ArrowRight,
  BrainCircuit,
  PenTool,
  CheckCircle2,
  BookOpen,
  Gamepad2,
  Trophy,
  Clock,
  ChevronRight,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Play
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    user,
    setCurrentSection,
    lastStudiedTopic,
    savedLessons,
    setActiveLesson,
    topicMasteries,
    badges,
    t,
    isRtl,
    addXp
  } = useApp();

  const [dailyCompleted, setDailyCompleted] = useState(false);

  // Suggested lessons tailored to grade
  const recommendations = [
    {
      id: 'rec-1',
      title: isRtl ? 'المعادلات الخطية وحساب المتغير المجهول' : 'Solving Two-Step Linear Equations',
      grade: user.gradeLevel,
      tag: isRtl ? 'الجبر' : 'Algebra',
      duration: '15 mins',
      difficulty: isRtl ? 'متوسط' : 'Medium',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'rec-2',
      title: isRtl ? 'جمع وطرح الكسور غير متحدة المقام' : 'Adding Fractions with Unlike Denominators',
      grade: user.gradeLevel,
      tag: isRtl ? 'الكسور' : 'Fractions',
      duration: '12 mins',
      difficulty: isRtl ? 'أساسي' : 'Fundamental',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'rec-3',
      title: isRtl ? 'نظرية فيثاغورس وحساب أضلاع المثلث القائم' : 'Pythagorean Theorem & Right Triangles',
      grade: user.gradeLevel,
      tag: isRtl ? 'الهندسة' : 'Geometry',
      duration: '20 mins',
      difficulty: isRtl ? 'تطبيقي' : 'Applied',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleStartLesson = (title: string) => {
    setCurrentSection('tutor');
  };

  const handleDailyChallenge = () => {
    setCurrentSection('games');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome & Continue Learning Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{user.curriculum}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {t.dashboard.welcomeBack} {user.name}! 👋
            </h1>

            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
              {t.dashboard.readyToLearn}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-indigo-200">
                {t.dashboard.lastStudied} <strong className="text-white underline">{lastStudiedTopic}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentSection('tutor')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-lg shadow-black/10 transition-all hover:scale-102 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-indigo-700" />
              <span>{t.dashboard.continueLearning}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setCurrentSection('whiteboard')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>{isRtl ? 'السبورة الحرة' : 'Open Whiteboard'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">
              {user.streakDays}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.streak}
            </div>
          </div>
        </div>

        {/* XP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Zap className="w-6 h-6 fill-indigo-600 dark:fill-indigo-400" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">
              {user.xp}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.xpEarned}
            </div>
          </div>
        </div>

        {/* Completed Lessons */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">
              {user.completedLessonsCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.completedLessons}
            </div>
          </div>
        </div>

        {/* Quizzes Passed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">
              {user.completedQuizzesCount}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.quizzesPassed}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Math Challenge Card */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border border-amber-300/60 dark:border-amber-800/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 shrink-0">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {isRtl ? 'تحدي اليوم' : 'Daily Challenge'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                +50 XP
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isRtl ? 'لغز المزرعة السحري وتضاعف الأزهار' : 'The Magic Pond Lily Pad Mystery'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isRtl
                ? 'تحدَّ تفكيرك المنطقي واكسب نقاط خبرة إضافية اليوم!'
                : 'Solve in under 2 minutes to keep your daily streak alive!'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDailyChallenge}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>{t.dashboard.claimXp}</span>
          <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 4. Quick Access Hub */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          <span>{t.dashboard.quickAccess}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setCurrentSection('tutor')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left flex flex-col justify-between h-28 group hover:shadow-md cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-white">
                {t.nav.tutor}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {isRtl ? 'شرح بالذكاء الاصطناعي' : 'Step-by-step AI'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentSection('whiteboard')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left flex flex-col justify-between h-28 group hover:shadow-md cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-white">
                {t.nav.whiteboard}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {isRtl ? 'رسم وكتابة وحل PDF' : 'Draw & Annotate PDF'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentSection('revision')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left flex flex-col justify-between h-28 group hover:shadow-md cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-white">
                {t.nav.revision}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {isRtl ? 'تمارين واختبارات' : 'Smart Quizzes'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentSection('notes')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left flex flex-col justify-between h-28 group hover:shadow-md cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-white">
                {t.nav.notes}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {isRtl ? 'دفتر رقمي وبطاقات' : 'Digital Notebook'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentSection('games')}
            className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left flex flex-col justify-between h-28 group hover:shadow-md cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800 dark:text-white">
                {t.nav.games}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {isRtl ? 'سرعة وألغاز وأوسمة' : 'Mental Speed & XP'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Recommended Lessons & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Lessons */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>{t.dashboard.recommendedForYou}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.dashboard.basedOnCurriculum}
              </p>
            </div>
            <button
              onClick={() => setCurrentSection('tutor')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {isRtl ? 'استعراض الكل' : 'Explore All'}
            </button>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${rec.color} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    π
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rec.tag}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.duration}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {rec.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => handleStartLesson(rec.title)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{t.dashboard.startNow}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks & Mastery snapshot */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>{t.dashboard.upcomingTasks}</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {isRtl ? 'مراجعة أولويات العمليات (PEMDAS)' : 'Review Order of Operations'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isRtl ? 'تذكير متباعد • موعد اليوم' : 'Spaced repetition • Due Today'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {isRtl ? 'اختبار تجريبي: المثلثات ونظرية فيثاغورس' : 'Pythagorean Theorem Quiz'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isRtl ? 'غداً الساعة 4:00 عصراً' : 'Tomorrow, 4:00 PM'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentSection('assistant')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition text-center cursor-pointer"
            >
              {isRtl ? 'عرض جدول المذاكرة الكامل' : 'Open Study Planner'}
            </button>
          </div>

          {/* Quick Mastery Snapshot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>{t.dashboard.overallProgress}</span>
              </h3>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                74%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: '74%' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold">
                {isRtl ? 'الجبر: 88% مميز' : 'Algebra: 88% Strong'}
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold">
                {isRtl ? 'الإحصاء: 45% يحتاج تدريب' : 'Stats: 45% Needs Work'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
