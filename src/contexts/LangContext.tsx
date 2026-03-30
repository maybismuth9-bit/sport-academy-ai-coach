import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "he";

interface Translations {
  [key: string]: { en: string; he: string };
}

const translations: Translations = {
  // Nav
  "nav.home": { en: "Home", he: "בית" },
  "nav.assessment": { en: "Assessment", he: "הערכה" },
  "nav.workout": { en: "Workout", he: "אימון" },
  "nav.nutrition": { en: "Nutrition", he: "תזונה" },

  // Home
  "home.title": { en: "SPORT ACADEMY", he: "SPORT ACADEMY" },
  "home.subtitle": { en: "Your daily fitness & nutrition feed", he: "הפיד היומי שלך לכושר ותזונה" },
  "home.latest": { en: "Latest Articles", he: "מאמרים אחרונים" },
  "home.article1.title": { en: "5 Compound Movements That Build Real Strength", he: "5 תרגילים מורכבים שבונים כוח אמיתי" },
  "home.article1.summary": { en: "Master the deadlift, squat, bench press, overhead press and barbell row for maximum muscle activation.", he: "שלטו בדדליפט, סקוואט, לחיצת חזה, לחיצת כתפיים ושורה עם מוט למקסימום הפעלת שרירים." },
  "home.article1.category": { en: "Training", he: "אימון" },
  "home.article2.title": { en: "Meal Prep Like a Pro: Weekly Nutrition Guide", he: "הכנת ארוחות כמו מקצוען: מדריך תזונה שבועי" },
  "home.article2.summary": { en: "Save time and stay on track with these simple high-protein meal prep strategies for busy athletes.", he: "חסכו זמן והישארו במסלול עם אסטרטגיות הכנת ארוחות עשירות בחלבון לספורטאים עסוקים." },
  "home.article2.category": { en: "Nutrition", he: "תזונה" },
  "home.article3.title": { en: "Recovery Science: Why Rest Days Matter", he: "מדע ההתאוששות: למה ימי מנוחה חשובים" },
  "home.article3.summary": { en: "Understanding muscle recovery, sleep optimization and active rest for better performance gains.", he: "הבנת התאוששות שרירים, אופטימיזציית שינה ומנוחה פעילה לשיפור ביצועים." },
  "home.article3.category": { en: "Recovery", he: "התאוששות" },

  // Assessment
  "assess.title": { en: "ASSESSMENT", he: "הערכה" },
  "assess.step": { en: "Step", he: "שלב" },
  "assess.of": { en: "of", he: "מתוך" },
  "assess.age": { en: "How old are you?", he: "בן/בת כמה את/ה?" },
  "assess.weight": { en: "What's your weight?", he: "מה המשקל שלך?" },
  "assess.height": { en: "What's your height?", he: "מה הגובה שלך?" },
  "assess.bodyFat": { en: "Body fat percentage?", he: "אחוז שומן גוף?" },
  "assess.goal": { en: "What's your training goal?", he: "מה מטרת האימון שלך?" },
  "assess.goalMuscle": { en: "Muscle Mass", he: "מסת שריר" },
  "assess.goalLoss": { en: "Weight Loss", he: "ירידה במשקל" },
  "assess.injuries": { en: "Any physical injuries?", he: "יש פציעות גופניות?" },
  "assess.injuriesPlaceholder": { en: "e.g. Lower back pain, knee issues (optional)", he: "לדוגמה: כאבי גב תחתון, בעיות ברכיים (אופציונלי)" },
  "assess.complete": { en: "Complete", he: "סיום" },
  "assess.next": { en: "Next", he: "הבא" },
  "assess.back": { en: "Back", he: "חזרה" },
  "assess.done.title": { en: "Assessment Complete", he: "ההערכה הושלמה" },
  "assess.done.desc": { en: "Your personalized plan is ready. Check the Nutrition tab!", he: "התוכנית האישית שלך מוכנה. בדקו בלשונית תזונה!" },
  "assess.years": { en: "years", he: "שנים" },
  "assess.kg": { en: "kg", he: 'ק"ג' },
  "assess.cm": { en: "cm", he: 'ס"מ' },

  // Workout
  "workout.title": { en: "WORKOUT", he: "אימון" },
  "workout.subtitle": { en: "Upload a photo of your equipment", he: "העלו תמונה של הציוד שלכם" },
  "workout.upload": { en: "Tap to upload equipment photo", he: "לחצו להעלאת תמונת ציוד" },
  "workout.generate": { en: "Generate Workout", he: "צרו אימון" },
  "workout.analyzing": { en: "Analyzing equipment...", he: "מנתח ציוד..." },
  "workout.suggested": { en: "Suggested Workout", he: "אימון מומלץ" },
  "workout.sets": { en: "sets", he: "סטים" },
  "workout.reps": { en: "reps", he: "חזרות" },

  // Nutrition
  "nutrition.title": { en: "NUTRITION", he: "תזונה" },
  "nutrition.subtitle": { en: "Daily calorie & macro targets", he: "יעדי קלוריות ומאקרו יומיים" },
  "nutrition.calories": { en: "Calories consumed", he: "קלוריות שנצרכו" },
  "nutrition.kcal": { en: "kcal", he: "קק״ל" },
  "nutrition.macros": { en: "Macronutrients", he: "מאקרו-נוטריינטים" },
  "nutrition.protein": { en: "Protein", he: "חלבון" },
  "nutrition.carbs": { en: "Carbs", he: "פחמימות" },
  "nutrition.fat": { en: "Fat", he: "שומן" },
  "nutrition.water": { en: "Water", he: "מים" },
  "nutrition.meals": { en: "Meals", he: "ארוחות" },
  "nutrition.fiber": { en: "Fiber", he: "סיבים" },
};

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = () => setLang((prev) => (prev === "en" ? "he" : "en"));

  const t = (key: string) => translations[key]?.[lang] || key;

  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
};
