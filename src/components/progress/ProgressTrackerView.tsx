import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  RotateCcw,
  BarChart3,
  Calendar
} from 'lucide-react';

export const ProgressTrackerView: React.FC = () => {
  const { user, topicMasteries, quizAttempts, resetData, t, isRtl } = useApp();

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.progress.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.progress.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm(isRtl ? 'هل أنت متأكد من رغبتك في إعادة ضبط السجل المحلي؟' : 'Reset local study history?')) {
              resetData();
            }
          }}
          className="text-xs text-slate-400 hover:text-rose-500 transition cursor-pointer self-start sm:self-auto"
        >
          {t.progress.clearData}
        </button>
      </div>

      {/* 2. Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.dashboard.level}
          </span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {Math.floor(user.xp / 100) + 1}
          </div>
          <p className="text-[10px] text-slate-500">
            {user.xp % 100} / 100 XP to next tier
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.progress.studyTime}
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            4.8 hrs
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold">
            +35% this week
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.progress.averageScore}
          </span>
          <div className="text-xl font-black text-emerald-600">
            86%
          </div>
          <p className="text-[10px] text-slate-500">
            Based on {user.completedQuizzesCount} assessments
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t.dashboard.streak}
          </span>
          <div className="text-xl font-black text-amber-500 flex items-center gap-1">
            <span>🔥</span>
            <span>{user.streakDays}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Personal record!
          </p>
        </div>
      </div>

      {/* 3. Topic Mastery Progress Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          <span>{t.progress.masteryByTopic}</span>
        </h3>

        <div className="space-y-4">
          {topicMasteries.map((topic, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 dark:text-slate-200">
                  {isRtl ? topic.topicAr : topic.topic}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {topic.masteryPercentage}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    topic.masteryPercentage >= 80
                      ? 'bg-emerald-500'
                      : topic.masteryPercentage >= 60
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${topic.masteryPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t.progress.strengths}</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isRtl ? 'المعادلات الخطية من خطوتين (دقة 92%)' : 'Two-Step Linear Equations (92% Accuracy)'}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{isRtl ? 'الكسور المكافئة وتبسيط الكسور (دقة 88%)' : 'Equivalent Fractions & Simplification (88%)'}</span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{t.progress.needsWork}</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{isRtl ? 'أولويات العمليات مع الأقواس والأسس' : 'Order of Operations with Exponents'}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{isRtl ? 'حساب الاحتمالات المركبة' : 'Compound Probability Problems'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. Past Quiz Attempts History */}
      {quizAttempts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.progress.recentActivity}
          </h3>

          <div className="space-y-2">
            {quizAttempts.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {att.topic}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {att.date} • {att.difficulty}
                  </div>
                </div>

                <div className="font-bold text-indigo-600 dark:text-indigo-400">
                  {att.score} / {att.totalQuestions} ({Math.round((att.score / att.totalQuestions) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
