import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, CheckCircle2, User, Globe, BookOpen, Sparkles, Moon, Sun } from 'lucide-react';
import { GradeLevel, Curriculum, Language, Theme } from '../../types';

export const ProfileSettingsView: React.FC = () => {
  const { user, updateUser, lang, setLang, theme, toggleTheme, t, isRtl } = useApp();

  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(user.gradeLevel);
  const [country, setCountry] = useState(user.country);
  const [curriculum, setCurriculum] = useState<Curriculum>(user.curriculum);
  const [depth, setDepth] = useState(user.explanationDepth);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const avatars = ['🦊', '🦉', '🎓', '🚀', '⭐', '🦁', '🐬', '🐼'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      avatar,
      gradeLevel,
      country,
      curriculum,
      explanationDepth: depth
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-2xl mx-auto">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-700/20">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.settings.title}
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t.settings.savedSuccess}</span>
        </div>
      )}

      {/* 2. Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        {/* Avatar selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            {isRtl ? 'صورة الملف الشخصي' : 'Student Avatar'}
          </label>
          <div className="flex items-center gap-2">
            {avatars.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition cursor-pointer ${
                  avatar === av
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-110 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            {t.settings.studentName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold dark:text-white"
          />
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            {t.settings.gradeLevel}
          </label>
          <select
            value={gradeLevel}
            onChange={(e: any) => setGradeLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="Elementary (Grades 1-3)">Elementary (Grades 1-3)</option>
            <option value="Elementary (Grades 4-5)">Elementary (Grades 4-5)</option>
            <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
            <option value="High School (Grades 9-10)">High School (Grades 9-10)</option>
            <option value="High School (Grades 11-12)">High School (Grades 11-12)</option>
            <option value="College / Prep">College / Prep</option>
          </select>
        </div>

        {/* Country & Curriculum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t.settings.country}
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t.settings.curriculum}
            </label>
            <select
              value={curriculum}
              onChange={(e: any) => setCurriculum(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
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

        {/* AI Explanation Style */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            {t.settings.explanationDepth}
          </label>
          <div className="space-y-2">
            {[
              { id: 'simple', label: t.settings.depthSimple },
              { id: 'standard', label: t.settings.depthStandard },
              { id: 'deep_reasoning', label: t.settings.depthDeep }
            ].map((option) => (
              <label
                key={option.id}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                  depth === option.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-900 dark:text-indigo-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="depth"
                  checked={depth === option.id}
                  onChange={() => setDepth(option.id as any)}
                  className="mt-1 text-indigo-600"
                />
                <span className="text-xs font-semibold">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Language & Theme switches */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-200"
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'en' ? 'Switch to العربية' : 'Switch to English'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-200"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t.settings.saveSettings}</span>
        </button>
      </form>
    </div>
  );
};
