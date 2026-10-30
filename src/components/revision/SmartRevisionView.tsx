import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuizQuestion, QuestionType } from '../../types';
import {
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trophy,
  AlertCircle,
  Eye,
  Sliders,
  Check,
  X,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SmartRevisionView: React.FC = () => {
  const { user, lang, t, isRtl, recordQuizAttempt, addXp } = useApp();

  // Mode: Practice vs Answer Mode
  const [quizMode, setQuizMode] = useState<'practice' | 'answer'>('practice');

  // Quiz Builder inputs
  const [topic, setTopic] = useState('Linear Equations & Fractions');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'multiple_choice',
    'true_false',
    'fill_in',
    'matching',
    'hots'
  ]);

  // Quiz execution states
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});
  const [matchingSelections, setMatchingSelections] = useState<{ left?: string; right?: string }>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const toggleType = (type: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setQuizCompleted(false);
    setUserAnswers({});
    setCheckedAnswers({});
    setRevealedHints({});
    setCurrentIndex(0);

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          gradeLevel: user.gradeLevel,
          difficulty,
          count: questionCount,
          questionTypes: selectedTypes,
          language: lang
        })
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setQuestions(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (checkedAnswers[currentQ.id] && quizMode === 'practice') return;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  const handleCheckAnswer = () => {
    if (!userAnswers[currentQ.id]) return;
    setCheckedAnswers((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'hots') {
        if (ans === q.correctAnswer) correctCount++;
      } else if (q.type === 'fill_in') {
        if (ans?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase()) {
          correctCount++;
        }
      } else if (q.type === 'matching') {
        correctCount++; // Award on completion
      } else {
        correctCount++;
      }
    });

    setScore(correctCount);
    setQuizCompleted(true);

    // Confetti celebration
    if (correctCount >= questions.length / 2) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    // Save attempt
    recordQuizAttempt({
      id: 'attempt-' + Date.now(),
      topic,
      date: new Date().toISOString().slice(0, 10),
      score: correctCount,
      totalQuestions: questions.length,
      difficulty,
      mode: quizMode,
      answers: userAnswers
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.revision.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.revision.subtitle}
          </p>
        </div>

        {/* Practice vs Model Answer Mode Selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setQuizMode('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              quizMode === 'practice'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.revision.modePractice}
          </button>
          <button
            onClick={() => setQuizMode('answer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              quizMode === 'answer'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.revision.modeAnswer}</span>
          </button>
        </div>
      </div>

      {/* Mode Description Banner */}
      <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          {quizMode === 'practice' ? t.revision.modePracticeDesc : t.revision.modeAnswerDesc}
        </span>
      </div>

      {/* 2. Custom Quiz Generator Drawer/Card */}
      {questions.length === 0 || quizCompleted ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>{t.revision.createQuiz}</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t.revision.topic}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Solving Linear Equations, Fractions, Trigonometry..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.revision.difficulty}
                </label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="easy">{isRtl ? 'سهل وبسيط' : 'Easy / Foundations'}</option>
                  <option value="medium">{isRtl ? 'متوسط ومدرسي' : 'Medium / Standard'}</option>
                  <option value="hard">{isRtl ? 'متقدم وتفكير عليا' : 'Hard / Critical Thinking'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.revision.questionCount}
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        questionCount === num
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Types Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                {t.revision.questionTypes}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'multiple_choice', label: isRtl ? 'اختيار من متعدد' : 'Multiple Choice' },
                  { id: 'true_false', label: isRtl ? 'صواب أو خطأ' : 'True / False' },
                  { id: 'fill_in', label: isRtl ? 'أكمل الفراغ' : 'Fill in Blank' },
                  { id: 'matching', label: isRtl ? 'توصيل ومطابقة' : 'Matching' },
                  { id: 'hots', label: isRtl ? 'مهارات تفكير عليا (HOTS)' : 'Higher-Order Thinking' }
                ].map((typeItem) => {
                  const isSelected = selectedTypes.includes(typeItem.id as QuestionType);
                  return (
                    <button
                      key={typeItem.id}
                      type="button"
                      onClick={() => toggleType(typeItem.id as QuestionType)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-purple-600" />}
                      <span>{typeItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.revision.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.revision.generateQuizBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* 3. Active Quiz Question View */}
      {questions.length > 0 && !quizCompleted && currentQ && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Question progress header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                {t.revision.questionNum} {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                {currentQ.type}
              </span>
            </div>

            <button
              onClick={() =>
                setRevealedHints((prev) => ({
                  ...prev,
                  [currentQ.id]: !prev[currentQ.id]
                }))
              }
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.revision.showHint}</span>
            </button>
          </div>

          {/* Hint reveal */}
          {revealedHints[currentQ.id] && currentQ.hint && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              💡 {isRtl ? 'تلميح المعلم بيوي:' : 'Hint:'} {currentQ.hint}
            </div>
          )}

          {/* Question text */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* QUESTION TYPE 1: Multiple Choice or True/False or HOTS */}
          {(currentQ.type === 'multiple_choice' ||
            currentQ.type === 'true_false' ||
            currentQ.type === 'hots') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options?.map((opt, i) => {
                const isSelected = userAnswers[currentQ.id] === opt;
                const isChecked = checkedAnswers[currentQ.id] || quizMode === 'answer';
                const isCorrect = opt === currentQ.correctAnswer;

                let btnStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-300';
                if (isSelected) {
                  btnStyle = 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-400/30';
                }
                if (isChecked) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition text-left flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isChecked && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* QUESTION TYPE 2: Fill in the Blanks */}
          {currentQ.type === 'fill_in' && (
            <div className="space-y-3">
              <input
                type="text"
                value={userAnswers[currentQ.id] || ''}
                onChange={(e) =>
                  setUserAnswers((prev) => ({
                    ...prev,
                    [currentQ.id]: e.target.value
                  }))
                }
                placeholder={isRtl ? 'اكتب إجابتك هنا...' : 'Enter your numerical or term answer...'}
                className="w-full max-w-sm px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono dark:text-white"
              />
            </div>
          )}

          {/* QUESTION TYPE 3: Matching Pairs */}
          {currentQ.type === 'matching' && currentQ.matchingPairs && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">{t.revision.matchingInstructions}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {isRtl ? 'العمود الأول' : 'Column A'}
                  </span>
                  {currentQ.matchingPairs.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      {p.left}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    {isRtl ? 'العمود المقابل' : 'Matches'}
                  </span>
                  {currentQ.matchingPairs.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                    >
                      {p.right}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback & Model Answer Explanation */}
          {(checkedAnswers[currentQ.id] || quizMode === 'answer') && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {isRtl ? 'الشرح والحل النموذجي بالتفصيل:' : 'Model Answer & Explanation:'}
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {currentQ.fullExplanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {quizMode === 'practice' && !checkedAnswers[currentQ.id] ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!userAnswers[currentQ.id]}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-40"
              >
                {t.revision.submitAnswer}
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>
                {currentIndex === questions.length - 1 ? t.revision.finishQuiz : t.revision.nextQuestion}
              </span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Quiz Completion Scorecard */}
      {quizCompleted && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center text-3xl shadow-sm">
            🏆
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.revision.scoreTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {topic} • {difficulty}
            </p>
          </div>

          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
                {score} / {questions.length}
              </div>
              <div className="text-[10px] font-bold text-purple-500 uppercase">
                {t.revision.score}
              </div>
            </div>

            <div className="h-8 w-px bg-purple-200 dark:bg-purple-800" />

            <div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                +{Math.round((score / questions.length) * 50)}
              </div>
              <div className="text-[10px] font-bold text-amber-500 uppercase">
                {t.revision.earnedXp}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={handleGenerateQuiz}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
            >
              {t.revision.retakeQuiz}
            </button>
            <button
              onClick={() => {
                setQuizMode('answer');
                setQuizCompleted(false);
                setCurrentIndex(0);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              {t.revision.reviewAnswers}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
