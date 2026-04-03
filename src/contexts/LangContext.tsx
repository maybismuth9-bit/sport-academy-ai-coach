import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "he";

interface Translations {
  [key: string]: { en: string; he: string };
}

const translations: Translations = {
  // Nav
  "nav.home": { en: "Home", he: "בית" },
  "nav.academy": { en: "Academy", he: "אקדמיה" },
  "nav.assessment": { en: "Assessment", he: "הערכה" },
  "nav.workout": { en: "Workout", he: "אימון" },
  "nav.nutrition": { en: "Nutrition", he: "תזונה" },
  "nav.recovery": { en: "Recovery", he: "שיקום" },

  // Home
  "home.title": { en: "FUELCORE", he: "FUELCORE" },
  "home.subtitle": { en: "Your AI-powered fitness & nutrition feed", he: "הפיד שלך לכושר ותזונה מבוסס AI" },
  "home.heroHeadline": { en: "Fuel Your Body.\nGet a Personalized AI Plan.", he: "תדלק את הגוף שלך.\nקבל תוכנית AI אישית." },
  "home.step1": { en: "Fill out the data questionnaire (2 minutes).", he: "מלא את שאלון הנתונים (2 דקות)." },
  "home.step2": { en: "Our medical expert will approve the plan.", he: "המומחה הרפואי שלנו יאשר את התוכנית." },
  "home.step3": { en: "Get a full workout & nutrition plan to your email.", he: "קבל תוכנית אימון ותזונה מלאה למייל שלך." },
  "home.stepsTitle": { en: "3 Steps to Your Pilot", he: "3 שלבים לפיילוט" },
  "home.ctaButton": { en: "Start My Plan Now!", he: "להתחיל עכשיו!" },
  "home.limitedTime": { en: "🔥 Limited time — completely free pilot!", he: "🔥 לזמן מוגבל — פיילוט ללא עלות!" },
  "home.dailyMotivation": { en: "Daily Motivation", he: "מוטיבציה יומית" },
  "home.motivationQuote": { en: "The only bad workout is the one that didn't happen.", he: "האימון הגרוע היחיד הוא זה שלא קרה." },
  "home.tipsTitle": { en: "Top Fitness Tips", he: "טיפים מובילים" },
  "home.tip1.title": { en: "Progressive Overload", he: "עומס פרוגרסיבי" },
  "home.tip1.desc": { en: "Increase weight or reps each week to keep growing.", he: "הגדילו משקל או חזרות כל שבוע כדי להמשיך להתפתח." },
  "home.tip2.title": { en: "Track Your Progress", he: "עקבו אחר ההתקדמות" },
  "home.tip2.desc": { en: "Log every workout to see gains over time.", he: "תעדו כל אימון כדי לראות התקדמות לאורך זמן." },
  "home.tip3.title": { en: "Rest & Recovery", he: "מנוחה והתאוששות" },
  "home.tip3.desc": { en: "Muscles grow during rest — don't skip recovery days.", he: "שרירים גדלים במנוחה — אל תדלגו על ימי התאוששות." },

  // Articles (kept for compatibility)
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

  // Academy
  "academy.title": { en: "ACADEMY", he: "אקדמיה" },
  "academy.subtitle": { en: "Science-backed articles, simplified by AI", he: "מאמרים מבוססי מדע, מפושטים על ידי AI" },
  "academy.aiNote": { en: "Each article is AI-summarized from peer-reviewed research into 3 simple sentences.", he: "כל מאמר מסוכם על ידי AI ממחקרים שפיטים ל-3 משפטים פשוטים." },
  "academy.source": { en: "Source", he: "מקור" },
  "academy.article1.title": { en: "Resistance Training Volume for Hypertrophy", he: "נפח אימוני התנגדות להיפרטרופיה" },
  "academy.article1.summary": { en: "Research shows 10-20 sets per muscle group per week optimizes muscle growth. Higher volumes benefit trained individuals more. Rest periods of 60-120 seconds between sets maximize metabolic stress for hypertrophy.", he: "מחקרים מראים ש-10-20 סטים לקבוצת שריר בשבוע מייעלים צמיחת שרירים. נפחים גבוהים יותר מועילים יותר למתאמנים מנוסים. הפסקות של 60-120 שניות בין סטים ממקסמות מתח מטבולי." },
  "academy.article2.title": { en: "Protein Timing and Muscle Protein Synthesis", he: "תזמון חלבון וסינתזת חלבון שרירי" },
  "academy.article2.summary": { en: "Consuming 20-40g of protein every 3-4 hours maximizes muscle protein synthesis. The 'anabolic window' post-workout is wider than previously thought — up to several hours. Total daily protein intake matters more than timing.", he: "צריכת 20-40 גרם חלבון כל 3-4 שעות ממקסמת סינתזת חלבון שרירי. 'החלון האנבולי' אחרי אימון רחב יותר ממה שחשבו — עד מספר שעות. צריכת החלבון היומית הכוללת חשובה יותר מהתזמון." },
  "academy.article3.title": { en: "Sleep and Athletic Performance Recovery", he: "שינה והתאוששות ביצועים ספורטיביים" },
  "academy.article3.summary": { en: "Athletes need 7-9 hours of quality sleep for optimal recovery. Sleep deprivation reduces reaction time and power output by up to 20%. Consistent sleep schedules improve hormone regulation and muscle repair.", he: "ספורטאים צריכים 7-9 שעות שינה איכותית להתאוששות מיטבית. מחסור בשינה מפחית זמן תגובה וכוח עד 20%. לוח שינה עקבי משפר ויסות הורמונלי ותיקון שרירים." },
  "academy.article4.title": { en: "Creatine: Benefits Beyond Muscle", he: "קריאטין: יתרונות מעבר לשרירים" },
  "academy.article4.summary": { en: "Creatine monohydrate is the most researched supplement with proven benefits for strength and power. Recent studies show cognitive benefits and neuroprotective properties. A daily dose of 3-5g is safe and effective long-term.", he: "קריאטין מונוהידראט הוא התוסף הנחקר ביותר עם יתרונות מוכחים לכוח ועוצמה. מחקרים חדשים מראים יתרונות קוגניטיביים ומגינים על מערכת העצבים. מנה יומית של 3-5 גרם בטוחה ויעילה לטווח ארוך." },
  "academy.article5.title": { en: "HIIT vs Steady-State Cardio for Fat Loss", he: "HIIT מול אירובי קבוע לירידה בשומן" },
  "academy.article5.summary": { en: "Both HIIT and steady-state cardio are effective for fat loss when calorie deficit is maintained. HIIT burns more calories per minute and elevates metabolism post-exercise (EPOC). Steady-state is less taxing on recovery and can be done more frequently.", he: "גם HIIT וגם אירובי קבוע יעילים לירידה בשומן כשנשמר גירעון קלורי. HIIT שורף יותר קלוריות לדקה ומעלה מטבוליזם אחרי אימון (EPOC). אירובי קבוע פחות מעמיס על ההתאוששות וניתן לביצוע בתדירות גבוהה יותר." },

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
  "assess.experience": { en: "Training experience", he: "ניסיון אימונים" },
  "assess.expBeginner": { en: "Beginner (0-1 years)", he: "מתחיל (0-1 שנים)" },
  "assess.expIntermediate": { en: "Intermediate (1-3 years)", he: "בינוני (1-3 שנים)" },
  "assess.expAdvanced": { en: "Advanced (3+ years)", he: "מתקדם (3+ שנים)" },

  // Workout
  "workout.title": { en: "WORKOUT PLAN", he: "תוכנית אימון" },
  "workout.subtitle": { en: "Your weekly training schedule", he: "לוח האימונים השבועי שלך" },
  "workout.upload": { en: "Tap to upload equipment photo", he: "לחצו להעלאת תמונת ציוד" },
  "workout.generate": { en: "Generate Workout", he: "צרו אימון" },
  "workout.analyzing": { en: "Analyzing equipment...", he: "מנתח ציוד..." },
  "workout.suggested": { en: "Suggested Workout", he: "אימון מומלץ" },
  "workout.sets": { en: "sets", he: "סטים" },
  "workout.reps": { en: "reps", he: "חזרות" },
  "workout.rest": { en: "rest", he: "מנוחה" },
  "workout.scanGym": { en: "Scan My Gym", he: "סרקו את חדר הכושר" },
  "workout.uploadHint": { en: "Upload up to 5 photos of your gym equipment", he: "העלו עד 5 תמונות של ציוד חדר הכושר" },
  "workout.aiIdentifying": { en: "FuelCore AI is identifying equipment...", he: "FuelCore AI מזהה ציוד..." },
  "workout.weeklySchedule": { en: "Weekly Schedule", he: "לוח שבועי" },
  "workout.day.sun": { en: "Sun", he: "ראשון" },
  "workout.day.mon": { en: "Mon", he: "שני" },
  "workout.day.tue": { en: "Tue", he: "שלישי" },
  "workout.day.wed": { en: "Wed", he: "רביעי" },
  "workout.day.thu": { en: "Thu", he: "חמישי" },
  "workout.day.fri": { en: "Fri", he: "שישי" },
  "workout.day.sat": { en: "Sat", he: "שבת" },
  "workout.videoPlaceholder": { en: "Instructional video", he: "סרטון הדרכה" },
  "workout.manualAdjust": { en: "Manual Adjust", he: "התאמה ידנית" },
  "workout.progressiveOverload": { en: "Progressive Overload", he: "עומס פרוגרסיבי" },
  "workout.suggestedIncrease": { en: "Suggested increase", he: "הגדלה מומלצת" },

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

  // Recovery
  "recovery.title": { en: "RECOVERY", he: "שיקום" },
  "recovery.subtitle": { en: "Mobility drills based on your pain points", he: "תרגילי ניידות מבוססי נקודות כאב" },
  "recovery.shoulder": { en: "Shoulder Pain", he: "כאב כתף" },
  "recovery.back": { en: "Lower Back Pain", he: "כאב גב תחתון" },
  "recovery.knee": { en: "Knee Pain", he: "כאב ברכיים" },
  "recovery.hip": { en: "Hip Tightness", he: "מתיחות ירך" },
  "recovery.videoPlaceholder": { en: "Instructional video coming soon", he: "סרטון הדרכה בקרוב" },
  "recovery.duration.2min": { en: "2 min", he: "2 דקות" },
  "recovery.duration.3min": { en: "3 min", he: "3 דקות" },
  "recovery.duration.5min": { en: "5 min", he: "5 דקות" },
  "recovery.shoulder.drill1": { en: "Band Pull-Aparts", he: "מתיחות גומי" },
  "recovery.shoulder.drill2": { en: "Wall Slides", he: "החלקות קיר" },
  "recovery.shoulder.drill3": { en: "External Rotation Stretch", he: "מתיחת סיבוב חיצוני" },
  "recovery.back.drill1": { en: "Cat-Cow Stretch", he: "מתיחת חתול-פרה" },
  "recovery.back.drill2": { en: "Bird Dog", he: "ציפור-כלב" },
  "recovery.back.drill3": { en: "Dead Bug", he: "חיפושית מתה" },
  "recovery.knee.drill1": { en: "Foam Roll Quads & IT Band", he: "רולר קצף ירכיים" },
  "recovery.knee.drill2": { en: "Terminal Knee Extensions", he: "הארכות ברכיים סופיות" },
  "recovery.knee.drill3": { en: "Glute Bridge Holds", he: "גשר ישבן" },
  "recovery.hip.drill1": { en: "90/90 Hip Stretch", he: "מתיחת ירך 90/90" },
  "recovery.hip.drill2": { en: "Pigeon Pose", he: "תנוחת יונה" },

  // Landing
  "landing.tagline": { en: "AI-Powered Personal Training & Nutrition", he: "אימון אישי ותזונה מבוססי AI" },
  "landing.cta": { en: "Get Started Free", he: "להתחיל בחינם" },
  "landing.limitedPilot": { en: "🔥 Limited time — free pilot program!", he: "🔥 לזמן מוגבל — תוכנית פיילוט בחינם!" },
  "landing.feat1.title": { en: "AI Plans", he: "תוכניות AI" },
  "landing.feat1.desc": { en: "Personalized workout & nutrition", he: "אימון ותזונה מותאמים אישית" },
  "landing.feat2.title": { en: "Gym Scanner", he: "סורק חדר כושר" },
  "landing.feat2.desc": { en: "Scan equipment, get exercises", he: "סרקו ציוד, קבלו תרגילים" },
  "landing.feat3.title": { en: "Meal Tracker", he: "מעקב ארוחות" },
  "landing.feat3.desc": { en: "Log meals, track macros", he: "רשמו ארוחות, עקבו אחר מאקרו" },
  "landing.feat4.title": { en: "Progress", he: "התקדמות" },
  "landing.feat4.desc": { en: "Photos & analytics", he: "תמונות ואנליטיקס" },
  "landing.socialProof": { en: "Trusted by athletes & fitness enthusiasts", he: "מהימן על ידי ספורטאים וחובבי כושר" },

  // Dashboard
  "dashboard.morning": { en: "Good morning,", he: "בוקר טוב," },
  "dashboard.afternoon": { en: "Good afternoon,", he: "צהריים טובים," },
  "dashboard.evening": { en: "Good evening,", he: "ערב טוב," },
  "dashboard.completion": { en: "Today's completion", he: "השלמה יומית" },

  // Auth
  "auth.login": { en: "Log In", he: "התחברות" },
  "auth.signup": { en: "Sign Up", he: "הרשמה" },
  "auth.email": { en: "Email", he: "אימייל" },
  "auth.password": { en: "Password", he: "סיסמה" },
  "auth.loginSubtitle": { en: "Welcome back to FuelCore", he: "ברוכים השבים ל-FuelCore" },
  "auth.signupSubtitle": { en: "Create your FuelCore account", he: "צרו חשבון FuelCore" },
  "auth.noAccount": { en: "Don't have an account?", he: "אין לך חשבון?" },
  "auth.hasAccount": { en: "Already have an account?", he: "כבר יש לך חשבון?" },
  "auth.error": { en: "Authentication Error", he: "שגיאת אימות" },
  "auth.checkEmail": { en: "Check your email", he: "בדקו את האימייל" },
  "auth.checkEmailDesc": { en: "We sent you a verification link.", he: "שלחנו לכם קישור אימות." },
  "auth.logout": { en: "Logout", he: "התנתקות" },

  // Progress Tracker
  "nav.progress": { en: "Progress", he: "התקדמות" },
  "progress.title": { en: "PROGRESS TRACKER", he: "מעקב התקדמות" },
  "progress.subtitle": { en: "Upload photos to track your transformation", he: "העלו תמונות לעקוב אחר השינוי" },
  "progress.uploadHint": { en: "Tap to upload a progress photo", he: "לחצו להעלאת תמונת התקדמות" },
  "progress.uploading": { en: "Uploading...", he: "מעלה..." },
  "progress.uploaded": { en: "Photo uploaded!", he: "תמונה הועלתה!" },
  "progress.error": { en: "Upload failed", he: "ההעלאה נכשלה" },
  "progress.empty": { en: "No photos yet. Start tracking your progress!", he: "אין עדיין תמונות. התחילו לעקוב!" },

  // Daily Workout
  "dailyWorkout.title": { en: "DAILY WORKOUT", he: "אימון יומי" },
  "dailyWorkout.subtitle": { en: "Your exercise library with video guides", he: "ספריית התרגילים שלך עם הדרכות וידאו" },
  "dailyWorkout.empty": { en: "No exercises available yet.", he: "אין עדיין תרגילים." },
  "dailyWorkout.videoSoon": { en: "Video coming soon", he: "וידאו בקרוב" },

  // Nutrition Plan
  "nutritionPlan.title": { en: "MY NUTRITION", he: "התזונה שלי" },
  "nutritionPlan.subtitle": { en: "Track and manage your daily meals", he: "עקבו ונהלו את הארוחות היומיות" },
  "nutritionPlan.addMeal": { en: "Add Meal", he: "הוסף ארוחה" },
  "nutritionPlan.editMeal": { en: "Edit Meal", he: "ערוך ארוחה" },
  "nutritionPlan.foodName": { en: "Food name", he: "שם המאכל" },
  "nutritionPlan.calories": { en: "Calories", he: "קלוריות" },
  "nutritionPlan.proteinG": { en: "Protein (g)", he: "חלבון (גרם)" },
  "nutritionPlan.save": { en: "Save", he: "שמור" },
  "nutritionPlan.updated": { en: "Meal updated!", he: "הארוחה עודכנה!" },
  "nutritionPlan.added": { en: "Meal added!", he: "ארוחה נוספה!" },
  "nutritionPlan.deleted": { en: "Meal deleted", he: "ארוחה נמחקה" },
  "nutritionPlan.error": { en: "Error", he: "שגיאה" },
  "nutritionPlan.empty": { en: "No meals logged yet. Start adding your meals!", he: "אין עדיין ארוחות. התחילו להוסיף!" },
  "nutritionPlan.totalCals": { en: "Total Calories", he: "סה\"כ קלוריות" },
  "nutritionPlan.totalProtein": { en: "Total Protein", he: "סה\"כ חלבון" },

  // Knowledge Hub
  "knowledgeHub.title": { en: "KNOWLEDGE HUB", he: "מרכז ידע" },
  "knowledgeHub.subtitle": { en: "Searchable articles & resources", he: "מאמרים ומשאבים עם חיפוש" },
  "knowledgeHub.search": { en: "Search articles...", he: "חפש מאמרים..." },
  "knowledgeHub.all": { en: "All", he: "הכל" },
  "knowledgeHub.readMore": { en: "Read More", he: "קרא עוד" },
  "knowledgeHub.empty": { en: "No articles found.", he: "לא נמצאו מאמרים." },
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
