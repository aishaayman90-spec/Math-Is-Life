import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gamepad2,
  Flame,
  Trophy,
  Sparkles,
  Timer,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

type GameMode = 'menu' | 'speed' | 'mistake' | 'pattern' | 'ordering';

export const MathGamesView: React.FC = () => {
  const { user, lang, t, isRtl, badges, addXp } = useApp();

  const [activeGame, setActiveGame] = useState<GameMode>('menu');

  // Game 1: Speed Mental Math state
  const [speedTimer, setSpeedTimer] = useState(30);
  const [speedActive, setSpeedActive] = useState(false);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedStreak, setSpeedStreak] = useState(0);
  const [currentSpeedProblem, setCurrentSpeedProblem] = useState({ q: '7 × 8', a: 56, options: [48, 54, 56, 64] });

  // Game 2: Find the Mistake state
  const [mistakeIdx, setMistakeIdx] = useState(0);
  const mistakeProblems = [
    {
      problem: 'Solve: 4(x - 2) = 20',
      steps: [
        'Step 1: 4x - 8 = 20',
        'Step 2: 4x = 20 - 8 = 12', // The mistake!
        'Step 3: x = 3'
      ],
      wrongStepIndex: 1,
      explanation: isRtl
        ? 'الخطوة 2 خاطئة! عند نقل (-8) للطرف الآخر، يجب أن تصبح (+8): 20 + 8 = 28!'
        : 'Step 2 is wrong! When moving -8 across the equals sign, you must add: 20 + 8 = 28!'
    },
    {
      problem: 'Simplify: 3/5 + 1/10',
      steps: [
        'Step 1: Convert 3/5 to tenths -> 6/10',
        'Step 2: 6/10 + 1/10 = 7/20', // The mistake!
        'Step 3: Result = 7/20'
      ],
      wrongStepIndex: 1,
      explanation: isRtl
        ? 'الخطوة 2 خاطئة! نجمع البسط فقط: 6 + 1 = 7 مع بقاء المقام 10 كما هو (7/10)!'
        : 'Step 2 is wrong! Do not add denominators. The denominator remains 10 (7/10)!'
    }
  ];
  const [selectedMistakeStep, setSelectedMistakeStep] = useState<number | null>(null);
  const [mistakeRevealed, setMistakeRevealed] = useState(false);

  // Game 3: Complete the Pattern state
  const [patternIdx, setPatternIdx] = useState(0);
  const patternProblems = [
    {
      sequence: '2, 5, 11, 23, ?',
      options: ['35', '47', '46', '52'],
      answer: '47',
      rule: isRtl ? 'القاعدة: اضرب في 2 ثم أضف 1 (2n + 1)!' : 'Rule: Multiply by 2 and add 1!'
    },
    {
      sequence: '1, 1, 2, 3, 5, 8, 13, ?',
      options: ['20', '21', '24', '18'],
      answer: '21',
      rule: isRtl ? 'متتالية فيبوناتشي: كل رقم هو مجموع الرقمين السابقين!' : 'Fibonacci sequence: each number is sum of previous two!'
    }
  ];
  const [selectedPatternOpt, setSelectedPatternOpt] = useState<string | null>(null);

  // Speed Math timer
  useEffect(() => {
    let interval: any = null;
    if (speedActive && speedTimer > 0) {
      interval = setInterval(() => setSpeedTimer((p) => p - 1), 1000);
    } else if (speedTimer === 0 && speedActive) {
      setSpeedActive(false);
      addXp(speedScore * 10);
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch {}
    }
    return () => clearInterval(interval);
  }, [speedActive, speedTimer, speedScore]);

  const generateSpeedProblem = () => {
    const a = Math.floor(Math.random() * 10) + 3;
    const b = Math.floor(Math.random() * 10) + 2;
    const ops = ['+', '×', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '×') ans = a * b;
    else ans = Math.max(a, b) - Math.min(a, b);

    const q = op === '-' ? `${Math.max(a, b)} - ${Math.min(a, b)}` : `${a} ${op} ${b}`;
    const opts = [ans, ans + 2, ans - 3, ans + 5].sort(() => Math.random() - 0.5);
    setCurrentSpeedProblem({ q, a: ans, options: opts });
  };

  const startSpeedMath = () => {
    setSpeedTimer(30);
    setSpeedScore(0);
    setSpeedStreak(0);
    generateSpeedProblem();
    setSpeedActive(true);
    setActiveGame('speed');
  };

  const handleSpeedAnswer = (chosen: number) => {
    if (!speedActive) return;
    if (chosen === currentSpeedProblem.a) {
      setSpeedScore((p) => p + 1);
      setSpeedStreak((p) => p + 1);
    } else {
      setSpeedStreak(0);
    }
    generateSpeedProblem();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.games.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.games.subtitle}
          </p>
        </div>

        {activeGame !== 'menu' && (
          <button
            onClick={() => setActiveGame('menu')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition cursor-pointer self-start sm:self-auto"
          >
            ← {isRtl ? 'العودة لساحة الألعاب' : 'All Games'}
          </button>
        )}
      </div>

      {/* 2. GAME SELECTION MENU */}
      {activeGame === 'menu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Game 1: Speed Mental Math */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-pink-300 dark:hover:border-pink-800 transition">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center text-2xl shadow-xs">
                  ⚡
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.games.speedMath}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.games.speedMathDesc}
                </p>
              </div>

              <button
                onClick={startSpeedMath}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t.games.startGame} (30s)</span>
              </button>
            </div>

            {/* Game 2: Find the Mistake */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 dark:hover:border-amber-800 transition">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-xs">
                  🕵️
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.games.findMistake}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.games.findMistakeDesc}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedMistakeStep(null);
                  setMistakeRevealed(false);
                  setActiveGame('mistake');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t.games.startGame}</span>
              </button>
            </div>

            {/* Game 3: Complete the Pattern */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-xs">
                  🔮
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.games.completePattern}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.games.completePatternDesc}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPatternOpt(null);
                  setActiveGame('pattern');
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t.games.startGame}</span>
              </button>
            </div>

            {/* Game 4: Number Order */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-800 transition">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-xs">
                  🔢
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.games.numberOrder}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.games.numberOrderDesc}
                </p>
              </div>

              <button
                onClick={() => setActiveGame('ordering')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t.games.startGame}</span>
              </button>
            </div>
          </div>

          {/* Badges & Achievements Shelf */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{t.games.badgesAndAchievements}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                    badge.unlocked
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="text-3xl mx-auto">{badge.icon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      {isRtl ? badge.nameAr : badge.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {isRtl ? badge.descriptionAr : badge.description}
                    </p>
                  </div>
                  {badge.unlocked ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      Unlocked ✨
                    </span>
                  ) : (
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GAME 1 ARENA: Speed Mental Math */}
      {activeGame === 'speed' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-lg max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-base font-black text-rose-500">
              <Timer className="w-5 h-5 animate-pulse" />
              <span>{speedTimer}s</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Score: {speedScore}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                🔥 {speedStreak}
              </span>
            </div>
          </div>

          {speedActive ? (
            <div className="space-y-6 py-4">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-wide">
                {currentSpeedProblem.q} = ?
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentSpeedProblem.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSpeedAnswer(opt)}
                    className="p-5 rounded-2xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 font-black text-xl transition-all shadow-xs cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              <span className="text-5xl">⏰</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {isRtl ? 'انتهى الوقت!' : "Time's Up!"}
              </h3>
              <p className="text-xs text-slate-500">
                You solved {speedScore} problems! Earned +{speedScore * 10} XP!
              </p>
              <button
                onClick={startSpeedMath}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {isRtl ? 'العب مجدداً' : 'Play Again'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2 ARENA: Find the Mistake */}
      {activeGame === 'mistake' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg max-w-xl mx-auto">
          <div className="text-center space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase">
              {isRtl ? 'المحقق الرياضي' : 'Spot The Error'}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {mistakeProblems[mistakeIdx].problem}
            </h3>
            <p className="text-xs text-slate-500">
              {isRtl ? 'اضغط على الخطوة التي تحتوي على الخطأ الحسابي:' : 'Click on the exact step where the student made an error:'}
            </p>
          </div>

          <div className="space-y-2.5">
            {mistakeProblems[mistakeIdx].steps.map((step, idx) => {
              const isSelected = selectedMistakeStep === idx;
              const isCorrect = idx === mistakeProblems[mistakeIdx].wrongStepIndex;
              let style = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
              if (isSelected) {
                style = isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-800 dark:text-rose-200';
              }
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMistakeStep(idx);
                    setMistakeRevealed(true);
                    if (isCorrect) addXp(20);
                  }}
                  className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-bold text-left transition cursor-pointer flex items-center justify-between ${style}`}
                >
                  <span>{step}</span>
                  {isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          {mistakeRevealed && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold block">{isRtl ? 'تشخيص المحقق:' : 'Detective Explanation:'}</span>
              <p>{mistakeProblems[mistakeIdx].explanation}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setMistakeIdx((p) => (p + 1) % mistakeProblems.length);
                setSelectedMistakeStep(null);
                setMistakeRevealed(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer"
            >
              {isRtl ? 'المسألة التالية' : 'Next Problem'}
            </button>
          </div>
        </div>
      )}

      {/* GAME 3 ARENA: Complete the Pattern */}
      {activeGame === 'pattern' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg max-w-xl mx-auto text-center">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
              {isRtl ? 'أكمل النمط' : 'Pattern Challenge'}
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono py-2">
              {patternProblems[patternIdx].sequence}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {patternProblems[patternIdx].options.map((opt, i) => {
              const isSelected = selectedPatternOpt === opt;
              const isCorrect = opt === patternProblems[patternIdx].answer;
              let style = 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
              if (isSelected) {
                style = isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
              }
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedPatternOpt(opt);
                    if (isCorrect) addXp(20);
                  }}
                  className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-lg font-black transition cursor-pointer ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedPatternOpt && (
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-800 dark:text-indigo-300 font-semibold">
              💡 {patternProblems[patternIdx].rule}
            </div>
          )}

          <button
            onClick={() => {
              setPatternIdx((p) => (p + 1) % patternProblems.length);
              setSelectedPatternOpt(null);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
          >
            {isRtl ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {/* GAME 4 ARENA: Number Ordering */}
      {activeGame === 'ordering' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg max-w-xl mx-auto text-center">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
              {isRtl ? 'ترتيب الأعداد' : 'Order From Least To Greatest'}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isRtl ? 'رتب الأعداد التالية تصاعدياً من الأصغر إلى الأكبر:' : 'Arrange from smallest to largest:'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 py-4">
            {['-5', '-1.5', '1/4 (0.25)', '3/4 (0.75)', '2.5'].map((num, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 font-mono text-sm font-bold shadow-xs"
              >
                {num}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            {isRtl ? 'ممتاز! الأعداد السالبة الأصغر تأتي أولاً ثم الكسور ثم الأعداد الموجبة.' : 'Correct order! Negative values precede fractions and positive decimals.'}
          </p>

          <button
            onClick={() => {
              addXp(25);
              setActiveGame('menu');
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            {isRtl ? 'إكمال وحصد النقاط (+25 XP)' : 'Claim +25 XP & Finish'}
          </button>
        </div>
      )}
    </div>
  );
};
