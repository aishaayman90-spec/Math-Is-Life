import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Minimize2, Play, Pause, RotateCcw, Brain, CheckCircle } from 'lucide-react';

export const FocusModeOverlay: React.FC = () => {
  const { focusMode, toggleFocusMode, activeLesson, isRtl } = useApp();
  const [seconds, setSeconds] = useState(25 * 60); // 25 min pomodoro
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  if (!focusMode) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide text-indigo-300">
            {isRtl ? 'وضع التركيز الذهني المطلق' : 'Distraction-Free Focus Study'}
          </span>
        </div>

        {/* Pomodoro Timer */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full">
          <span className="font-mono text-base font-bold text-amber-400">
            {timeFormatted}
          </span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSeconds(25 * 60);
            }}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={toggleFocusMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>{isRtl ? 'إنهاء وضع التركيز' : 'Exit Focus'}</span>
        </button>
      </div>

      {/* Focus Content */}
      <div className="max-w-3xl w-full mx-auto my-auto py-8">
        {activeLesson ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {isRtl ? 'الدرس الحالي' : 'Active Focus Topic'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {activeLesson.topicTitle}
              </h2>
              <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
                {activeLesson.summary}
              </p>
            </div>

            {/* Core rules in zen box */}
            {activeLesson.keyRulesAndFormulas?.length > 0 && (
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {isRtl ? 'القواعد والقوانين الأساسية' : 'Core Formulas & Principles'}
                </h3>
                <ul className="space-y-2">
                  {activeLesson.keyRulesAndFormulas.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps in zen cards */}
            <div className="space-y-3">
              {activeLesson.stepByStep?.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.explanation}</p>
                    {step.mathExpression && (
                      <div className="mt-2 font-mono text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800 inline-block">
                        {step.mathExpression}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center text-3xl">
              🧘
            </div>
            <h3 className="text-xl font-bold text-white">
              {isRtl ? 'أنت الآن في منطقة التركيز الهادئ' : 'You are in the Deep Focus Zone'}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              {isRtl
                ? 'استغل وقتك لحل مسألة محددة دون مشتتات أو إشعارات. يمكنك العودة في أي وقت بالضغط على زر إنهاء وضع التركيز أعلاه.'
                : 'Zero distractions, zero notifications. Work through your math tasks with calm clarity.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
