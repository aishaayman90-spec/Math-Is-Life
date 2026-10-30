import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderHeart,
  FileText,
  BookOpen,
  BrainCircuit,
  Trophy,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const MyLearningSpaceView: React.FC = () => {
  const {
    savedLessons,
    notes,
    badges,
    setCurrentSection,
    setActiveLesson,
    t,
    isRtl
  } = useApp();

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <FolderHeart className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.learningSpace.title}
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.learningSpace.subtitle}
        </p>
      </div>

      {/* 2. Saved Lesson Explanations */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-500" />
          <span>{t.learningSpace.savedExplanations} ({savedLessons.length})</span>
        </h2>

        {savedLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedLessons.map((lesson, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-300 transition"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    AI Lesson
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {lesson.topicTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {lesson.summary}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveLesson(lesson);
                    setCurrentSection('tutor');
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isRtl ? 'فتح الدرس' : 'Re-open Lesson'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            {isRtl
              ? 'لم تقم بحفظ أي دروس بعد. استخدم المعلم الذكي لشرح أي درس وسيتم حفظه تلقائياً هنا!'
              : 'No saved lessons yet. Ask the AI Tutor any lesson and it will automatically appear here!'}
          </div>
        )}
      </div>

      {/* 3. Quick Notes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>{t.learningSpace.quickNotes} ({notes.length})</span>
          </h2>
          <button
            onClick={() => setCurrentSection('notes')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            {isRtl ? 'فتح كل الملاحظات' : 'View All Notes'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {notes.slice(0, 4).map((note) => (
            <div
              key={note.id}
              onClick={() => setCurrentSection('notes')}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs cursor-pointer hover:scale-102 transition-transform"
              style={{ backgroundColor: note.color }}
            >
              <div className="text-sm mb-1">{note.stickers?.[0] || '📝'}</div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {note.title}
              </h4>
              <p className="text-[11px] text-slate-700 line-clamp-2 mt-1">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Unlocked Badges & Milestones */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{isRtl ? 'الأوسمة التي فتحتها في رحلتك' : 'Unlocked Milestones & Trophies'}</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          {badges
            .filter((b) => b.unlocked)
            .map((b) => (
              <div
                key={b.id}
                className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200"
              >
                <span className="text-xl">{b.icon}</span>
                <span>{isRtl ? b.nameAr : b.name}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
