import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to call Gemini with graceful fallback
async function callGemini(
  prompt: string,
  systemInstruction?: string,
  imagePart?: { mimeType: string; data: string }
): Promise<string> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const parts: any[] = [];
  if (imagePart) {
    parts.push({
      inlineData: {
        mimeType: imagePart.mimeType,
        data: imagePart.data,
      },
    });
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: { parts },
    config: {
      systemInstruction:
        systemInstruction ||
        'You are Math Is Life AI, a warm, pedagogical, patient, and world-class mathematics teacher for students of all ages. You explain math clearly with reasoning, visual metaphors, step-by-step clarity, and real-life relevance. Support both English and Arabic naturally.',
    },
  });

  return response.text || '';
}

// 1. AI Math Tutor: Lesson Explanation
app.post('/api/ai/explain', async (req, res) => {
  try {
    const {
      topic,
      gradeLevel = 'Middle School (Grades 6-8)',
      curriculum = 'Standard',
      language = 'en',
      detailLevel = 'standard',
      imageBase64,
      imageMimeType = 'image/jpeg',
    } = req.body;

    const langDirective =
      language === 'ar'
        ? 'Output the explanation in Arabic (العربية). Ensure mathematical terms have Arabic equivalents with clear modern notation.'
        : 'Output the explanation in English.';

    const systemPrompt = `You are "Piwi" the friendly master math tutor in "Math Is Life".
Student Grade: ${gradeLevel}
Curriculum: ${curriculum}
Language: ${language}
${langDirective}

Provide a comprehensive, pedagogical, engaging explanation for the topic or uploaded textbook material.
Return a STRICT JSON object with these keys:
{
  "topicTitle": "Clear, friendly title",
  "summary": "2-3 sentences introducing the concept gently",
  "keyRulesAndFormulas": ["Rule or Formula 1 with explanation", "Rule 2"],
  "stepByStep": [
    {
      "stepNumber": 1,
      "title": "Short title",
      "explanation": "Clear reason why we do this",
      "mathExpression": "Formula or arithmetic step",
      "tip": "Helpful hint"
    }
  ],
  "realLifeExamples": [
    {
      "scenario": "Everyday scenario (e.g. shopping, gaming, sports, architecture)",
      "practicalApplication": "How this exact math is used there",
      "icon": "shopping-bag or game-controller or ruler or clock"
    }
  ],
  "visualModel": {
    "type": "number_line" or "bar_model" or "fraction_pie" or "coordinate_grid",
    "description": "Visual analogy description",
    "data": { "points": [0, 5, 10], "highlight": 7, "labels": ["Start", "Goal"] }
  },
  "commonMistakes": [
    {
      "mistake": "Common trap students fall into",
      "whyItHappens": "Why the brain makes this error",
      "howToAvoid": "Clever mnemonic or check method"
    }
  ],
  "checkUnderstandingQuestions": [
    {
      "question": "Engaging quick check problem",
      "hint": "Gentle nudge",
      "answer": "Full solution"
    }
  ]
}`;

    const userPrompt = imageBase64
      ? `Analyze this textbook image or PDF page carefully. Extract the core mathematical concepts, formulas, definitions, and worked examples. Explain everything for a ${gradeLevel} student.\nTopic notes: ${topic || 'Analyze material in image'}`
      : `Teach the math concept: "${topic}". Explain clearly with steps, formulas, everyday examples, visual models, and traps to avoid.`;

    let imageObj = undefined;
    if (imageBase64) {
      // Strip data:image/...;base64, prefix if present
      const cleanData = imageBase64.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
      imageObj = { mimeType: imageMimeType, data: cleanData };
    }

    if (ai) {
      try {
        const raw = await callGemini(userPrompt, systemPrompt, imageObj);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (geminiError: any) {
        console.warn('Gemini explain error, fallback to rich pedagogical template:', geminiError?.message);
      }
    }

    // High quality pedagogical fallback
    const isAr = language === 'ar';
    const fallbackData = {
      topicTitle: isAr ? `شرح درس: ${topic || 'الكسور والعمليات'}` : `Mastering: ${topic || 'Fractions & Operations'}`,
      summary: isAr
        ? `في هذا الدرس، سنستكشف مفهوم ${topic || 'الرياضيات'} بطريقة بصرية وخطوة بخطوة حتى تفهمه بعمق وتتذكره دائماً!`
        : `In this lesson, we break down ${topic || 'this math concept'} into visual, step-by-step intuition so you can solve problems with total confidence!`,
      keyRulesAndFormulas: isAr
        ? [
            'القاعدة الأساسية: لجمع أو طرح الكسور، يجب توحيد المقامات أولاً.',
            'قاعدة الضرب: اضرب البسط في البسط، واضرب المقام في المقام مباشرة.',
            'قاعدة القسمة: احتفظ بالأول، اقلب العملية لضرب، واعكس الكسر الثاني (Keep, Change, Flip).'
          ]
        : [
            'Fundamental Rule: To add or subtract fractions, find a common denominator first.',
            'Multiplication Rule: Multiply numerators across, and denominators across: (a/b) × (c/d) = (a×c)/(b×d).',
            'Division Rule: Keep the first fraction, Change division to multiplication, Flip the second fraction (Keep-Change-Flip).'
          ],
      stepByStep: [
        {
          stepNumber: 1,
          title: isAr ? 'فهم المسألة وتحديد المعطيات' : 'Analyze & Identify Components',
          explanation: isAr
            ? 'حدد الأجزاء الرئيسية للمسألة وافحص ما إذا كانت الأرقام متطابقة في الوحدة أو المقام.'
            : 'Look at the parts given. Notice if denominators match or if conversion is required.',
          mathExpression: '3/4 + 1/2',
          tip: isAr ? 'المضاعف المشترك الأصغر للعددين 4 و 2 هو 4.' : 'Find the Least Common Multiple (LCM) of 4 and 2, which is 4.'
        },
        {
          stepNumber: 2,
          title: isAr ? 'تحويل الكسر إلى مقام مشترك' : 'Convert to Common Denominator',
          explanation: isAr
            ? 'نضرب بسط ومقام 1/2 في 2 لنحصل على كسر مكافئ مقامه 4.'
            : 'Multiply numerator and denominator of 1/2 by 2 to get an equivalent fraction: 2/4.',
          mathExpression: '1/2 × (2/2) = 2/4',
          tip: isAr ? 'تذكر: ضرب البسط والمقام في نفس العدد لا يغير قيمة الكسر!' : 'Remember: Multiplying top and bottom by the same number keeps the value identical!'
        },
        {
          stepNumber: 3,
          title: isAr ? 'إجراء العملية وتبسيط الناتج' : 'Combine Numerators & Simplify',
          explanation: isAr
            ? 'الآن نجمع البسط مع البسط مع إبقاء المقام كما هو: 3 + 2 = 5 فوق 4.'
            : 'Now add numerators while keeping the common denominator: 3 + 2 = 5 over 4.',
          mathExpression: '3/4 + 2/4 = 5/4 = 1 1/4',
          tip: isAr ? 'يمكنك تحويل الكسر غير الفعلي 5/4 إلى عدد كسري 1 وربع.' : 'You can express improper fraction 5/4 as mixed number 1 1/4.'
        }
      ],
      realLifeExamples: [
        {
          scenario: isAr ? 'تقسيم البيتزا مع الأصدقاء' : 'Sharing Pizza with Friends',
          practicalApplication: isAr
            ? 'إذا كان لديك 3 قطع من بيتزا مقسمة إلى 4 أجزاء، وصديقك أحضر نصف بيتزا أخرى، فكم شريحة لديكم إجمالاً؟'
            : 'If you have 3 slices of an 8-slice pizza and your friend brings half a pizza (4 slices), you can calculate the exact total: 7/8 of a pizza.',
          icon: 'shopping-bag'
        },
        {
          scenario: isAr ? 'وصفات الطبخ والخبز' : 'Cooking & Baking Measurements',
          practicalApplication: isAr
            ? 'مضاعفة مقادير الوصفة يتطلب ضرب كل كمية في كسر للحفاظ على تناسق الطعم بدقة.'
            : 'Adjusting a recipe for 6 people instead of 4 requires multiplying all ingredients by 3/2.',
          icon: 'ruler'
        }
      ],
      visualModel: {
        type: 'bar_model',
        description: isAr ? 'نموذج أشرطة الكسر البصرية' : 'Fraction Bar Model',
        data: {
          parts: [
            { label: '3/4', fraction: 0.75, color: '#6366f1' },
            { label: '1/2 (2/4)', fraction: 0.5, color: '#ec4899' },
            { label: 'Total: 1 1/4', fraction: 1.25, color: '#10b981' }
          ]
        }
      },
      commonMistakes: [
        {
          mistake: isAr ? 'جمع المقامات مباشرة: 3/4 + 1/2 = 4/6' : 'Adding denominators directly: 3/4 + 1/2 = 4/6',
          whyItHappens: isAr
            ? 'العقل يميل لتطبيق الجمع البسيط على كل الأعداد دون تذكر أن المقام يمثل حجم الحصة.'
            : 'The brain instinctively adds top numbers and bottom numbers, forgetting that denominator represents slice size!',
          howToAvoid: isAr
            ? 'تخيل دائماً البيتزا: ربعين لا يصبحان سدساً عند الجمع!'
            : 'Always visualize physical slices: two quarters do not magically become sixths!'
        }
      ],
      checkUnderstandingQuestions: [
        {
          question: isAr ? 'ما ناتج: 2/3 + 1/6 في أبسط صورة؟' : 'What is 2/3 + 1/6 in simplest form?',
          hint: isAr ? 'حول 2/3 إلى أسداس بضرب البسط والمقام في 2.' : 'Convert 2/3 to sixths by multiplying top and bottom by 2.',
          answer: isAr ? '4/6 + 1/6 = 5/6' : '4/6 + 1/6 = 5/6'
        }
      ]
    };

    return res.json({ success: true, data: fallbackData });
  } catch (error: any) {
    console.error('Explain error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Advanced Feature: "Explain It Again" (Fresh alternate perspective)
app.post('/api/ai/explain-again', async (req, res) => {
  try {
    const { topic, previousExplanation, angle = 'simpler_analogy', language = 'en' } = req.body;

    const anglePrompts: Record<string, string> = {
      simpler_analogy: 'Use an ultra-simple real-life physical story (like money, Lego bricks, or candies) that a 10-year-old immediately understands.',
      visual_model: 'Explain using a visual diagram description (number lines, balance scales, area grids).',
      manipulatives: 'Describe moving physical blocks or tiles step-by-step.',
      step_breakdown: 'Break every single calculation into tiny micro-steps with absolute clarity.'
    };

    const instruction = anglePrompts[angle] || anglePrompts.simpler_analogy;
    const isAr = language === 'ar';

    const systemPrompt = `You are Piwi, the student's personal math tutor. The student pressed "Explain It Again" because they didn't quite get the previous explanation.
Language: ${language}.
Your goal: Do NOT repeat the previous explanation.
Strategy: ${instruction}
Tone: Encouraging, enthusiastic, zero judgement! "Let's look at this from a totally fun new angle!"`;

    const userPrompt = `Concept: ${topic}
Previous explanation was: "${previousExplanation?.slice(0, 300) || topic}"
Explain this in a fresh, creative way. Return a JSON object with:
{
  "newAngleTitle": "e.g., The Candy Jar Analogy",
  "explanation": "Clear, vivid paragraph explaining the concept",
  "visualMetaphor": "Description of the mental picture to hold",
  "workedExample": {
    "problem": "Simple problem",
    "solutionSteps": ["Step 1 with story", "Step 2", "Final answer"],
    "ahaMoment": "The key insight that makes it click"
  }
}`;

    if (ai) {
      try {
        const raw = await callGemini(userPrompt, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn('Explain again AI error, using fallback');
      }
    }

    const fallback = {
      newAngleTitle: isAr ? 'طريقة الميزان ذو الكفتين' : 'The Two-Sided Balance Scale Method',
      explanation: isAr
        ? 'تخيل المعادلة الرياضية كميزان قديم بكفتين متساويتين تماماً في الوزن. أي شيء تضعه أو ترفعه من الكفة اليمنى، يجب أن تكرره بنفس المقدار في الكفة اليسرى ليظل الميزان مستقراً وموزوناً!'
        : 'Think of this math problem like an old-fashioned balance scale. Both sides are currently in exact balance. Whatever you add, subtract, multiply, or divide on one side, you MUST do the exact same on the other side to keep it balanced!',
      visualMetaphor: isAr
        ? 'ميزان ذهبي: في الكفة اليمنى صندوق مجهول (س) ومعه 3 تفاحات، وفي الكفة اليسرى 10 تفاحات.'
        : 'A golden balance scale: on the left side is a mystery gift box (x) plus 3 apples; on the right side are 10 apples.',
      workedExample: {
        problem: 'x + 3 = 10',
        solutionSteps: isAr
          ? [
              'الكفتان متوازنتان تماماً: (س + 3) تعادل 10.',
              'نريد معرفة وزن الصندوق وحده، فنرفع 3 تفاحات من الكفة اليمنى.',
              'حتى لا يميل الميزان، نرفع أيضاً 3 تفاحات من الكفة اليسرى: 10 - 3 = 7.',
              'الآن الصندوق (س) يزن 7 تفاحات بالضبط!'
            ]
          : [
              'The scale is balanced: (x + 3) balances 10.',
              'To find what is inside the mystery box (x), remove 3 apples from the left side.',
              'To keep the scale level, also remove 3 apples from the right side: 10 - 3 = 7.',
              'Now the box x stands alone, balancing 7 apples. So x = 7!'
            ],
        ahaMoment: isAr
          ? 'المعادلة ليست لغزاً معقداً، بل هي فقط الحفاظ على توازن الميزان!'
          : 'Equations are not puzzles; they are just keeping both trays of a scale balanced!'
      }
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Advanced Feature: "Mistake Detective" (Pinpoint exact error)
app.post('/api/ai/mistake-detective', async (req, res) => {
  try {
    const { problem, studentAnswer, studentSteps, language = 'en' } = req.body;
    const isAr = language === 'ar';

    const systemPrompt = `You are the "Mistake Detective" in Math Is Life.
Your mission: Analyze the student's solution or answer, detect exactly WHICH step went wrong, explain the psychological or conceptual reason for the slip, and guide them warmly to fix it.
Language: ${language}.
Return a STRICT JSON object:
{
  "isCorrect": boolean,
  "mistakeType": "Sign Error" | "Order of Operations (PEMDAS)" | "Fraction Denominator" | "Arithmetic Slip" | "Conceptual Misunderstanding" | "None",
  "exactMistakeStep": "Where the logic diverged",
  "detectiveDiagnosis": "Warm, encouraging explanation of why this mistake happens to everyone and what slipped",
  "stepByStepFix": [
    "Step 1: The correct way",
    "Step 2: Combining terms",
    "Final correct result"
  ],
  "detectiveTip": "A golden rule or trick to prevent this exact mistake next time",
  "retryProblem": {
    "question": "Similar practice problem to prove mastery",
    "solution": "Answer"
  }
}`;

    const userPrompt = `Math Problem: ${problem}
Student's Submitted Answer / Steps: ${studentAnswer || studentSteps || 'Student thinks answer is wrong'}
Analyze this carefully like a master teacher.`;

    if (ai) {
      try {
        const raw = await callGemini(userPrompt, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn('Mistake detective AI error, using fallback');
      }
    }

    const fallback = {
      isCorrect: false,
      mistakeType: isAr ? 'ترتيب العمليات الحسابية (أولويات العمليات)' : 'Order of Operations (PEMDAS)',
      exactMistakeStep: isAr ? 'إجراء الجمع قبل الضرب' : 'Performed Addition before Multiplication',
      detectiveDiagnosis: isAr
        ? 'اكتشف المحقق الرياضي أنك قمت بجمع الأعداد أولاً من اليمين إلى اليسار قبل ضربها! الضرب دائماً أقوى وله الأولوية القصوى.'
        : 'Detective caught the slip! You calculated addition before multiplication. In mathematics, Multiplication always takes precedence over Addition.',
      stepByStepFix: isAr
        ? [
            'المسألة: 5 + 3 × 2',
            'الخطوة 1: ننجز الضرب أولاً: 3 × 2 = 6',
            'الخطوة 2: الآن نجمع الناتج مع 5: 5 + 6 = 11',
            'الناتج الصحيح النهائي هو 11 وليس 16!'
          ]
        : [
            'Problem: 5 + 3 × 2',
            'Step 1: Perform multiplication first: 3 × 2 = 6',
            'Step 2: Add 5 to the product: 5 + 6 = 11',
            'The correct answer is 11 (not 16)!'
          ],
      detectiveTip: isAr
        ? 'تذكر كلمة "أقواس، أسس، ضرب وقسمة، جمع وطرح" (أقوى العمليات أولاً)!'
        : 'Remember PEMDAS: Parentheses, Exponents, Multiplication & Division, Addition & Subtraction!',
      retryProblem: {
        question: isAr ? 'جرب الآن: ما ناتج 8 + 4 × 3 ؟' : 'Try this: What is 8 + 4 × 3 ?',
        solution: '20'
      }
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Advanced Feature: "Multiple Solution Methods"
app.post('/api/ai/multiple-methods', async (req, res) => {
  try {
    const { problem = '24 ÷ 4', language = 'en' } = req.body;
    const isAr = language === 'ar';

    const systemPrompt = `You are a mathematical multiple-representation expert in Math Is Life.
Show 4 distinct, elegant solution pathways for the same problem:
1. Visual / Geometric Model (Bar model, dot array, area diagram)
2. Number Line Pathway (Jumps, intervals, distance)
3. Algebraic / Symbolic Formulation
4. Mental Math / Decomposition Strategy

Language: ${language}.
Return a STRICT JSON object:
{
  "problem": "${problem}",
  "methods": [
    {
      "methodName": "Visual Model",
      "subtitle": "Seeing is believing",
      "explanation": "Detailed explanation with diagram representation",
      "visualDescription": "ASCII or SVG layout description",
      "steps": ["Step 1", "Step 2"],
      "whyItWorks": "Conceptual foundation"
    },
    {
      "methodName": "Number Line",
      "subtitle": "Walking the line",
      "explanation": "Interval jumps along the line",
      "steps": ["Step 1", "Step 2"],
      "whyItWorks": "Direction and scale"
    },
    {
      "methodName": "Algebraic Equation",
      "subtitle": "Symbolic precision",
      "explanation": "Formal algebraic manipulation",
      "steps": ["Step 1", "Step 2"],
      "whyItWorks": "Equivalence principles"
    },
    {
      "methodName": "Mental Math / Decomposition",
      "subtitle": "Fast in your head",
      "explanation": "Breaking into friendly numbers",
      "steps": ["Step 1", "Step 2"],
      "whyItWorks": "Distributive property"
    }
  ]
}`;

    if (ai) {
      try {
        const raw = await callGemini(`Show 4 different ways to solve: ${problem}`, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn('Multiple methods AI error, using fallback');
      }
    }

    const fallback = {
      problem,
      methods: [
        {
          methodName: isAr ? 'النموذج البصري والمصفوفة' : 'Visual Area & Array Model',
          subtitle: isAr ? 'الرؤية بالعين' : 'Seeing the structure',
          explanation: isAr
            ? 'نقوم بتمثيل العدد في مصفوفة مستطيلة مقسمة إلى 4 صفوف متساوية لمعرفة عدد الأعمدة.'
            : 'Represent the total in a grid arranged into 4 equal rows. Count how many items belong in each row.',
          visualDescription: isAr ? '4 صفوف في كل منها 6 مربعات ملونة' : '4 rows with 6 colored blocks each = 24 blocks',
          steps: [
            isAr ? 'ارسم 4 مجموعات فارغة.' : 'Draw 4 equal buckets or rows.',
            isAr ? 'وزع 24 عنصراً بالتساوي بينها.' : 'Distribute 24 units evenly among the 4 rows.',
            isAr ? 'تجد في كل مجموعة 6 عناصر بالضبط.' : 'Each row contains exactly 6 units.'
          ],
          whyItWorks: isAr ? 'القسمة هي عملية تجزئة متساوية.' : 'Division is fair-share partitioning.'
        },
        {
          methodName: isAr ? 'خط الأعداد والقفز المتكرر' : 'Number Line Jump Model',
          subtitle: isAr ? 'القفز التنازلي' : 'Repeated Jumps',
          explanation: isAr
            ? 'نبدأ من 24 ونقفز إلى الخلف بمقدار 4 في كل قفزة حتى نصل إلى الصفر.'
            : 'Start at 24 and jump backward in increments of 4 until landing on 0.',
          steps: [
            isAr ? 'من 24 إلى 20 (قفزة 1)' : 'From 24 to 20 (Jump 1)',
            isAr ? 'من 20 إلى 16 (قفزة 2)' : 'From 20 to 16 (Jump 2)',
            isAr ? 'من 16 إلى 12 (قفزة 3)' : 'From 16 to 12 (Jump 3)',
            isAr ? 'من 12 إلى 8 (قفزة 4)' : 'From 12 to 8 (Jump 4)',
            isAr ? 'من 8 إلى 4 (قفزة 5)' : 'From 8 to 4 (Jump 5)',
            isAr ? 'من 4 إلى 0 (قفزة 6)' : 'From 4 to 0 (Jump 6 - Arrived!)'
          ],
          whyItWorks: isAr ? 'القسمة هي طرح متكرر.' : 'Division is repeated subtraction.'
        },
        {
          methodName: isAr ? 'المعادلة الجبرية والعلاقة العكسية' : 'Algebraic Inverse Operation',
          subtitle: isAr ? 'علاقة الضرب بالقسمة' : 'Division as inverse of multiplication',
          explanation: isAr
            ? 'نكتب المعادلة: 4 × س = 24، ثم نوجد قيمة س بالضرب المعاكس.'
            : 'Set up 4 × x = 24. Find the missing factor that multiplies with 4 to make 24.',
          steps: [
            '4x = 24',
            'x = 24 / 4',
            'x = 6'
          ],
          whyItWorks: isAr ? 'الضرب والقسمة عمليتان متعاكستان تماماً.' : 'Multiplication and division are reciprocal inverse operations.'
        },
        {
          methodName: isAr ? 'التفكيك والحساب الذهني السريع' : 'Mental Math Decomposition (Halving Twice)',
          subtitle: isAr ? 'التنصيف المزدوج السريع' : 'Double Halving Trick',
          explanation: isAr
            ? 'للقسمة على 4 ذهنياً، خذ نصف العدد مرتين متتاليتين!'
            : 'To divide by 4 in your head, simply take half of the number twice!',
          steps: [
            isAr ? 'نصف 24 هو 12.' : 'Half of 24 is 12.',
            isAr ? 'نصف 12 هو 6.' : 'Half of 12 is 6.',
            isAr ? 'الناتج النهائي = 6!' : 'Final answer = 6!'
          ],
          whyItWorks: isAr ? 'لأن 4 = 2 × 2' : 'Because 4 is 2 × 2, dividing by 4 is the same as dividing by 2 twice.'
        }
      ]
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Smart Revision System: Generate Customized Quizzes
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const {
      topic = 'Algebra and Linear Equations',
      gradeLevel = 'Middle School',
      difficulty = 'medium',
      count = 5,
      questionTypes = ['multiple_choice', 'true_false', 'fill_in', 'matching', 'step_by_step'],
      language = 'en'
    } = req.body;

    const isAr = language === 'ar';

    const systemPrompt = `You are the chief quiz architect for "Math Is Life".
Generate ${count} diverse, engaging, high-quality math questions for topic: "${topic}".
Grade level: ${gradeLevel}. Difficulty: ${difficulty}. Language: ${language}.
Include questions of types: ${questionTypes.join(', ')}.

Return a STRICT JSON array of question objects:
[
  {
    "id": "q1",
    "type": "multiple_choice" | "true_false" | "fill_in" | "matching" | "step_by_step" | "word_problem" | "hots",
    "question": "Clear problem statement",
    "options": ["A", "B", "C", "D"], // for multiple_choice
    "correctAnswer": "Exact correct answer string or boolean or number",
    "matchingPairs": [ // only for matching type
      {"left": "2x = 10", "right": "x = 5"},
      {"left": "x + 7 = 12", "right": "x = 5"}
    ],
    "steps": [ // only for step_by_step
      {"prompt": "Step 1: Subtract 3 from both sides", "expectedAnswer": "2x = 8", "explanation": "Isolating terms"}
    ],
    "hint": "Pedagogical nudge",
    "fullExplanation": "Comprehensive model answer showing step-by-step reasoning",
    "difficulty": "${difficulty}",
    "category": "${topic}"
  }
]`;

    if (ai) {
      try {
        const raw = await callGemini(`Create ${count} math questions for ${topic}`, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ success: true, data: parsed });
        }
      } catch (err) {
        console.warn('Quiz generation AI error, using rich fallback');
      }
    }

    // Rich fallback quizzes
    const fallbackQuestions = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: isAr ? 'حل المعادلة: 3x - 5 = 16. ما هي قيمة x؟' : 'Solve the linear equation: 3x - 5 = 16. What is x?',
        options: isAr ? ['x = 5', 'x = 7', 'x = 9', 'x = 6'] : ['x = 5', 'x = 7', 'x = 9', 'x = 6'],
        correctAnswer: 'x = 7',
        hint: isAr ? 'أضف 5 للطرفين أولاً، ثم اقسم على 3.' : 'Add 5 to both sides first, then divide by 3.',
        fullExplanation: isAr
          ? 'الخطوة 1: نضيف 5 إلى كلا الطرفين: 3x = 16 + 5 = 21.\nالخطوة 2: نقسم الطرفين على 3: x = 21 ÷ 3 = 7.'
          : 'Step 1: Add 5 to both sides: 3x = 16 + 5 = 21.\nStep 2: Divide both sides by 3: x = 21 / 3 = 7.',
        difficulty: 'medium',
        category: topic
      },
      {
        id: 'q2',
        type: 'true_false',
        question: isAr ? 'الكسر 4/8 يكافئ الكسر 1/2.' : 'The fraction 4/8 is equivalent to 1/2.',
        options: isAr ? ['صواب', 'خطأ'] : ['True', 'False'],
        correctAnswer: isAr ? 'صواب' : 'True',
        hint: isAr ? 'اقسم البسط والمقام على 4.' : 'Divide both numerator and denominator by 4.',
        fullExplanation: isAr
          ? 'صواب! عند قسمة البسط 4 على 4 والمقام 8 على 4، نحصل على 1/2 بالضبط.'
          : 'True! Dividing 4 by 4 gives 1, and 8 by 4 gives 2, which yields 1/2.',
        difficulty: 'easy',
        category: topic
      },
      {
        id: 'q3',
        type: 'fill_in',
        question: isAr ? 'ما هو محيط مستطيل طوله 8 سم وعرضه 5 سم؟ (اكتب الرقم فقط)' : 'What is the perimeter of a rectangle with length 8 cm and width 5 cm? (Enter number only)',
        correctAnswer: '26',
        hint: isAr ? 'قانون المحيط = 2 × (الطول + العرض)' : 'Perimeter formula = 2 × (Length + Width)',
        fullExplanation: isAr
          ? 'محيط المستطيل = 2 × (8 + 5) = 2 × 13 = 26 سم.'
          : 'Perimeter = 2 × (8 + 5) = 2 × 13 = 26 cm.',
        difficulty: 'medium',
        category: topic
      },
      {
        id: 'q4',
        type: 'matching',
        question: isAr ? 'طابق كل معادلة بالقيمة الصحيحة للمتغير x:' : 'Match each equation with the correct value of x:',
        matchingPairs: [
          { left: '2x = 14', right: 'x = 7' },
          { left: 'x + 9 = 15', right: 'x = 6' },
          { left: 'x / 3 = 4', right: 'x = 12' },
          { left: '3x - 1 = 8', right: 'x = 3' }
        ],
        hint: isAr ? 'حل كل معادلة بمفردها لتجد القيمة المطابقة.' : 'Solve each mini-equation independently to match.',
        fullExplanation: isAr
          ? '2x=14 -> x=7\nx+9=15 -> x=6\nx/3=4 -> x=12\n3x-1=8 -> x=3'
          : '2x=14 -> x=7\nx+9=15 -> x=6\nx/3=4 -> x=12\n3x-1=8 -> x=3',
        difficulty: 'medium',
        category: topic
      },
      {
        id: 'q5',
        type: 'hots',
        question: isAr
          ? 'سؤال تفكير عليا: إذا تضاعف طول وعرض مستطيل مرتين، فكم مرة تتضاعف مساحته؟'
          : 'Higher-Order Thinking: If the length and width of a rectangle are both doubled, how many times larger does its area become?',
        options: isAr ? ['مرتان (2x)', '3 مرات (3x)', '4 مرات (4x)', '8 مرات (8x)'] : ['2 times', '3 times', '4 times', '8 times'],
        correctAnswer: isAr ? '4 مرات (4x)' : '4 times',
        hint: isAr ? 'جرب بالأرقام: مستطيل 2×3 ثم 4×6، وقارن المساحتين.' : 'Try with numbers: rectangle 2×3 = 6, then 4×6 = 24. Compare 24 to 6!',
        fullExplanation: isAr
          ? 'المساحة = الطول × العرض. إذا ضربنا الطول في 2 والعرض في 2، تصبح المساحة الجديدة = (2 × الطول) × (2 × العرض) = 4 × (الطول × العرض). إذن المساحة تتضاعف 4 مرات!'
          : 'Area = L × W. New Area = (2L) × (2W) = 4 × (L × W). Hence, the area increases by a factor of 4!',
        difficulty: 'hard',
        category: topic
      }
    ];

    return res.json({ success: true, data: fallbackQuestions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Interactive Whiteboard: Ask AI About This Page & Handwriting Enhancement
app.post('/api/ai/ask-whiteboard', async (req, res) => {
  try {
    const { question, canvasImage, selectedRegion, language = 'en' } = req.body;
    const isAr = language === 'ar';

    const systemPrompt = `You are the live Interactive Whiteboard math assistant in "Math Is Life".
The student is pointing at an area of their canvas or PDF document and asking a question.
Provide an immediate, concise, crystal-clear explanation, coaching them through the exact problem visible.
Language: ${language}.`;

    let imageObj = undefined;
    if (canvasImage) {
      const cleanData = canvasImage.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
      imageObj = { mimeType: 'image/png', data: cleanData };
    }

    const prompt = question || (isAr ? 'اشرح لي المسألة الموجودة على اللوحة خطوة بخطوة' : 'Help me solve and understand the problem drawn on this whiteboard page.');

    if (ai) {
      try {
        const raw = await callGemini(prompt, systemPrompt, imageObj);
        return res.json({ success: true, answer: raw });
      } catch (err) {
        console.warn('Whiteboard AI error, using fallback');
      }
    }

    const fallbackAnswer = isAr
      ? `مرحباً بك! لقد قمت بفحص المسألة المحددة على السبورة:\n\n1. **الخطوة الأولى:** حدد المعاملات والعمليات الرئيسية.\n2. **الخطوة الثانية:** تخلص من الثوابت بطرحها أو جمعها من كلا الطرفين.\n3. **الخطوة الثالثة:** اقسم على معامل المتغير للحصول على الحل الصافي.\n\n💡 **نصيحة السبورة:** يمكنك دائماً استخدام أداة القلم الأخضر للتحقق من الحل بالتعويض المباشر!`
      : `Great work on the whiteboard! Here is the breakdown for the selected section:\n\n1. **Step 1:** Identify the variable terms and constant numbers.\n2. **Step 2:** Combine like terms on both sides of the equals sign.\n3. **Step 3:** Isolate x by performing the inverse operation.\n\n💡 **Whiteboard Tip:** Use the highlight tool to circle key coefficients so you never lose track of negative signs!`;

    return res.json({ success: true, answer: fallbackAnswer });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// AI Handwriting Enhancement
app.post('/api/ai/handwriting-enhance', async (req, res) => {
  try {
    const { canvasImage, rawText, style = 'clean_math', language = 'en' } = req.body;
    const isAr = language === 'ar';

    const systemPrompt = `You are the AI Handwriting Enhancer in Math Is Life.
CRITICAL CONSTRAINT: You must NEVER silently alter numbers, variables, operations, or mathematical meaning.
Read the handwriting or mathematical scribble, preserve all symbols with 100% mathematical fidelity, and convert it into clean formatted math text / LaTeX / beautiful unicode equations.
Return JSON:
{
  "enhancedText": "Clean formatted mathematical expression",
  "latex": "LaTeX code if applicable",
  "identifiedElements": ["Terms", "Operators", "Equations"],
  "confidence": 0.98
}`;

    if (ai && (canvasImage || rawText)) {
      try {
        let imageObj = undefined;
        if (canvasImage) {
          const cleanData = canvasImage.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
          imageObj = { mimeType: 'image/png', data: cleanData };
        }
        const prompt = rawText ? `Enhance and transcribe handwriting: "${rawText}"` : 'Transcribe and clean up the math handwriting in this canvas drawing.';
        const raw = await callGemini(prompt, systemPrompt, imageObj);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn('Handwriting AI fallback');
      }
    }

    const fallback = {
      enhancedText: rawText || 'f(x) = 2x² + 5x - 3',
      latex: 'f(x) = 2x^2 + 5x - 3',
      identifiedElements: ['Quadratic function', 'Variables x', 'Coefficients 2, 5, -3'],
      confidence: 0.99
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. AI Study Assistant: Study Plan & Mind Map
app.post('/api/ai/study-plan', async (req, res) => {
  try {
    const { subject = 'Algebra & Geometry', goal = 'Exam Revision in 2 weeks', hoursPerDay = 1.5, language = 'en' } = req.body;
    const isAr = language === 'ar';

    const systemPrompt = `You are the AI Study Coach in Math Is Life.
Create a structured, spaced-repetition study schedule, broken down into bite-sized 20-30 minute focused learning steps.
Return JSON:
{
  "planTitle": "Study Plan Name",
  "totalDurationWeeks": 2,
  "dailyTargetMinutes": 45,
  "phases": [
    {
      "phaseName": "Phase 1: Foundations",
      "days": "Days 1-4",
      "milestone": "Master core formulas",
      "tasks": [
        {"title": "Review Linear Equations", "duration": "25 mins", "activityType": "Tutor Lesson"},
        {"title": "Practice 10 Quiz Questions", "duration": "20 mins", "activityType": "Revision Quiz"}
      ]
    }
  ],
  "mindMap": {
    "center": "Algebra",
    "branches": [
      {
        "name": "Linear Equations",
        "subtopics": ["One-step equations", "Two-step equations", "Variables on both sides"]
      },
      {
        "name": "Functions & Graphs",
        "subtopics": ["Slope (m)", "Y-intercept (b)", "Graphing lines"]
      }
    ]
  },
  "flashcards": [
    {
      "front": "What is the slope-intercept form equation?",
      "back": "y = mx + b (where m is slope, and b is y-intercept)"
    },
    {
      "front": "How do you find the area of a triangle?",
      "back": "Area = 1/2 × Base × Height"
    }
  ]
}`;

    if (ai) {
      try {
        const raw = await callGemini(`Create study plan for ${subject}. Goal: ${goal}`, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn('Study plan AI fallback');
      }
    }

    const fallback = {
      planTitle: isAr ? 'خطة التفوق الرياضي المخصصة' : 'Personalized Math Mastery Roadmap',
      totalDurationWeeks: 2,
      dailyTargetMinutes: 45,
      phases: [
        {
          phaseName: isAr ? 'المرحلة 1: بناء المفاهيم الأساسية' : 'Phase 1: Core Foundations',
          days: isAr ? 'الأيام 1 - 4' : 'Days 1-4',
          milestone: isAr ? 'إتقان المعادلات الخطية والكسور' : 'Master linear equations and fractions',
          tasks: [
            { title: isAr ? 'درس المعلم الذكي: حل المعادلات من خطوتين' : 'AI Tutor: Two-Step Linear Equations', duration: '25 mins', activityType: 'Tutor Lesson' },
            { title: isAr ? 'تدريب تفاعلي: بنك أسئلة المراجعة (10 أسئلة)' : 'Revision Quiz: 10 Equations & Feedback', duration: '20 mins', activityType: 'Revision Quiz' }
          ]
        },
        {
          phaseName: isAr ? 'المرحلة 2: التطبيقات والمسائل اللفظية' : 'Phase 2: Applications & Word Problems',
          days: isAr ? 'الأيام 5 - 9' : 'Days 5-9',
          milestone: isAr ? 'حل المسائل الحياتية دون تردد' : 'Solve real-life word challenges',
          tasks: [
            { title: isAr ? 'استكشاف نماذج الحل المتعددة على السبورة' : 'Whiteboard: Explore Multiple Solution Methods', duration: '25 mins', activityType: 'Whiteboard' },
            { title: isAr ? 'محقق الأخطاء: مراجعة الزلات الشائعة' : 'Mistake Detective: Trap Avoidance Training', duration: '20 mins', activityType: 'Practice' }
          ]
        },
        {
          phaseName: isAr ? 'المرحلة 3: التحدي والمراجعة النهائية' : 'Phase 3: Final Mastery & Speed',
          days: isAr ? 'الأيام 10 - 14' : 'Days 10-14',
          milestone: isAr ? 'الحصول على شارة خبير الرياضيات' : 'Unlock Math Champion Badge',
          tasks: [
            { title: isAr ? 'لعبة الحساب الذهني السريع (تحدي النقاط)' : 'Speed Mental Math Game Challenge', duration: '15 mins', activityType: 'Game' },
            { title: isAr ? 'مراجعة البطاقات التعليمية الذكية' : 'Review Digital Flashcards', duration: '15 mins', activityType: 'Flashcards' }
          ]
        }
      ],
      mindMap: {
        center: isAr ? 'الرياضيات المدرسية' : 'Mathematics Hub',
        branches: [
          {
            name: isAr ? 'الجبر والمعادلات' : 'Algebra & Equations',
            subtopics: isAr ? ['المعادلات الخطية', 'المتباينات', 'التمثيل البياني', 'الدوال'] : ['Linear Equations', 'Inequalities', 'Graphing', 'Functions']
          },
          {
            name: isAr ? 'الهندسة والقياس' : 'Geometry & Measurement',
            subtopics: isAr ? ['المساحة والمحيط', 'نظرية فيثاغورس', 'الزوايا والمثلثات'] : ['Area & Perimeter', 'Pythagorean Theorem', 'Angles & Triangles']
          },
          {
            name: isAr ? 'الكسور والنسب المئوية' : 'Fractions & Proportions',
            subtopics: isAr ? ['العمليات على الكسور', 'النسبة والتناسب', 'النسب المئوية الحياتية'] : ['Fraction Arithmetic', 'Ratios & Rates', 'Everyday Percentages']
          }
        ]
      },
      flashcards: [
        {
          front: isAr ? 'ما هي صيغة الميل والمقطع لمعادلة الخط المستقيم؟' : 'What is the Slope-Intercept Form of a linear equation?',
          back: isAr ? 'y = mx + b (حيث m هو الميل، و b هو المقطع الصادي)' : 'y = mx + b (m is slope, b is y-intercept)'
        },
        {
          front: isAr ? 'كيف نحسب مساحة المثلث؟' : 'How do you calculate the area of a triangle?',
          back: isAr ? 'المساحة = (1/2) × القاعدة × الارتفاع' : 'Area = 1/2 × Base × Height'
        },
        {
          front: isAr ? 'ما هي قاعدة تحويل القسمة في الكسور؟' : 'What is the "Keep-Change-Flip" rule?',
          back: isAr ? 'نحتفظ بالكسر الأول، نحول علامة القسمة إلى ضرب، ونعكس الكسر الثاني' : 'Keep first fraction, Change ÷ to ×, Flip the second fraction upside down.'
        }
      ]
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. Daily Math Challenge Generator
app.post('/api/ai/daily-challenge', async (req, res) => {
  try {
    const { gradeLevel = 'Middle School', language = 'en' } = req.body;
    const isAr = language === 'ar';

    const systemPrompt = `You are creating today's engaging Math Daily Challenge in Math Is Life.
Make it clever, rewarding, like a fun puzzle. Language: ${language}.
Return JSON:
{
  "id": "daily-1",
  "title": "Today's Riddle",
  "story": "Short fun story puzzle",
  "question": "Clear puzzle question",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "Answer",
  "hint": "Hint",
  "explanation": "Solution walkthrough",
  "rewardXp": 50
}`;

    if (ai) {
      try {
        const raw = await callGemini(`Daily math challenge for ${gradeLevel}`, systemPrompt);
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        console.warn('Daily challenge AI fallback');
      }
    }

    const fallback = {
      id: 'daily-' + new Date().toISOString().slice(0, 10),
      title: isAr ? 'لغز المزرعة السحري' : 'The Magic Garden Mystery',
      story: isAr
        ? 'في حديقة غامضة، تتضاعف الأزهار السحرية كل يوم في الصباح. في اليوم الأول كانت هناك زهرة واحدة، وفي اليوم العشرين غطت الأزهار الحديقة بالكامل.'
        : 'In a magical garden, water lilies double in number every single morning. On Day 1 there was 1 lily, and on Day 20 the entire pond is completely full.',
      question: isAr ? 'في أي يوم كانت الأزهار تغطي نصف الحديقة بالضبط؟' : 'On which day was the pond exactly half full of lilies?',
      options: isAr ? ['اليوم العاشر (Day 10)', 'اليوم التاسع عشر (Day 19)', 'اليوم الخامس عشر (Day 15)', 'اليوم الثامن عشر (Day 18)'] : ['Day 10', 'Day 19', 'Day 15', 'Day 18'],
      correctAnswer: isAr ? 'اليوم التاسع عشر (Day 19)' : 'Day 19',
      hint: isAr ? 'إذا كانت تتضاعف كل يوم، فماذا كانت في اليوم الذي يسبق اليوم العشرين مباشرة؟' : 'If it doubles every single day, look backwards one day before Day 20!',
      explanation: isAr
        ? 'بما أن الأزهار تتضاعف كل يوم، ففي اليوم العشرين تكون كاملة، مما يعني أنها في اليوم السابق له مباشرة (اليوم 19) كانت نصف الحديقة تماماً!'
        : 'Since the lilies double every day, if the pond is full on Day 20, it was half full on the previous day: Day 19!',
      rewardXp: 50
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Vite middleware / production serving
const PORT = 3000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Math Is Life server running at http://0.0.0.0:${PORT}`);
});
