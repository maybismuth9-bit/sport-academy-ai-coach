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
  "home.title": { en: "FUELCORE", he: "FUELCORE" },
  "home.subtitle": { en: "Your AI-powered fitness & nutrition feed", he: "הפיד שלך לכושר ותזונה מבוסס AI" },
  "home.heroHeadline": { en: "Fuel Your Body.\nGet a Personalized AI Plan.", he: "תדלק את הגוף שלך.\nקבל תוכנית AI אישית." },
  "home.step1": { en: "Fill out the data questionnaire (2 minutes).", he: "מלא את שאלון הנתונים (2 דקות)." },
  "home.step2": { en: "Our medical expert will approve the plan.", he: "המומחה הרפואי שלנו יאשר את התוכנית." },
  "home.step3": { en: "Get a full workout & nutrition plan to your email.", he: "קבל תוכנית אימון ותזונה מלאה למייל שלך." },
  "home.stepsTitle": { en: "3 Steps to Your Pilot", he: "3 שלבים לפיילוט" },
  "home.ctaButton": { en: "I Want to Start Now!", he: "אני רוצה להתחיל עכשיו!" },
  "home.limitedTime": { en: "🔥 Limited time — completely free pilot!", he: "🔥 לזמן מוגבל — פיילוט ללא עלות!" },
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
  "assess.goalMaintenance": { en: "Maintenance", he: "שימור" },
  "assess.activityLevel": { en: "How many times per week do you work out?", he: "כמה פעמים בשבוע את/ה מתאמנ/ת?" },
  "assess.activity1": { en: "1 time per week", he: "פעם בשבוע" },
  "assess.activity2": { en: "2 times per week", he: "פעמיים בשבוע" },
  "assess.activity3": { en: "3 times per week", he: "3 פעמים בשבוע" },
  "assess.activity4": { en: "4-5 times per week", he: "4-5 פעמים בשבוע" },
  "assess.activity5": { en: "6+ times per week", he: "6+ פעמים בשבוע" },
  "assess.allergies": { en: "Any food allergies?", he: "יש אלרגיות למזון?" },
  "assess.allergyGluten": { en: "Gluten", he: "גלוטן" },
  "assess.allergyLactose": { en: "Lactose", he: "לקטוז" },
  "assess.allergyNone": { en: "None", he: "אין" },
  "assess.mealFrequency": { en: "Meals per day?", he: "ארוחות ביום?" },
  "assess.workoutDays": { en: "Workout days per week?", he: "ימי אימון בשבוע?" },
  "assess.workoutDuration": { en: "Workout duration (minutes)?", he: "משך אימון (דקות)?" },
  "assess.injuries": { en: "Any physical injuries?", he: "יש פציעות גופניות?" },
  "assess.injuriesPlaceholder": { en: "e.g. Lower back pain, knee issues (optional)", he: "לדוגמה: כאבי גב תחתון, בעיות ברכיים (אופציונלי)" },
  "assess.complete": { en: "Generate My Plan", he: "צרו את התוכנית שלי" },
  "assess.next": { en: "Next", he: "הבא" },
  "assess.back": { en: "Back", he: "חזרה" },
  "assess.done.title": { en: "Assessment Complete", he: "ההערכה הושלמה" },
  "assess.done.desc": { en: "Your personalized plan is ready. Check the Nutrition tab!", he: "התוכנית האישית שלך מוכנה. בדקו בלשונית תזונה!" },
  "assess.planReady": { en: "Your Fuel Plan is Ready!", he: "תוכנית הדלק שלך מוכנה!" },
  "assess.planReadyDesc": { en: "We've crafted a personalized nutrition & workout plan based on your profile.", he: "יצרנו תוכנית תזונה ואימונים מותאמת אישית על בסיס הפרופיל שלך." },
  "assess.seePlan": { en: "See My Plan", he: "לתוכנית שלי" },
  "assess.physicalStats": { en: "Your Physical Stats", he: "הנתונים הגופניים שלך" },
  "assess.stepGoal": { en: "Goal", he: "מטרה" },
  "assess.stepStats": { en: "Stats", he: "נתונים" },
  "assess.stepActivity": { en: "Activity & Injuries", he: "פעילות ופציעות" },
  "assess.stepDiet": { en: "Diet Preferences", he: "העדפות תזונה" },
  "assess.years": { en: "years", he: "שנים" },
  "assess.kg": { en: "kg", he: 'ק"ג' },
  "assess.cm": { en: "cm", he: 'ס"מ' },
  "assess.generating": { en: "Generating your personalized plan...", he: "יוצר את התוכנית האישית שלך..." },

  // Workout
  "workout.title": { en: "WORKOUT", he: "אימון" },
  "workout.subtitle": { en: "Upload a photo of your equipment", he: "העלו תמונה של הציוד שלכם" },
  "workout.upload": { en: "Tap to upload equipment photo", he: "לחצו להעלאת תמונת ציוד" },
  "workout.generate": { en: "Generate Workout", he: "צרו אימון" },
  "workout.analyzing": { en: "Analyzing equipment...", he: "מנתח ציוד..." },
  "workout.suggested": { en: "Suggested Workout", he: "אימון מומלץ" },
  "workout.sets": { en: "sets", he: "סטים" },
  "workout.reps": { en: "reps", he: "חזרות" },
  "workout.scanGym": { en: "Scan My Gym", he: "סרקו את חדר הכושר" },
  "workout.uploadHint": { en: "Photo of gym equipment or backyard setup", he: "תמונה של ציוד כושר או חצר" },
  "workout.aiIdentifying": { en: "FuelCore AI is identifying equipment...", he: "FuelCore AI מזהה ציוד..." },

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
  "nutrition.noData": { en: "Complete the assessment first to see your personalized nutrition plan.", he: "השלימו את ההערכה קודם כדי לראות את תוכנית התזונה האישית שלכם." },
  "nutrition.dailyTargets": { en: "Your Daily Targets", he: "היעדים היומיים שלך" },
  "nutrition.weeklyPlan": { en: "Weekly Plan", he: "תוכנית שבועית" },
  "nutrition.dailyWorkout": { en: "Daily Workout", he: "אימון יומי" },
  "nutrition.recovery": { en: "Physio Recovery", he: "שיקום פיזיותרפי" },
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
