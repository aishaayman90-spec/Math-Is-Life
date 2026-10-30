import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Language,
  Theme,
  LessonExplanation,
  SmartNote,
  Flashcard,
  QuizAttempt,
  Badge,
  TopicMastery
} from '../types';
import { translations } from '../i18n/translations';

export type ActiveSection =
  | 'dashboard'
  | 'tutor'
  | 'whiteboard'
  | 'revision'
  | 'notes'
  | 'assistant'
  | 'games'
  | 'progress'
  | 'learningSpace'
  | 'settings';

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  currentSection: ActiveSection;
  setCurrentSection: (section: ActiveSection) => void;
  t: typeof translations.en;
  isRtl: boolean;

  // Lessons
  savedLessons: LessonExplanation[];
  activeLesson: LessonExplanation | null;
  setActiveLesson: (lesson: LessonExplanation | null) => void;
  saveLesson: (lesson: LessonExplanation) => void;
  lastStudiedTopic: string;

  // Notes
  notes: SmartNote[];
  addNote: (note: Omit<SmartNote, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, updates: Partial<SmartNote>) => void;
  deleteNote: (id: string) => void;

  // Flashcards
  flashcards: Flashcard[];
  addFlashcards: (newCards: Omit<Flashcard, 'id'>[]) => void;
  toggleCardMastered: (id: string) => void;

  // Quizzes & Progress
  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  topicMasteries: TopicMastery[];

  // Badges & XP
  badges: Badge[];
  addXp: (amount: number) => void;

  // Focus Mode & Mascot
  focusMode: boolean;
  toggleFocusMode: () => void;
  mascotTip: string;
  cycleMascotTip: () => void;
  mascotOpen: boolean;
  setMascotOpen: (open: boolean) => void;

  // Whiteboard session
  savedWhiteboardSnapshot: string | null;
  setSavedWhiteboardSnapshot: (snapshot: string | null) => void;

  // Reset
  resetData: () => void;
}

const defaultUser: UserProfile = {
  name: 'Aisha',
  avatar: '🦊',
  gradeLevel: 'Middle School (Grades 6-8)',
  country: 'Egypt',
  curriculum: 'Egyptian Ministry Curriculum',
  preferredLanguage: 'en',
  theme: 'light',
  explanationDepth: 'standard',
  xp: 350,
  streakDays: 4,
  lastActiveDate: new Date().toISOString(),
  completedLessonsCount: 8,
  completedQuizzesCount: 6
};

const initialBadges: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    nameAr: 'الخطوة الأولى',
    description: 'Complete your first math lesson',
    descriptionAr: 'أكمل أول درس رياضيات لك بنجاح',
    icon: '🌱',
    unlocked: true,
    progress: 100
  },
  {
    id: 'fraction_master',
    name: 'Fraction Wizard',
    nameAr: 'ساحر الكسور',
    description: 'Score 100% on a Fractions & Decimals quiz',
    descriptionAr: 'احصل على 100% في اختبار الكسور والأعداد العشرية',
    icon: '🍕',
    unlocked: true,
    progress: 100
  },
  {
    id: 'streak_fire',
    name: 'Flame Keeper',
    nameAr: 'حارس الشعلة',
    description: 'Maintain a 5-day learning streak',
    descriptionAr: 'حافظ على حماسة 5 أيام متواصلة من المذاكرة',
    icon: '🔥',
    unlocked: false,
    progress: 80
  },
  {
    id: 'mistake_detective',
    name: 'Master Detective',
    nameAr: 'المحقق العبقري',
    description: 'Find and correct 5 calculation traps',
    descriptionAr: 'اكتشف وصحح 5 أفخاخ وأخطاء حسابية شائعة',
    icon: '🕵️',
    unlocked: false,
    progress: 60
  },
  {
    id: 'whiteboard_artist',
    name: 'Visual Mathematician',
    nameAr: 'عالم الرياضيات البصري',
    description: 'Use the interactive whiteboard to solve 3 geometric problems',
    descriptionAr: 'استخدم السبورة التفاعلية لحل 3 مسائل هندسية وبصرية',
    icon: '🎨',
    unlocked: true,
    progress: 100
  }
];

const initialTopicMasteries: TopicMastery[] = [
  {
    topic: 'Linear Equations & Algebra',
    topicAr: 'المعادلات الخطية والجبر',
    masteryPercentage: 88,
    quizzesTaken: 4,
    status: 'mastered'
  },
  {
    topic: 'Fractions & Proportions',
    topicAr: 'الكسور والنسب والتناسب',
    masteryPercentage: 75,
    quizzesTaken: 3,
    status: 'learning'
  },
  {
    topic: 'Geometry & Area Formulas',
    topicAr: 'الهندسة وقوانين المساحات',
    masteryPercentage: 62,
    quizzesTaken: 2,
    status: 'learning'
  },
  {
    topic: 'Probability & Statistics',
    topicAr: 'الاحتمالات والإحصاء',
    masteryPercentage: 45,
    quizzesTaken: 1,
    status: 'needs_practice'
  }
];

const initialFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What is the Pythagorean Theorem formula?',
    back: 'a² + b² = c² (where c is the hypotenuse)',
    topic: 'Geometry',
    mastered: true
  },
  {
    id: 'fc-2',
    front: 'How do you divide two fractions (a/b ÷ c/d)?',
    back: 'Keep-Change-Flip: (a/b) × (d/c) = (a × d) / (b × c)',
    topic: 'Fractions',
    mastered: false
  },
  {
    id: 'fc-3',
    front: 'What is the slope formula between (x₁, y₁) and (x₂, y₂)?',
    back: 'm = (y₂ - y₁) / (x₂ - x₁)',
    topic: 'Algebra',
    mastered: true
  },
  {
    id: 'fc-4',
    front: 'What is the sum of interior angles in any triangle?',
    back: 'Always exactly 180 degrees!',
    topic: 'Geometry',
    mastered: false
  }
];

const initialNotes: SmartNote[] = [
  {
    id: 'note-1',
    title: 'Algebra Rules: The Balance Scale',
    content: 'Rule #1: Whatever you do to one side, you MUST do to the other.\nRule #2: Inverse operations cancel each other out (Addition cancels Subtraction, Multiplication cancels Division).\nExample: 3x + 4 = 19 -> 3x = 15 -> x = 5.',
    subject: 'Algebra',
    color: '#e0e7ff',
    isPinned: true,
    stickers: ['⚖️', '⭐', '💡'],
    createdAt: '2026-10-28',
    tags: ['equations', 'basics']
  },
  {
    id: 'note-2',
    title: 'Area & Perimeter Cheat Sheet',
    content: 'Rectangle: Perimeter = 2(L + W), Area = L × W\nTriangle: Area = 1/2 × base × height\nCircle: Circumference = 2πr, Area = πr²',
    subject: 'Geometry',
    color: '#dcfce7',
    isPinned: true,
    stickers: ['📐', '🎯'],
    createdAt: '2026-10-27',
    tags: ['formulas', 'shapes']
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or use defaults
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mil_user');
      return saved ? JSON.parse(saved) : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const [lang, setLangState] = useState<Language>(user.preferredLanguage || 'en');
  const [theme, setThemeState] = useState<Theme>(user.theme || 'light');
  const [currentSection, setCurrentSection] = useState<ActiveSection>('dashboard');

  const [savedLessons, setSavedLessons] = useState<LessonExplanation[]>(() => {
    try {
      const saved = localStorage.getItem('mil_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeLesson, setActiveLesson] = useState<LessonExplanation | null>(null);
  const [lastStudiedTopic, setLastStudiedTopic] = useState<string>('Linear Equations & Fractions');

  const [notes, setNotes] = useState<SmartNote[]>(() => {
    try {
      const saved = localStorage.getItem('mil_notes');
      return saved ? JSON.parse(saved) : initialNotes;
    } catch {
      return initialNotes;
    }
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('mil_flashcards');
      return saved ? JSON.parse(saved) : initialFlashcards;
    } catch {
      return initialFlashcards;
    }
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('mil_quizzes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('mil_badges');
      return saved ? JSON.parse(saved) : initialBadges;
    } catch {
      return initialBadges;
    }
  });

  const [topicMasteries, setTopicMasteries] = useState<TopicMastery[]>(initialTopicMasteries);
  const [focusMode, setFocusMode] = useState(false);
  const [savedWhiteboardSnapshot, setSavedWhiteboardSnapshot] = useState<string | null>(null);

  // Mascot tip system
  const t = translations[lang] || translations.en;
  const isRtl = lang === 'ar';
  const [mascotTipIdx, setMascotTipIdx] = useState(0);
  const [mascotOpen, setMascotOpen] = useState(true);

  const cycleMascotTip = () => {
    setMascotTipIdx((prev) => (prev + 1) % t.mascot.tips.length);
  };
  const mascotTip = t.mascot.tips[mascotTipIdx] || t.mascot.tips[0];

  // Sync HTML root attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [lang, theme, isRtl]);

  // Persist user
  useEffect(() => {
    try {
      localStorage.setItem('mil_user', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
  }, [user]);

  // Persist lessons
  useEffect(() => {
    try {
      localStorage.setItem('mil_lessons', JSON.stringify(savedLessons));
    } catch (e) {
      console.warn(e);
    }
  }, [savedLessons]);

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem('mil_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn(e);
    }
  }, [notes]);

  // Persist flashcards
  useEffect(() => {
    try {
      localStorage.setItem('mil_flashcards', JSON.stringify(flashcards));
    } catch (e) {
      console.warn(e);
    }
  }, [flashcards]);

  // Persist quizzes
  useEffect(() => {
    try {
      localStorage.setItem('mil_quizzes', JSON.stringify(quizAttempts));
    } catch (e) {
      console.warn(e);
    }
  }, [quizAttempts]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    updateUser({ preferredLanguage: newLang });
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    updateUser({ theme: next });
  };

  const saveLesson = (lesson: LessonExplanation) => {
    setSavedLessons((prev) => {
      const filtered = prev.filter((l) => l.topicTitle !== lesson.topicTitle);
      return [lesson, ...filtered];
    });
    setLastStudiedTopic(lesson.topicTitle);
    updateUser({ completedLessonsCount: user.completedLessonsCount + 1 });
    addXp(30);
  };

  const addNote = (noteData: Omit<SmartNote, 'id' | 'createdAt'>) => {
    const newNote: SmartNote = {
      ...noteData,
      id: 'note-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setNotes((prev) => [newNote, ...prev]);
    addXp(10);
  };

  const updateNote = (id: string, updates: Partial<SmartNote>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addFlashcards = (newCards: Omit<Flashcard, 'id'>[]) => {
    const created: Flashcard[] = newCards.map((c, i) => ({
      ...c,
      id: `fc-${Date.now()}-${i}`
    }));
    setFlashcards((prev) => [...created, ...prev]);
    addXp(20);
  };

  const toggleCardMastered = (id: string) => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered, lastReviewed: new Date().toISOString() } : c))
    );
  };

  const recordQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [attempt, ...prev]);
    updateUser({ completedQuizzesCount: user.completedQuizzesCount + 1 });
    const earned = Math.round((attempt.score / attempt.totalQuestions) * 50);
    addXp(earned);
  };

  const addXp = (amount: number) => {
    setUser((prev) => ({ ...prev, xp: prev.xp + amount }));
  };

  const toggleFocusMode = () => {
    setFocusMode((prev) => !prev);
  };

  const resetData = () => {
    setUser(defaultUser);
    setNotes(initialNotes);
    setFlashcards(initialFlashcards);
    setQuizAttempts([]);
    setSavedLessons([]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        lang,
        setLang,
        theme,
        toggleTheme,
        currentSection,
        setCurrentSection,
        t,
        isRtl,
        savedLessons,
        activeLesson,
        setActiveLesson,
        saveLesson,
        lastStudiedTopic,
        notes,
        addNote,
        updateNote,
        deleteNote,
        flashcards,
        addFlashcards,
        toggleCardMastered,
        quizAttempts,
        recordQuizAttempt,
        topicMasteries,
        badges,
        addXp,
        focusMode,
        toggleFocusMode,
        mascotTip,
        cycleMascotTip,
        mascotOpen,
        setMascotOpen,
        savedWhiteboardSnapshot,
        setSavedWhiteboardSnapshot,
        resetData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
