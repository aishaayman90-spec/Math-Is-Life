import React from 'react';
import { useApp, ActiveSection } from '../../context/AppContext';
import {
  LayoutDashboard,
  BrainCircuit,
  PenTool,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  Gamepad2,
  TrendingUp,
  FolderHeart,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentSection, setCurrentSection, t, isRtl } = useApp();

  const navItems: { id: ActiveSection; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'tutor', label: t.nav.tutor, icon: BrainCircuit, badge: 'AI' },
    { id: 'whiteboard', label: t.nav.whiteboard, icon: PenTool, badge: 'Canvas' },
    { id: 'revision', label: t.nav.revision, icon: CheckCircle2 },
    { id: 'notes', label: t.nav.notes, icon: BookOpen },
    { id: 'assistant', label: t.nav.assistant, icon: CalendarDays },
    { id: 'games', label: t.nav.games, icon: Gamepad2, badge: 'XP' },
    { id: 'progress', label: t.nav.progress, icon: TrendingUp },
    { id: 'learningSpace', label: t.nav.learningSpace, icon: FolderHeart },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleSelect = (id: ActiveSection) => {
    setCurrentSection(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] ${
          isRtl ? 'right-0' : 'left-0'
        } z-40 h-full lg:h-[calc(100vh-57px)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 p-3.5 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile Header in Drawer */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {t.appTitle}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Motivational Card / Mascot Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🦊</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isRtl ? 'بيوي جاهز لمساعدتك' : 'Piwi is ready!'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isRtl ? 'لا تتردد في طلب الشرح' : 'Ask anytime for math hints'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSelect('tutor')}
              className="w-full mt-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition text-center shadow-xs cursor-pointer"
            >
              {isRtl ? 'ابدأ سؤالاً الآن' : 'Ask Tutor Now'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
