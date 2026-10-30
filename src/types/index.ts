export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type GradeLevel =
  | 'Elementary (Grades 1-3)'
  | 'Elementary (Grades 4-5)'
  | 'Middle School (Grades 6-8)'
  | 'High School (Grades 9-10)'
  | 'High School (Grades 11-12)'
  | 'College / Prep';

export type Curriculum =
  | 'US Common Core'
  | 'UK National / GCSE / A-Level'
  | 'Saudi National Curriculum'
  | 'Egyptian Ministry Curriculum'
  | 'Gulf / UAE Ministry Curriculum'
  | 'International Baccalaureate (IB)'
  | 'CBSE / ICSE (India)'
  | 'General International';

export interface UserProfile {
  name: string;
  avatar: string;
  gradeLevel: GradeLevel;
  country: string;
  curriculum: Curriculum;
  preferredLanguage: Language;
  theme: Theme;
  explanationDepth: 'simple' | 'standard' | 'deep_reasoning';
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessonsCount: number;
  completedQuizzesCount: number;
}

export interface LessonStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathExpression?: string;
  tip?: string;
}

export interface RealLifeExample {
  scenario: string;
  practicalApplication: string;
  icon?: string;
}

export interface VisualModelData {
  type: 'number_line' | 'bar_model' | 'fraction_pie' | 'coordinate_grid';
  description: string;
  data: any;
}

export interface CommonMistake {
  mistake: string;
  whyItHappens: string;
  howToAvoid: string;
}

export interface CheckQuestion {
  question: string;
  hint: string;
  answer: string;
}

export interface LessonExplanation {
  topicTitle: string;
  summary: string;
  keyRulesAndFormulas: string[];
  stepByStep: LessonStep[];
  realLifeExamples: RealLifeExample[];
  visualModel?: VisualModelData;
  commonMistakes: CommonMistake[];
  checkUnderstandingQuestions: CheckQuestion[];
}

export interface SolutionMethod {
  methodName: string;
  subtitle: string;
  explanation: string;
  visualDescription?: string;
  steps: string[];
  whyItWorks: string;
}

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in'
  | 'matching'
  | 'step_by_step'
  | 'word_problem'
  | 'hots';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: any;
  matchingPairs?: { left: string; right: string }[];
  steps?: { prompt: string; expectedAnswer: string; explanation: string }[];
  hint: string;
  fullExplanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl?: string;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  date: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  mode: 'practice' | 'answer';
  answers: Record<string, any>;
}

export interface SmartNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  color: string;
  isPinned: boolean;
  stickers: string[];
  createdAt: string;
  reminderDate?: string;
  handwritingDrawing?: string; // data URL of sketch
  tags: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  mastered: boolean;
  lastReviewed?: string;
}

export interface StudyPlanPhase {
  phaseName: string;
  days: string;
  milestone: string;
  tasks: { title: string; duration: string; activityType: string; completed?: boolean }[];
}

export interface StudyPlan {
  planTitle: string;
  totalDurationWeeks: number;
  dailyTargetMinutes: number;
  phases: StudyPlanPhase[];
  mindMap: {
    center: string;
    branches: { name: string; subtopics: string[] }[];
  };
  flashcards: { front: string; back: string }[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  story: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  rewardXp: number;
  completed?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface TopicMastery {
  topic: string;
  topicAr: string;
  masteryPercentage: number;
  quizzesTaken: number;
  status: 'mastered' | 'learning' | 'needs_practice';
}
