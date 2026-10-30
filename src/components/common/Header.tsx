import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Flame,
  Sun,
  Moon,
  Languages,
  Maximize2,
  Menu,
  GraduationCap
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    user,
    lang,
    setLang,
    theme,
    toggleTheme,
    toggleFocusMode,
    t,
    mascotOpen,
    setMascotOpen,
    setCurrentSection
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + App Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentSection('dashboard')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl tracking-tighter">π</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  {t.appTitle}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {user.gradeLevel}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Quick Stats (Streak & XP) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>
              {user.streakDays} {t.dashboard.streak}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>
              {user.xp} {t.dashboard.xpEarned}
            </span>
          </div>
        </div>

        {/* Right: Actions & Preferences */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Focus Mode button */}
          <button
            onClick={toggleFocusMode}
            title={t.nav.focusMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">{t.nav.focusMode}</span>
          </button>

          {/* Language Toggle (EN / AR) */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            title="Switch Language (العربية / English)"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Mascot Toggle */}
          <button
            onClick={() => setMascotOpen(!mascotOpen)}
            className={`p-1.5 rounded-lg border text-sm transition ${
              mascotOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-600'
                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
            }`}
            title="Toggle Mascot Piwi"
          >
            🦊
          </button>

          {/* Profile quick button */}
          <button
            onClick={() => setCurrentSection('settings')}
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-indigo-400 transition"
            title={user.name}
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden md:inline">
              {user.name}
            </span>
            <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user.avatar || '🎓'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
