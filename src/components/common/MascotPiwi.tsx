import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

export const MascotPiwi: React.FC = () => {
  const { mascotTip, cycleMascotTip, mascotOpen, setMascotOpen, isRtl, addXp } = useApp();
  const [cheering, setCheering] = useState(false);

  if (!mascotOpen) return null;

  const handleHighFive = () => {
    setCheering(true);
    addXp(5);
    setTimeout(() => setCheering(false), 1500);
  };

  return (
    <div
      className={`fixed bottom-5 ${
        isRtl ? 'left-5' : 'right-5'
      } z-30 max-w-xs transition-all duration-300 animate-float-subtle`}
    >
      <div className="relative bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl shadow-xl shadow-indigo-500/10 p-3.5">
        {/* Top bar with close */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🦊</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {isRtl ? 'بيوي (رفيق الرياضيات)' : 'Piwi (Math Buddy)'}
            </span>
          </div>
          <button
            onClick={() => setMascotOpen(false)}
            aria-label="Close mascot"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mascot Message */}
        <div className="flex items-start gap-2.5 my-1">
          <div
            onClick={handleHighFive}
            title={isRtl ? 'اضغط للمصافحة والتشجيع!' : 'Click for high five!'}
            className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-xl shrink-0 cursor-pointer shadow-xs transition-transform ${
              cheering ? 'scale-125 rotate-12' : 'hover:scale-110'
            }`}
          >
            {cheering ? '🎉' : '🦊'}
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {cheering ? (
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {isRtl ? 'كفووو! +5 نقاط حماسة!' : 'High five! +5 XP! Keep rocking!'}
              </span>
            ) : (
              mascotTip
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <button
            onClick={cycleMascotTip}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isRtl ? 'نصيحة أخرى' : 'Next Tip'}</span>
          </button>

          <button
            onClick={handleHighFive}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isRtl ? 'صافح بيوي ✋' : 'High Five! ✋'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
