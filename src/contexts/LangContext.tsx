import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "he" | "es" | "zh" | "ar" | "de";

interface Translations {
  [key: string]: Record<Lang, string>;
}

const translations: Translations = {
  // Nav
  "nav.home": { en: "Home", he: "בית", es: "Inicio", zh: "首页", ar: "الرئيسية", de: "Start" },
  "nav.academy": { en: "Academy", he: "אקדמיה", es: "Academia", zh: "学院", ar: "الأكاديمية", de: "Akademie" },
  "nav.assessment": { en: "Assessment", he: "הערכה", es: "Evaluación", zh: "评估", ar: "التقييم", de: "Bewertung" },
  "nav.workout": { en: "Workout", he: "אימון", es: "Entreno", zh: "训练", ar: "التمرين", de: "Training" },
  "nav.nutrition": { en: "Nutrition", he: "תזונה", es: "Nutrición", zh: "营养", ar: "التغذية", de: "Ernährung" },
  "nav.recovery": { en: "Recovery", he: "שיקום", es: "Recuperación", zh: "恢复", ar: "التعافي", de: "Erholung" },
  "nav.physio": { en: "Physio", he: "פיזיו", es: "Fisio", zh: "理疗", ar: "العلاج", de: "Physio" },
  "nav.progress": { en: "Progress", he: "התקדמות", es: "Progreso", zh: "进步", ar: "التقدم", de: "Fortschritt" },

  // Home
  "home.title": { en: "FUELCORE", he: "FUELCORE", es: "FUELCORE", zh: "FUELCORE", ar: "FUELCORE", de: "FUELCORE" },
  "home.subtitle": { en: "Your AI-powered fitness & nutrition feed", he: "הפיד שלך לכושר ותזונה מבוסס AI", es: "Tu feed de fitness y nutrición con IA", zh: "您的AI健身与营养动态", ar: "خلاصة اللياقة والتغذية المدعومة بالذكاء الاصطناعي", de: "Dein KI-gestützter Fitness- & Ernährungs-Feed" },
  "home.heroHeadline": { en: "Fuel Your Body.\nGet a Personalized AI Plan.", he: "תדלק את הגוף שלך.\nקבל תוכנית AI אישית.", es: "Alimenta tu cuerpo.\nObtén un plan IA personalizado.", zh: "为你的身体加油。\n获取个性化AI计划。", ar: "زود جسمك بالطاقة.\nاحصل على خطة ذكاء اصطناعي مخصصة.", de: "Tanke deinen Körper.\nHol dir einen personalisierten KI-Plan." },
  "home.step1": { en: "Fill out the data questionnaire (2 minutes).", he: "מלא את שאלון הנתונים (2 דקות).", es: "Completa el cuestionario (2 minutos).", zh: "填写数据问卷（2分钟）。", ar: "املأ استبيان البيانات (دقيقتان).", de: "Fülle den Fragebogen aus (2 Minuten)." },
  "home.step2": { en: "Our medical expert will approve the plan.", he: "המומחה הרפואי שלנו יאשר את התוכנית.", es: "Nuestro experto médico aprobará el plan.", zh: "我们的医学专家将审批该计划。", ar: "سيوافق خبيرنا الطبي على الخطة.", de: "Unser Experte genehmigt den Plan." },
  "home.step3": { en: "Get a full workout & nutrition plan to your email.", he: "קבל תוכנית אימון ותזונה מלאה למייל שלך.", es: "Recibe un plan completo por email.", zh: "通过邮件获取完整训练和营养计划。", ar: "احصل على خطة تمارين وتغذية كاملة على بريدك.", de: "Erhalte einen kompletten Plan per E-Mail." },
  "home.stepsTitle": { en: "3 Steps to Your Pilot", he: "3 שלבים לפיילוט", es: "3 pasos para tu piloto", zh: "3步开启试用", ar: "3 خطوات لبرنامجك التجريبي", de: "3 Schritte zum Pilotprogramm" },
  "home.ctaButton": { en: "Start My Plan Now!", he: "להתחיל עכשיו!", es: "¡Empezar ahora!", zh: "立即开始！", ar: "ابدأ الآن!", de: "Jetzt starten!" },
  "home.limitedTime": { en: "🔥 Limited time — completely free pilot!", he: "🔥 לזמן מוגבל — פיילוט ללא עלות!", es: "🔥 Tiempo limitado — ¡piloto gratis!", zh: "🔥 限时免费试用！", ar: "🔥 لفترة محدودة — تجربة مجانية!", de: "🔥 Begrenzte Zeit — komplett kostenloser Pilot!" },
  "home.dailyMotivation": { en: "Daily Motivation", he: "מוטיבציה יומית", es: "Motivación diaria", zh: "每日激励", ar: "تحفيز يومي", de: "Tägliche Motivation" },
  "home.motivationQuote": { en: "The only bad workout is the one that didn't happen.", he: "האימון הגרוע היחיד הוא זה שלא קרה.", es: "El único mal entrenamiento es el que no ocurrió.", zh: "唯一糟糕的训练就是没有发生的训练。", ar: "التمرين السيئ الوحيد هو الذي لم يحدث.", de: "Das einzig schlechte Training ist das, das nicht stattfand." },
  "home.tipsTitle": { en: "Top Fitness Tips", he: "טיפים מובילים", es: "Mejores consejos", zh: "健身要点", ar: "أهم نصائح اللياقة", de: "Top Fitness-Tipps" },
  "home.tip1.title": { en: "Progressive Overload", he: "עומס פרוגרסיבי", es: "Sobrecarga progresiva", zh: "渐进式超负荷", ar: "الحمل التدريجي", de: "Progressive Überlastung" },
  "home.tip1.desc": { en: "Increase weight or reps each week to keep growing.", he: "הגדילו משקל או חזרות כל שבוע כדי להמשיך להתפתח.", es: "Aumenta peso o repeticiones cada semana.", zh: "每周增加重量或次数以持续进步。", ar: "زد الوزن أو التكرارات أسبوعياً للاستمرار بالنمو.", de: "Steigere Gewicht oder Wiederholungen wöchentlich." },
  "home.tip2.title": { en: "Track Your Progress", he: "עקבו אחר ההתקדמות", es: "Registra tu progreso", zh: "追踪进步", ar: "تتبع تقدمك", de: "Verfolge deinen Fortschritt" },
  "home.tip2.desc": { en: "Log every workout to see gains over time.", he: "תעדו כל אימון כדי לראות התקדמות לאורך זמן.", es: "Registra cada entreno para ver mejoras.", zh: "记录每次训练，查看长期收益。", ar: "سجل كل تمرين لرؤية تقدمك.", de: "Dokumentiere jedes Training für sichtbare Erfolge." },
  "home.tip3.title": { en: "Rest & Recovery", he: "מנוחה והתאוששות", es: "Descanso y recuperación", zh: "休息与恢复", ar: "الراحة والتعافي", de: "Ruhe & Erholung" },
  "home.tip3.desc": { en: "Muscles grow during rest — don't skip recovery days.", he: "שרירים גדלים במנוחה — אל תדלגו על ימי התאוששות.", es: "Los músculos crecen en descanso — no te saltes días de recuperación.", zh: "肌肉在休息中生长——别跳过恢复日。", ar: "العضلات تنمو خلال الراحة — لا تتخطَّ أيام التعافي.", de: "Muskeln wachsen in Ruhephasen — überspringe keine Erholungstage." },

  // Articles (kept for compatibility)
  "home.latest": { en: "Latest Articles", he: "מאמרים אחרונים", es: "Últimos artículos", zh: "最新文章", ar: "أحدث المقالات", de: "Neueste Artikel" },
  "home.article1.title": { en: "5 Compound Movements That Build Real Strength", he: "5 תרגילים מורכבים שבונים כוח אמיתי", es: "5 movimientos compuestos para fuerza real", zh: "5个复合动作打造真正力量", ar: "5 تمارين مركبة لبناء قوة حقيقية", de: "5 Grundübungen für echte Kraft" },
  "home.article1.summary": { en: "Master the deadlift, squat, bench press, overhead press and barbell row for maximum muscle activation.", he: "שלטו בדדליפט, סקוואט, לחיצת חזה, לחיצת כתפיים ושורה עם מוט למקסימום הפעלת שרירים.", es: "Domina el peso muerto, sentadilla, press de banca, press militar y remo para activación máxima.", zh: "掌握硬拉、深蹲、卧推、肩推和杠铃划船。", ar: "أتقن الرفعة الميتة والقرفصاء وتمارين الضغط.", de: "Beherrsche Kreuzheben, Kniebeugen, Bankdrücken, Schulterdrücken und Rudern." },
  "home.article1.category": { en: "Training", he: "אימון", es: "Entrenamiento", zh: "训练", ar: "التدريب", de: "Training" },
  "home.article2.title": { en: "Meal Prep Like a Pro: Weekly Nutrition Guide", he: "הכנת ארוחות כמו מקצוען: מדריך תזונה שבועי", es: "Prepara comidas como un pro", zh: "像专业人士一样备餐", ar: "تحضير الوجبات كالمحترفين", de: "Meal Prep wie ein Profi" },
  "home.article2.summary": { en: "Save time and stay on track with these simple high-protein meal prep strategies for busy athletes.", he: "חסכו זמן והישארו במסלול עם אסטרטגיות הכנת ארוחות עשירות בחלבון לספורטאים עסוקים.", es: "Ahorra tiempo con estas estrategias de preparación de comidas ricas en proteínas.", zh: "用这些简单的高蛋白备餐策略节省时间。", ar: "وفر الوقت مع استراتيجيات تحضير وجبات عالية البروتين.", de: "Spare Zeit mit diesen proteinreichen Meal-Prep-Strategien." },
  "home.article2.category": { en: "Nutrition", he: "תזונה", es: "Nutrición", zh: "营养", ar: "التغذية", de: "Ernährung" },
  "home.article3.title": { en: "Recovery Science: Why Rest Days Matter", he: "מדע ההתאוששות: למה ימי מנוחה חשובים", es: "Ciencia de la recuperación: días de descanso", zh: "恢复科学：休息日的重要性", ar: "علم التعافي: لماذا أيام الراحة مهمة", de: "Erholungswissenschaft: Warum Ruhetage wichtig sind" },
  "home.article3.summary": { en: "Understanding muscle recovery, sleep optimization and active rest for better performance gains.", he: "הבנת התאוששות שרירים, אופטימיזציית שינה ומנוחה פעילה לשיפור ביצועים.", es: "Comprende la recuperación muscular y el descanso activo.", zh: "了解肌肉恢复、睡眠优化和积极休息。", ar: "فهم تعافي العضلات وتحسين النوم والراحة النشطة.", de: "Verstehe Muskelregeneration, Schlafoptimierung und aktive Erholung." },
  "home.article3.category": { en: "Recovery", he: "התאוששות", es: "Recuperación", zh: "恢复", ar: "التعافي", de: "Erholung" },

  // Academy
  "academy.title": { en: "ACADEMY", he: "אקדמיה", es: "ACADEMIA", zh: "学院", ar: "الأكاديمية", de: "AKADEMIE" },
  "academy.subtitle": { en: "Science-backed articles, simplified by AI", he: "מאמרים מבוססי מדע, מפושטים על ידי AI", es: "Artículos con base científica, simplificados por IA", zh: "AI简化的科学文章", ar: "مقالات علمية مبسطة بالذكاء الاصطناعي", de: "Wissenschaftliche Artikel, vereinfacht durch KI" },
  "academy.aiNote": { en: "Each article is AI-summarized from peer-reviewed research into 3 simple sentences.", he: "כל מאמר מסוכם על ידי AI ממחקרים שפיטים ל-3 משפטים פשוטים.", es: "Cada artículo es resumido por IA en 3 oraciones simples.", zh: "每篇文章由AI从同行评审研究中总结为3句话。", ar: "كل مقال ملخص بالذكاء الاصطناعي في 3 جمل بسيطة.", de: "Jeder Artikel wird von KI aus Fachstudien in 3 einfache Sätze zusammengefasst." },
  "academy.source": { en: "Source", he: "מקור", es: "Fuente", zh: "来源", ar: "المصدر", de: "Quelle" },
  "academy.aiSummaryNote": { en: "Click any article — AI generates a professional summary in your language", he: "לחצו על מאמר — AI מייצר תקציר מקצועי בשפה שלכם", es: "Haz clic en un artículo — la IA genera un resumen profesional en tu idioma", zh: "点击文章 — AI用你的语言生成专业摘要", ar: "انقر على أي مقال — الذكاء الاصطناعي يولد ملخصاً احترافياً بلغتك", de: "Klicke auf einen Artikel — KI erstellt eine professionelle Zusammenfassung in deiner Sprache" },
  "academy.aiSummary": { en: "AI Summary", he: "תקציר AI", es: "Resumen IA", zh: "AI摘要", ar: "ملخص الذكاء الاصطناعي", de: "KI-Zusammenfassung" },
  "academy.generatingSummary": { en: "AI is generating summary...", he: "AI מייצר תקציר...", es: "IA generando resumen...", zh: "AI正在生成摘要...", ar: "الذكاء الاصطناعي يولد الملخص...", de: "KI erstellt Zusammenfassung..." },
  "academy.summaryError": { en: "Could not generate summary. Try again later.", he: "לא הצלחנו לייצר תקציר. נסו שוב מאוחר יותר.", es: "No se pudo generar el resumen. Inténtalo más tarde.", zh: "无法生成摘要，请稍后重试。", ar: "تعذر إنشاء الملخص. حاول لاحقاً.", de: "Zusammenfassung konnte nicht erstellt werden. Versuche es später." },
  "academy.article1.title": { en: "Resistance Training Volume for Hypertrophy", he: "נפח אימוני התנגדות להיפרטרופיה", es: "Volumen de entrenamiento para hipertrofia", zh: "肌肥大的抗阻训练量", ar: "حجم تمارين المقاومة للتضخم العضلي", de: "Trainingsvolumen für Hypertrophie" },
  "academy.article1.summary": { en: "Research shows 10-20 sets per muscle group per week optimizes muscle growth. Higher volumes benefit trained individuals more. Rest periods of 60-120 seconds between sets maximize metabolic stress for hypertrophy.", he: "מחקרים מראים ש-10-20 סטים לקבוצת שריר בשבוע מייעלים צמיחת שרירים. נפחים גבוהים יותר מועילים יותר למתאמנים מנוסים. הפסקות של 60-120 שניות בין סטים ממקסמות מתח מטבולי.", es: "La investigación muestra que 10-20 series por grupo muscular semanales optimizan el crecimiento. Descansos de 60-120 segundos maximizan el estrés metabólico.", zh: "研究表明每周每肌群10-20组最优。60-120秒休息间隔最大化代谢压力。", ar: "تشير الأبحاث إلى أن 10-20 مجموعة أسبوعياً لكل عضلة تحسن النمو. فترات راحة 60-120 ثانية.", de: "Forschung zeigt: 10-20 Sätze pro Muskelgruppe/Woche optimieren das Wachstum. 60-120 Sekunden Pause maximieren den metabolischen Stress." },
  "academy.article2.title": { en: "Protein Timing and Muscle Protein Synthesis", he: "תזמון חלבון וסינתזת חלבון שרירי", es: "Timing de proteínas y síntesis muscular", zh: "蛋白质时机与肌肉蛋白质合成", ar: "توقيت البروتين وتخليق البروتين العضلي", de: "Protein-Timing und Muskelproteinsynthese" },
  "academy.article2.summary": { en: "Consuming 20-40g of protein every 3-4 hours maximizes muscle protein synthesis. The 'anabolic window' post-workout is wider than previously thought — up to several hours. Total daily protein intake matters more than timing.", he: "צריכת 20-40 גרם חלבון כל 3-4 שעות ממקסמת סינתזת חלבון שרירי. 'החלון האנבולי' אחרי אימון רחב יותר ממה שחשבו — עד מספר שעות. צריכת החלבון היומית הכוללת חשובה יותר מהתזמון.", es: "Consumir 20-40g de proteína cada 3-4 horas maximiza la síntesis. La ingesta diaria total importa más que el timing.", zh: "每3-4小时摄入20-40g蛋白质最大化合成。每日总摄入量比时机更重要。", ar: "تناول 20-40 غرام كل 3-4 ساعات يزيد تخليق البروتين. الكمية اليومية الإجمالية أهم من التوقيت.", de: "20-40g Protein alle 3-4 Stunden maximieren die Synthese. Die tägliche Gesamtzufuhr zählt mehr als das Timing." },
  "academy.article3.title": { en: "Sleep and Athletic Performance Recovery", he: "שינה והתאוששות ביצועים ספורטיביים", es: "Sueño y recuperación deportiva", zh: "睡眠与运动表现恢复", ar: "النوم واستعادة الأداء الرياضي", de: "Schlaf und sportliche Erholung" },
  "academy.article3.summary": { en: "Athletes need 7-9 hours of quality sleep for optimal recovery. Sleep deprivation reduces reaction time and power output by up to 20%. Consistent sleep schedules improve hormone regulation and muscle repair.", he: "ספורטאים צריכים 7-9 שעות שינה איכותית להתאוששות מיטבית. מחסור בשינה מפחית זמן תגובה וכוח עד 20%. לוח שינה עקבי משפר ויסות הורמונלי ותיקון שרירים.", es: "Los atletas necesitan 7-9 horas de sueño para recuperarse. La falta de sueño reduce el rendimiento hasta un 20%.", zh: "运动员需要7-9小时优质睡眠。睡眠不足使反应时间和力量降低20%。", ar: "يحتاج الرياضيون 7-9 ساعات نوم جيد. نقص النوم يقلل الأداء حتى 20%.", de: "Sportler brauchen 7-9 Stunden Schlaf. Schlafmangel reduziert Leistung um bis zu 20%." },
  "academy.article4.title": { en: "Creatine: Benefits Beyond Muscle", he: "קריאטין: יתרונות מעבר לשרירים", es: "Creatina: beneficios más allá del músculo", zh: "肌酸：超越肌肉的益处", ar: "الكرياتين: فوائد تتجاوز العضلات", de: "Kreatin: Vorteile jenseits der Muskeln" },
  "academy.article4.summary": { en: "Creatine monohydrate is the most researched supplement with proven benefits for strength and power. Recent studies show cognitive benefits and neuroprotective properties. A daily dose of 3-5g is safe and effective long-term.", he: "קריאטין מונוהידראט הוא התוסף הנחקר ביותר עם יתרונות מוכחים לכוח ועוצמה. מחקרים חדשים מראים יתרונות קוגניטיביים ומגינים על מערכת העצבים. מנה יומית של 3-5 גרם בטוחה ויעילה לטווח ארוך.", es: "La creatina monohidrato es el suplemento más investigado. Dosis diaria de 3-5g es segura a largo plazo.", zh: "肌酸一水合物是研究最多的补剂。3-5g日剂量安全有效。", ar: "كرياتين أحادي الهيدرات هو المكمل الأكثر بحثاً. جرعة 3-5 غرام يومياً آمنة وفعالة.", de: "Kreatin-Monohydrat ist das am meisten erforschte Supplement. 3-5g täglich sind sicher und effektiv." },
  "academy.article5.title": { en: "HIIT vs Steady-State Cardio for Fat Loss", he: "HIIT מול אירובי קבוע לירידה בשומן", es: "HIIT vs cardio estable para quemar grasa", zh: "HIIT vs 稳态有氧减脂", ar: "HIIT مقابل الكارديو الثابت لفقدان الدهون", de: "HIIT vs. Steady-State-Cardio zum Fettabbau" },
  "academy.article5.summary": { en: "Both HIIT and steady-state cardio are effective for fat loss when calorie deficit is maintained. HIIT burns more calories per minute and elevates metabolism post-exercise (EPOC). Steady-state is less taxing on recovery and can be done more frequently.", he: "גם HIIT וגם אירובי קבוע יעילים לירידה בשומן כשנשמר גירעון קלורי. HIIT שורף יותר קלוריות לדקה ומעלה מטבוליזם אחרי אימון (EPOC). אירובי קבוע פחות מעמיס על ההתאוששות וניתן לביצוע בתדירות גבוהה יותר.", es: "Ambos métodos son efectivos con déficit calórico. HIIT quema más por minuto. El cardio estable es menos agotador.", zh: "两者在热量赤字时都有效。HIIT每分钟燃烧更多。稳态有氧对恢复压力更小。", ar: "كلاهما فعال مع عجز السعرات. HIIT يحرق أكثر بالدقيقة. الكارديو الثابت أقل إجهاداً.", de: "Beide sind effektiv bei Kaloriendefizit. HIIT verbrennt mehr pro Minute. Steady-State belastet die Erholung weniger." },
  "academy.article6.title": { en: "Intermittent Fasting and Body Composition", he: "צום לסירוגין והרכב הגוף", es: "Ayuno intermitente y composición corporal", zh: "间歇性禁食与身体成分", ar: "الصيام المتقطع وتكوين الجسم", de: "Intervallfasten und Körperzusammensetzung" },
  "academy.article7.title": { en: "Periodization: Cycling Your Training for Gains", he: "פריודיזציה: מחזורי אימון לשיפור ביצועים", es: "Periodización: ciclando tu entrenamiento", zh: "周期化训练：循环提升增益", ar: "التدوير: تنظيم تدريبك لتحقيق المكاسب", de: "Periodisierung: Training zyklisch planen" },
  "academy.article8.title": { en: "Cold Exposure and Recovery: What Science Says", he: "חשיפה לקור והתאוששות: מה המדע אומר", es: "Exposición al frío y recuperación: qué dice la ciencia", zh: "冷暴露与恢复：科学怎么说", ar: "التعرض للبرد والتعافي: ماذا يقول العلم", de: "Kälteexposition und Erholung: Was die Wissenschaft sagt" },

  // Academy categories (translated)
  "academy.cat.strength": { en: "Strength", he: "כוח", es: "Fuerza", zh: "力量", ar: "القوة", de: "Kraft" },
  "academy.cat.nutrition": { en: "Nutrition", he: "תזונה", es: "Nutrición", zh: "营养", ar: "التغذية", de: "Ernährung" },
  "academy.cat.recovery": { en: "Recovery", he: "התאוששות", es: "Recuperación", zh: "恢复", ar: "التعافي", de: "Erholung" },
  "academy.cat.physiology": { en: "Physiology", he: "פיזיולוגיה", es: "Fisiología", zh: "生理学", ar: "علم وظائف الأعضاء", de: "Physiologie" },
  "academy.cat.performance": { en: "Performance", he: "ביצועים", es: "Rendimiento", zh: "表现", ar: "الأداء", de: "Leistung" },

  // Assessment
  "assess.title": { en: "ASSESSMENT", he: "הערכה", es: "EVALUACIÓN", zh: "评估", ar: "التقييم", de: "BEWERTUNG" },
  "assess.step": { en: "Step", he: "שלב", es: "Paso", zh: "步骤", ar: "الخطوة", de: "Schritt" },
  "assess.of": { en: "of", he: "מתוך", es: "de", zh: "共", ar: "من", de: "von" },
  "assess.age": { en: "How old are you?", he: "בן/בת כמה את/ה?", es: "¿Cuántos años tienes?", zh: "你多大了？", ar: "كم عمرك؟", de: "Wie alt bist du?" },
  "assess.weight": { en: "What's your weight?", he: "מה המשקל שלך?", es: "¿Cuánto pesas?", zh: "你的体重是多少？", ar: "كم وزنك؟", de: "Wie viel wiegst du?" },
  "assess.height": { en: "What's your height?", he: "מה הגובה שלך?", es: "¿Cuánto mides?", zh: "你的身高是多少？", ar: "كم طولك؟", de: "Wie groß bist du?" },
  "assess.bodyFat": { en: "Body fat percentage?", he: "אחוז שומן גוף?", es: "¿Porcentaje de grasa corporal?", zh: "体脂百分比？", ar: "نسبة الدهون في الجسم؟", de: "Körperfettanteil?" },
  "assess.goal": { en: "What's your training goal?", he: "מה מטרת האימון שלך?", es: "¿Cuál es tu objetivo?", zh: "你的训练目标是什么？", ar: "ما هدف تدريبك؟", de: "Was ist dein Trainingsziel?" },
  "assess.goalMuscle": { en: "Muscle Mass", he: "מסת שריר", es: "Masa muscular", zh: "增肌", ar: "كتلة عضلية", de: "Muskelmasse" },
  "assess.goalLoss": { en: "Weight Loss", he: "ירידה במשקל", es: "Pérdida de peso", zh: "减重", ar: "فقدان الوزن", de: "Gewichtsverlust" },
  "assess.goalMaintenance": { en: "Maintenance", he: "שימור", es: "Mantenimiento", zh: "维持", ar: "الحفاظ", de: "Erhaltung" },
  "assess.activityLevel": { en: "How many times per week do you work out?", he: "כמה פעמים בשבוע את/ה מתאמנ/ת?", es: "¿Cuántas veces por semana entrenas?", zh: "你每周锻炼几次？", ar: "كم مرة تتمرن أسبوعياً؟", de: "Wie oft trainierst du pro Woche?" },
  "assess.activity1": { en: "1 time per week", he: "פעם בשבוע", es: "1 vez por semana", zh: "每周1次", ar: "مرة واحدة أسبوعياً", de: "1x pro Woche" },
  "assess.activity2": { en: "2 times per week", he: "פעמיים בשבוע", es: "2 veces por semana", zh: "每周2次", ar: "مرتين أسبوعياً", de: "2x pro Woche" },
  "assess.activity3": { en: "3 times per week", he: "3 פעמים בשבוע", es: "3 veces por semana", zh: "每周3次", ar: "3 مرات أسبوعياً", de: "3x pro Woche" },
  "assess.activity4": { en: "4-5 times per week", he: "4-5 פעמים בשבוע", es: "4-5 veces por semana", zh: "每周4-5次", ar: "4-5 مرات أسبوعياً", de: "4-5x pro Woche" },
  "assess.activity5": { en: "6+ times per week", he: "6+ פעמים בשבוע", es: "6+ veces por semana", zh: "每周6+次", ar: "6+ مرات أسبوعياً", de: "6+ pro Woche" },
  "assess.allergies": { en: "Any food allergies?", he: "יש אלרגיות למזון?", es: "¿Alergias alimentarias?", zh: "有食物过敏吗？", ar: "هل لديك حساسية غذائية؟", de: "Nahrungsmittelallergien?" },
  "assess.allergyGluten": { en: "Gluten", he: "גלוטן", es: "Gluten", zh: "麸质", ar: "الغلوتين", de: "Gluten" },
  "assess.allergyLactose": { en: "Lactose", he: "לקטוז", es: "Lactosa", zh: "乳糖", ar: "اللاكتوز", de: "Laktose" },
  "assess.allergyNone": { en: "None", he: "אין", es: "Ninguna", zh: "无", ar: "لا يوجد", de: "Keine" },
  "assess.mealFrequency": { en: "Meals per day?", he: "ארוחות ביום?", es: "¿Comidas al día?", zh: "每日餐数？", ar: "عدد الوجبات يومياً؟", de: "Mahlzeiten pro Tag?" },
  "assess.workoutDuration": { en: "Workout duration (minutes)?", he: "משך אימון (דקות)?", es: "¿Duración del entreno (min)?", zh: "训练时长（分钟）？", ar: "مدة التمرين (دقائق)؟", de: "Trainingsdauer (Minuten)?" },
  "assess.injuries": { en: "Any physical injuries?", he: "יש פציעות גופניות?", es: "¿Lesiones físicas?", zh: "有身体伤病吗？", ar: "هل لديك إصابات جسدية؟", de: "Körperliche Verletzungen?" },
  "assess.injuriesPlaceholder": { en: "e.g. Lower back pain, knee issues (optional)", he: "לדוגמה: כאבי גב תחתון, בעיות ברכיים (אופציונלי)", es: "Ej. dolor lumbar, problemas de rodilla (opcional)", zh: "例如：腰痛、膝盖问题（可选）", ar: "مثال: ألم أسفل الظهر، مشاكل الركبة (اختياري)", de: "z.B. Rückenschmerzen, Knieprobleme (optional)" },
  "assess.complete": { en: "Generate My Plan", he: "צרו את התוכנית שלי", es: "Generar mi plan", zh: "生成我的计划", ar: "أنشئ خطتي", de: "Meinen Plan erstellen" },
  "assess.next": { en: "Next", he: "הבא", es: "Siguiente", zh: "下一步", ar: "التالي", de: "Weiter" },
  "assess.back": { en: "Back", he: "חזרה", es: "Atrás", zh: "返回", ar: "رجوع", de: "Zurück" },
  "assess.done.title": { en: "Assessment Complete", he: "ההערכה הושלמה", es: "Evaluación completa", zh: "评估完成", ar: "اكتمل التقييم", de: "Bewertung abgeschlossen" },
  "assess.done.desc": { en: "Your personalized plan is ready. Check the Nutrition tab!", he: "התוכנית האישית שלך מוכנה. בדקו בלשונית תזונה!", es: "Tu plan está listo. ¡Revisa la pestaña Nutrición!", zh: "您的个性化计划已就绪。查看营养标签！", ar: "خطتك الشخصية جاهزة. تحقق من تبويب التغذية!", de: "Dein Plan ist bereit. Schau im Ernährungs-Tab!" },
  "assess.planReady": { en: "Your Fuel Plan is Ready!", he: "תוכנית הדלק שלך מוכנה!", es: "¡Tu plan está listo!", zh: "你的燃料计划准备好了！", ar: "خطتك جاهزة!", de: "Dein Fuel-Plan ist fertig!" },
  "assess.planReadyDesc": { en: "We've crafted a personalized nutrition & workout plan based on your profile.", he: "יצרנו תוכנית תזונה ואימונים מותאמת אישית על בסיס הפרופיל שלך.", es: "Hemos creado un plan personalizado basado en tu perfil.", zh: "我们根据您的资料制定了个性化计划。", ar: "لقد أعددنا خطة مخصصة بناءً على ملفك.", de: "Wir haben einen personalisierten Plan basierend auf deinem Profil erstellt." },
  "assess.seePlan": { en: "See My Plan", he: "לתוכנית שלי", es: "Ver mi plan", zh: "查看我的计划", ar: "عرض خطتي", de: "Meinen Plan ansehen" },
  "assess.physicalStats": { en: "Your Physical Stats", he: "הנתונים הגופניים שלך", es: "Tus datos físicos", zh: "你的身体数据", ar: "بياناتك الجسدية", de: "Deine körperlichen Daten" },
  "assess.stepGoal": { en: "Goal", he: "מטרה", es: "Objetivo", zh: "目标", ar: "الهدف", de: "Ziel" },
  "assess.stepStats": { en: "Stats", he: "נתונים", es: "Datos", zh: "数据", ar: "الإحصائيات", de: "Daten" },
  "assess.stepActivity": { en: "Activity & Injuries", he: "פעילות ופציעות", es: "Actividad y lesiones", zh: "活动与伤病", ar: "النشاط والإصابات", de: "Aktivität & Verletzungen" },
  "assess.stepDiet": { en: "Diet Preferences", he: "העדפות תזונה", es: "Preferencias de dieta", zh: "饮食偏好", ar: "تفضيلات النظام الغذائي", de: "Ernährungspräferenzen" },
  "assess.years": { en: "years", he: "שנים", es: "años", zh: "岁", ar: "سنة", de: "Jahre" },
  "assess.kg": { en: "kg", he: 'ק"ג', es: "kg", zh: "公斤", ar: "كغ", de: "kg" },
  "assess.cm": { en: "cm", he: 'ס"מ', es: "cm", zh: "厘米", ar: "سم", de: "cm" },
  "assess.generating": { en: "Generating your personalized plan...", he: "יוצר את התוכנית האישית שלך...", es: "Generando tu plan personalizado...", zh: "正在生成您的个性化计划...", ar: "جاري إنشاء خطتك المخصصة...", de: "Dein Plan wird erstellt..." },
  "assess.experience": { en: "Training experience", he: "ניסיון אימונים", es: "Experiencia de entrenamiento", zh: "训练经验", ar: "خبرة التدريب", de: "Trainingserfahrung" },
  "assess.expBeginner": { en: "Beginner (0-1 years)", he: "מתחיל (0-1 שנים)", es: "Principiante (0-1 años)", zh: "初学者（0-1年）", ar: "مبتدئ (0-1 سنة)", de: "Anfänger (0-1 Jahre)" },
  "assess.expIntermediate": { en: "Intermediate (1-3 years)", he: "בינוני (1-3 שנים)", es: "Intermedio (1-3 años)", zh: "中级（1-3年）", ar: "متوسط (1-3 سنوات)", de: "Fortgeschritten (1-3 Jahre)" },
  "assess.expAdvanced": { en: "Advanced (3+ years)", he: "מתקדם (3+ שנים)", es: "Avanzado (3+ años)", zh: "高级（3+年）", ar: "متقدم (3+ سنوات)", de: "Profi (3+ Jahre)" },

  // Workout
  "workout.title": { en: "WORKOUT PLAN", he: "תוכנית אימון", es: "PLAN DE ENTRENO", zh: "训练计划", ar: "خطة التمرين", de: "TRAININGSPLAN" },
  "workout.subtitle": { en: "Your weekly training schedule", he: "לוח האימונים השבועי שלך", es: "Tu horario de entrenamiento semanal", zh: "您的每周训练计划", ar: "جدولك التدريبي الأسبوعي", de: "Dein wöchentlicher Trainingsplan" },
  "workout.upload": { en: "Tap to upload equipment photo", he: "לחצו להעלאת תמונת ציוד", es: "Sube una foto del equipo", zh: "点击上传器材照片", ar: "اضغط لرفع صورة المعدات", de: "Tippe zum Hochladen eines Gerätefotos" },
  "workout.generate": { en: "Generate Workout", he: "צרו אימון", es: "Generar entreno", zh: "生成训练", ar: "إنشاء تمرين", de: "Training erstellen" },
  "workout.analyzing": { en: "Analyzing equipment...", he: "מנתח ציוד...", es: "Analizando equipo...", zh: "分析器材...", ar: "تحليل المعدات...", de: "Analyse der Geräte..." },
  "workout.suggested": { en: "Suggested Workout", he: "אימון מומלץ", es: "Entreno sugerido", zh: "推荐训练", ar: "تمرين مقترح", de: "Vorgeschlagenes Training" },
  "workout.sets": { en: "sets", he: "סטים", es: "series", zh: "组", ar: "مجموعات", de: "Sätze" },
  "workout.reps": { en: "reps", he: "חזרות", es: "reps", zh: "次", ar: "تكرارات", de: "Wdh." },
  "workout.rest": { en: "rest", he: "מנוחה", es: "descanso", zh: "休息", ar: "راحة", de: "Pause" },
  "workout.scanGym": { en: "Scan My Gym", he: "סרקו את חדר הכושר", es: "Escanear mi gym", zh: "扫描健身房", ar: "امسح صالتي", de: "Mein Gym scannen" },
  "workout.uploadHint": { en: "Upload up to 5 photos of your gym equipment", he: "העלו עד 5 תמונות של ציוד חדר הכושר", es: "Sube hasta 5 fotos del equipo", zh: "上传最多5张器材照片", ar: "ارفع حتى 5 صور للمعدات", de: "Lade bis zu 5 Fotos deiner Geräte hoch" },
  "workout.aiIdentifying": { en: "FuelCore AI is identifying equipment...", he: "FuelCore AI מזהה ציוד...", es: "FuelCore AI identificando equipo...", zh: "FuelCore AI正在识别器材...", ar: "FuelCore AI يحدد المعدات...", de: "FuelCore AI erkennt Geräte..." },
  "workout.weeklySchedule": { en: "Weekly Schedule", he: "לוח שבועי", es: "Horario semanal", zh: "每周安排", ar: "الجدول الأسبوعي", de: "Wochenplan" },
  "workout.day.sun": { en: "Sun", he: "ראשון", es: "Dom", zh: "日", ar: "الأحد", de: "So" },
  "workout.day.mon": { en: "Mon", he: "שני", es: "Lun", zh: "一", ar: "الإثنين", de: "Mo" },
  "workout.day.tue": { en: "Tue", he: "שלישי", es: "Mar", zh: "二", ar: "الثلاثاء", de: "Di" },
  "workout.day.wed": { en: "Wed", he: "רביעי", es: "Mié", zh: "三", ar: "الأربعاء", de: "Mi" },
  "workout.day.thu": { en: "Thu", he: "חמישי", es: "Jue", zh: "四", ar: "الخميس", de: "Do" },
  "workout.day.fri": { en: "Fri", he: "שישי", es: "Vie", zh: "五", ar: "الجمعة", de: "Fr" },
  "workout.day.sat": { en: "Sat", he: "שבת", es: "Sáb", zh: "六", ar: "السبت", de: "Sa" },
  "workout.videoPlaceholder": { en: "Instructional video", he: "סרטון הדרכה", es: "Video instructivo", zh: "教学视频", ar: "فيديو تعليمي", de: "Anleitungsvideo" },
  "workout.manualAdjust": { en: "Manual Adjust", he: "התאמה ידנית", es: "Ajuste manual", zh: "手动调整", ar: "تعديل يدوي", de: "Manuell anpassen" },
  "workout.progressiveOverload": { en: "Progressive Overload", he: "עומס פרוגרסיבי", es: "Sobrecarga progresiva", zh: "渐进式超负荷", ar: "الحمل التدريجي", de: "Progressive Überlastung" },
  "workout.suggestedIncrease": { en: "Suggested increase", he: "הגדלה מומלצת", es: "Aumento sugerido", zh: "建议增加", ar: "زيادة مقترحة", de: "Empfohlene Steigerung" },
  "workout.setupDesc": { en: "Let's build your perfect plan", he: "בואו נבנה את התוכנית המושלמת שלכם", es: "Construyamos tu plan perfecto", zh: "让我们制定你的完美计划", ar: "لنبني خطتك المثالية", de: "Lass uns deinen perfekten Plan erstellen" },
  "workout.howManyDays": { en: "How many days per week?", he: "כמה ימים בשבוע?", es: "¿Cuántos días por semana?", zh: "每周几天？", ar: "كم يوماً في الأسبوع؟", de: "Wie viele Tage pro Woche?" },
  "workout.focusAreas": { en: "What do you want to focus on?", he: "על מה תרצו להתמקד?", es: "¿En qué quieres enfocarte?", zh: "你想专注于什么？", ar: "على ماذا تريد التركيز؟", de: "Worauf möchtest du dich konzentrieren?" },
  "workout.focus.chest": { en: "Chest", he: "חזה", es: "Pecho", zh: "胸", ar: "الصدر", de: "Brust" },
  "workout.focus.back": { en: "Back", he: "גב", es: "Espalda", zh: "背", ar: "الظهر", de: "Rücken" },
  "workout.focus.shoulders": { en: "Shoulders", he: "כתפיים", es: "Hombros", zh: "肩", ar: "الأكتاف", de: "Schultern" },
  "workout.focus.legs": { en: "Legs", he: "רגליים", es: "Piernas", zh: "腿", ar: "الساقين", de: "Beine" },
  "workout.focus.arms": { en: "Arms", he: "ידיים", es: "Brazos", zh: "手臂", ar: "الذراعين", de: "Arme" },
  "workout.focus.core": { en: "Core", he: "ליבה", es: "Core", zh: "核心", ar: "الجذع", de: "Core" },
  "workout.focus.fullbody": { en: "Full Body", he: "כל הגוף", es: "Cuerpo completo", zh: "全身", ar: "الجسم الكامل", de: "Ganzkörper" },
  "workout.uploadPhotos": { en: "Upload Gym Photos", he: "העלו תמונות חדר כושר", es: "Subir fotos del gym", zh: "上传健身房照片", ar: "ارفع صور الصالة", de: "Gym-Fotos hochladen" },
  "workout.skipToAi": { en: "Skip — AI Plan", he: "דלגו — תוכנית AI", es: "Saltar — Plan IA", zh: "跳过 — AI计划", ar: "تخطي — خطة ذكية", de: "Überspringen — KI-Plan" },
  "workout.back": { en: "Back", he: "חזרה", es: "Atrás", zh: "返回", ar: "رجوع", de: "Zurück" },
  "workout.aiGenerating": { en: "AI is building your workout plan...", he: "AI בונה את תוכנית האימון שלכם...", es: "La IA está creando tu plan...", zh: "AI正在制定你的训练计划...", ar: "الذكاء الاصطناعي يبني خطة تمرينك...", de: "KI erstellt deinen Trainingsplan..." },
  "workout.planReady": { en: "Your workout plan is ready!", he: "תוכנית האימון שלכם מוכנה!", es: "¡Tu plan está listo!", zh: "你的训练计划准备好了！", ar: "خطة تمرينك جاهزة!", de: "Dein Trainingsplan ist fertig!" },
  "workout.regenerate": { en: "New Plan", he: "תוכנית חדשה", es: "Nuevo plan", zh: "新计划", ar: "خطة جديدة", de: "Neuer Plan" },
  "workout.replacing": { en: "Finding replacement exercise...", he: "מחפש תרגיל חלופי...", es: "Buscando reemplazo...", zh: "正在寻找替代训练...", ar: "البحث عن تمرين بديل...", de: "Ersatzübung wird gesucht..." },
  "workout.exerciseInfo": { en: "Exercise details", he: "פרטי תרגיל", es: "Detalles del ejercicio", zh: "练习详情", ar: "تفاصيل التمرين", de: "Übungsdetails" },
  "workout.tips": { en: "Pro Tips", he: "טיפים מקצועיים", es: "Consejos pro", zh: "专业提示", ar: "نصائح احترافية", de: "Profi-Tipps" },
  "workout.lastUsed": { en: "Last", he: "אחרון", es: "Último", zh: "上次", ar: "السابق", de: "Zuletzt" },
  "workout.logPerformance": { en: "Log Performance", he: "רשמו ביצועים", es: "Registrar rendimiento", zh: "记录表现", ar: "سجل الأداء", de: "Leistung protokollieren" },
  "workout.weightKg": { en: "Weight (kg)", he: 'משקל (ק"ג)', es: "Peso (kg)", zh: "重量(kg)", ar: "الوزن (كغ)", de: "Gewicht (kg)" },
  "workout.showGraph": { en: "Show Performance Graph", he: "הציגו גרף ביצועים", es: "Mostrar gráfico", zh: "显示表现图表", ar: "عرض رسم الأداء", de: "Leistungsgraph anzeigen" },
  "workout.hideGraph": { en: "Hide Performance Graph", he: "הסתירו גרף ביצועים", es: "Ocultar gráfico", zh: "隐藏表现图表", ar: "إخفاء رسم الأداء", de: "Leistungsgraph ausblenden" },

  // Nutrition
  "nutrition.title": { en: "NUTRITION", he: "תזונה", es: "NUTRICIÓN", zh: "营养", ar: "التغذية", de: "ERNÄHRUNG" },
  "nutrition.subtitle": { en: "Daily calorie & macro targets", he: "יעדי קלוריות ומאקרו יומיים", es: "Objetivos diarios de calorías y macros", zh: "每日热量和宏量营养目标", ar: "أهداف السعرات والمغذيات اليومية", de: "Tägliche Kalorien- & Makroziele" },
  "nutrition.calories": { en: "Calories consumed", he: "קלוריות שנצרכו", es: "Calorías consumidas", zh: "已摄入热量", ar: "السعرات المستهلكة", de: "Verbrauchte Kalorien" },
  "nutrition.kcal": { en: "kcal", he: "קק״ל", es: "kcal", zh: "千卡", ar: "سعرة", de: "kcal" },
  "nutrition.macros": { en: "Macronutrients", he: "מאקרו-נוטריינטים", es: "Macronutrientes", zh: "宏量营养素", ar: "المغذيات الكبرى", de: "Makronährstoffe" },
  "nutrition.protein": { en: "Protein", he: "חלבון", es: "Proteína", zh: "蛋白质", ar: "البروتين", de: "Protein" },
  "nutrition.carbs": { en: "Carbs", he: "פחמימות", es: "Carbohidratos", zh: "碳水化合物", ar: "الكربوهيدرات", de: "Kohlenhydrate" },
  "nutrition.fat": { en: "Fat", he: "שומן", es: "Grasa", zh: "脂肪", ar: "الدهون", de: "Fett" },
  "nutrition.water": { en: "Water", he: "מים", es: "Agua", zh: "水", ar: "الماء", de: "Wasser" },
  "nutrition.meals": { en: "Meals", he: "ארוחות", es: "Comidas", zh: "餐食", ar: "الوجبات", de: "Mahlzeiten" },
  "nutrition.fiber": { en: "Fiber", he: "סיבים", es: "Fibra", zh: "膳食纤维", ar: "الألياف", de: "Ballaststoffe" },
  "nutrition.noData": { en: "Complete the assessment first to see your personalized nutrition plan.", he: "השלימו את ההערכה קודם כדי לראות את תוכנית התזונה האישית שלכם.", es: "Completa la evaluación primero para ver tu plan.", zh: "先完成评估以查看您的个性化营养计划。", ar: "أكمل التقييم أولاً لرؤية خطتك الشخصية.", de: "Schließe zuerst die Bewertung ab, um deinen Plan zu sehen." },
  "nutrition.dailyTargets": { en: "Your Daily Targets", he: "היעדים היומיים שלך", es: "Tus objetivos diarios", zh: "你的每日目标", ar: "أهدافك اليومية", de: "Deine Tagesziele" },
  "nutrition.weeklyPlan": { en: "AI Weekly Menu", he: "תפריט שבועי AI", es: "Menú semanal AI", zh: "AI每周菜单", ar: "قائمة أسبوعية AI", de: "AI Wochenmenü" },
  "nutrition.generatePlan": { en: "Generate Menu", he: "צור תפריט", es: "Generar menú", zh: "生成菜单", ar: "إنشاء القائمة", de: "Menü erstellen" },
  "nutrition.planReady": { en: "Your weekly meal plan is ready!", he: "תפריט השבועי שלך מוכן!", es: "¡Tu menú semanal está listo!", zh: "你的每周菜单准备好了!", ar: "قائمة طعامك الأسبوعية جاهزة!", de: "Dein Wochenmenü ist fertig!" },
  "nutrition.emptyPlan": { en: "Generate a personalized AI meal plan with exact portions, calories, and timing for every day of the week.", he: "צרו תפריט תזונה אישי עם מנות מדויקות, קלוריות ותזמון לכל יום בשבוע.", es: "Genera un plan de comidas personalizado con porciones exactas, calorías y horarios.", zh: "生成个性化AI餐计划，包含每天的精确份量、热量和时间。", ar: "أنشئ خطة وجبات مخصصة بكميات دقيقة وسعرات حرارية وتوقيت.", de: "Erstelle einen personalisierten AI-Ernährungsplan mit genauen Portionen, Kalorien und Zeiten." },
  "nutrition.total": { en: "total", he: "סה״כ", es: "total", zh: "总计", ar: "المجموع", de: "gesamt" },
  "nutrition.manualLog": { en: "My Meal Log", he: "יומן הארוחות שלי", es: "Mi registro de comidas", zh: "我的用餐记录", ar: "سجل وجباتي", de: "Mein Essensprotokoll" },
  "nutrition.dailyWorkout": { en: "Daily Workout", he: "אימון יומי", es: "Entreno diario", zh: "每日训练", ar: "تمرين يومي", de: "Tägliches Training" },
  "nutrition.recovery": { en: "Physio Recovery", he: "שיקום פיזיותרפי", es: "Recuperación fisioterapéutica", zh: "理疗恢复", ar: "العلاج الطبيعي", de: "Physiotherapie" },

  // Recovery
  "recovery.title": { en: "RECOVERY", he: "שיקום", es: "RECUPERACIÓN", zh: "恢复", ar: "التعافي", de: "ERHOLUNG" },
  "recovery.subtitle": { en: "Mobility drills based on your pain points", he: "תרגילי ניידות מבוססי נקודות כאב", es: "Ejercicios de movilidad según tus puntos de dolor", zh: "基于疼痛点的活动度训练", ar: "تمارين الحركة بناءً على نقاط الألم", de: "Mobilitätsübungen basierend auf deinen Schmerzpunkten" },
  "recovery.shoulder": { en: "Shoulder Pain", he: "כאב כתף", es: "Dolor de hombro", zh: "肩痛", ar: "ألم الكتف", de: "Schulterschmerzen" },
  "recovery.back": { en: "Lower Back Pain", he: "כאב גב תחתון", es: "Dolor lumbar", zh: "腰痛", ar: "ألم أسفل الظهر", de: "Rückenschmerzen" },
  "recovery.knee": { en: "Knee Pain", he: "כאב ברכיים", es: "Dolor de rodilla", zh: "膝痛", ar: "ألم الركبة", de: "Knieschmerzen" },
  "recovery.hip": { en: "Hip Tightness", he: "מתיחות ירך", es: "Tensión de cadera", zh: "髋部紧绷", ar: "تيبس الورك", de: "Hüftsteifigkeit" },
  "recovery.videoPlaceholder": { en: "Instructional video coming soon", he: "סרטון הדרכה בקרוב", es: "Video instructivo próximamente", zh: "教学视频即将推出", ar: "فيديو تعليمي قريباً", de: "Anleitungsvideo in Kürze" },
  "recovery.duration.2min": { en: "2 min", he: "2 דקות", es: "2 min", zh: "2分钟", ar: "دقيقتان", de: "2 Min" },
  "recovery.duration.3min": { en: "3 min", he: "3 דקות", es: "3 min", zh: "3分钟", ar: "3 دقائق", de: "3 Min" },
  "recovery.duration.5min": { en: "5 min", he: "5 דקות", es: "5 min", zh: "5分钟", ar: "5 دقائق", de: "5 Min" },
  "recovery.shoulder.drill1": { en: "Band Pull-Aparts", he: "מתיחות גומי", es: "Aperturas con banda", zh: "弹力带拉伸", ar: "تمارين الشريط المطاطي", de: "Band Pull-Aparts" },
  "recovery.shoulder.drill2": { en: "Wall Slides", he: "החלקות קיר", es: "Deslizamientos en pared", zh: "墙壁滑动", ar: "انزلاقات الجدار", de: "Wandgleitübungen" },
  "recovery.shoulder.drill3": { en: "External Rotation Stretch", he: "מתיחת סיבוב חיצוני", es: "Estiramiento de rotación externa", zh: "外旋拉伸", ar: "تمدد الدوران الخارجي", de: "Außenrotationsdehnung" },
  "recovery.back.drill1": { en: "Cat-Cow Stretch", he: "מתיחת חתול-פרה", es: "Estiramiento gato-vaca", zh: "猫牛伸展", ar: "تمدد القطة-البقرة", de: "Katze-Kuh-Dehnung" },
  "recovery.back.drill2": { en: "Bird Dog", he: "ציפור-כלב", es: "Pájaro-perro", zh: "鸟狗式", ar: "تمرين الطائر-الكلب", de: "Vierfüßlerstand" },
  "recovery.back.drill3": { en: "Dead Bug", he: "חיפושית מתה", es: "Bicho muerto", zh: "死虫", ar: "تمرين الحشرة الميتة", de: "Dead Bug" },
  "recovery.knee.drill1": { en: "Foam Roll Quads & IT Band", he: "רולר קצף ירכיים", es: "Rodillo de espuma en cuádriceps", zh: "泡沫轴滚动", ar: "رول الفوم للفخذين", de: "Faszienrolle Oberschenkel" },
  "recovery.knee.drill2": { en: "Terminal Knee Extensions", he: "הארכות ברכיים סופיות", es: "Extensiones terminales de rodilla", zh: "终端膝关节伸展", ar: "تمديدات الركبة النهائية", de: "Terminale Kniestreckung" },
  "recovery.knee.drill3": { en: "Glute Bridge Holds", he: "גשר ישבן", es: "Puente de glúteos", zh: "臀桥保持", ar: "جسر الأرداف", de: "Glute Bridge" },
  "recovery.hip.drill1": { en: "90/90 Hip Stretch", he: "מתיחת ירך 90/90", es: "Estiramiento 90/90", zh: "90/90髋部拉伸", ar: "تمدد الورك 90/90", de: "90/90 Hüftdehnung" },
  "recovery.hip.drill2": { en: "Pigeon Pose", he: "תנוחת יונה", es: "Postura de paloma", zh: "鸽子式", ar: "وضعية الحمامة", de: "Taubenstellung" },

  // Landing
  "landing.tagline": { en: "AI-Powered Personal Training & Nutrition", he: "אימון אישי ותזונה מבוססי AI", es: "Entrenamiento personal y nutrición con IA", zh: "AI驱动的个人训练与营养", ar: "تدريب شخصي وتغذية بالذكاء الاصطناعي", de: "KI-gestütztes Personal Training & Ernährung" },
  "landing.cta": { en: "Get Started Free", he: "להתחיל בחינם", es: "Empieza gratis", zh: "免费开始", ar: "ابدأ مجاناً", de: "Kostenlos starten" },
  "landing.limitedPilot": { en: "🔥 Limited time — free pilot program!", he: "🔥 לזמן מוגבל — תוכנית פיילוט בחינם!", es: "🔥 Tiempo limitado — ¡piloto gratis!", zh: "🔥 限时免费试用计划！", ar: "🔥 لفترة محدودة — برنامج تجريبي مجاني!", de: "🔥 Begrenzte Zeit — kostenloses Pilotprogramm!" },
  "landing.feat1.title": { en: "AI Plans", he: "תוכניות AI", es: "Planes IA", zh: "AI计划", ar: "خطط ذكية", de: "KI-Pläne" },
  "landing.feat1.desc": { en: "Personalized workout & nutrition", he: "אימון ותזונה מותאמים אישית", es: "Entrenamiento y nutrición personalizados", zh: "个性化训练与营养", ar: "تمارين وتغذية مخصصة", de: "Personalisiertes Training & Ernährung" },
  "landing.feat2.title": { en: "Gym Scanner", he: "סורק חדר כושר", es: "Escáner de gym", zh: "健身房扫描", ar: "ماسح الصالة", de: "Gym-Scanner" },
  "landing.feat2.desc": { en: "Scan equipment, get exercises", he: "סרקו ציוד, קבלו תרגילים", es: "Escanea equipo, obtén ejercicios", zh: "扫描器材，获取训练", ar: "امسح المعدات واحصل على تمارين", de: "Geräte scannen, Übungen erhalten" },
  "landing.feat3.title": { en: "Meal Tracker", he: "מעקב ארוחות", es: "Seguimiento de comidas", zh: "餐食追踪", ar: "متتبع الوجبات", de: "Mahlzeiten-Tracker" },
  "landing.feat3.desc": { en: "Log meals, track macros", he: "רשמו ארוחות, עקבו אחר מאקרו", es: "Registra comidas, sigue macros", zh: "记录餐食，追踪宏量", ar: "سجل الوجبات وتتبع المغذيات", de: "Mahlzeiten loggen, Makros tracken" },
  "landing.feat4.title": { en: "Progress", he: "התקדמות", es: "Progreso", zh: "进步", ar: "التقدم", de: "Fortschritt" },
  "landing.feat4.desc": { en: "Photos & analytics", he: "תמונות ואנליטיקס", es: "Fotos y analíticas", zh: "照片与分析", ar: "صور وتحليلات", de: "Fotos & Analysen" },
  "landing.socialProof": { en: "Trusted by athletes & fitness enthusiasts", he: "מהימן על ידי ספורטאים וחובבי כושר", es: "Confiado por atletas y entusiastas del fitness", zh: "受运动员和健身爱好者信赖", ar: "موثوق به من الرياضيين وعشاق اللياقة", de: "Vertraut von Sportlern & Fitness-Enthusiasten" },

  // Dashboard
  "dashboard.morning": { en: "Good morning,", he: "בוקר טוב,", es: "Buenos días,", zh: "早上好，", ar: "صباح الخير،", de: "Guten Morgen," },
  "dashboard.afternoon": { en: "Good afternoon,", he: "צהריים טובים,", es: "Buenas tardes,", zh: "下午好，", ar: "مساء الخير،", de: "Guten Tag," },
  "dashboard.evening": { en: "Good evening,", he: "ערב טוב,", es: "Buenas noches,", zh: "晚上好，", ar: "مساء الخير،", de: "Guten Abend," },
  "dashboard.completion": { en: "Today's completion", he: "השלמה יומית", es: "Completado hoy", zh: "今日完成度", ar: "إنجاز اليوم", de: "Heutiger Fortschritt" },
  "dashboard.welcome": { en: "Welcome to FuelCore!", he: "ברוכים הבאים ל-FuelCore!", es: "¡Bienvenido a FuelCore!", zh: "欢迎来到FuelCore！", ar: "مرحباً بك في FuelCore!", de: "Willkommen bei FuelCore!" },
  "dashboard.cleanSlate": { en: "Your fitness journey starts here. Complete the assessment to get your personalized plan.", he: "המסע שלך מתחיל כאן. השלימו את ההערכה כדי לקבל תוכנית אישית.", es: "Tu viaje empieza aquí. Completa la evaluación para obtener tu plan.", zh: "你的健身之旅从这里开始。完成评估获取个性化计划。", ar: "رحلة لياقتك تبدأ هنا. أكمل التقييم للحصول على خطتك.", de: "Deine Fitness-Reise beginnt hier. Schließe die Bewertung ab." },

  // Auth
  "auth.login": { en: "Log In", he: "התחברות", es: "Iniciar sesión", zh: "登录", ar: "تسجيل الدخول", de: "Anmelden" },
  "auth.signup": { en: "Sign Up", he: "הרשמה", es: "Registrarse", zh: "注册", ar: "إنشاء حساب", de: "Registrieren" },
  "auth.email": { en: "Email", he: "אימייל", es: "Correo electrónico", zh: "邮箱", ar: "البريد الإلكتروني", de: "E-Mail" },
  "auth.password": { en: "Password", he: "סיסמה", es: "Contraseña", zh: "密码", ar: "كلمة المرور", de: "Passwort" },
  "auth.firstName": { en: "First Name", he: "שם פרטי", es: "Nombre", zh: "名字", ar: "الاسم الأول", de: "Vorname" },
  "auth.loginSubtitle": { en: "Welcome back to FuelCore", he: "ברוכים השבים ל-FuelCore", es: "Bienvenido de vuelta a FuelCore", zh: "欢迎回到FuelCore", ar: "مرحباً بعودتك إلى FuelCore", de: "Willkommen zurück bei FuelCore" },
  "auth.signupSubtitle": { en: "Create your FuelCore account", he: "צרו חשבון FuelCore", es: "Crea tu cuenta FuelCore", zh: "创建您的FuelCore账户", ar: "أنشئ حسابك في FuelCore", de: "Erstelle dein FuelCore-Konto" },
  "auth.forgotSubtitle": { en: "Reset your password", he: "איפוס סיסמה", es: "Restablece tu contraseña", zh: "重置密码", ar: "إعادة تعيين كلمة المرور", de: "Passwort zurücksetzen" },
  "auth.noAccount": { en: "Don't have an account?", he: "אין לך חשבון?", es: "¿No tienes cuenta?", zh: "没有账户？", ar: "ليس لديك حساب؟", de: "Noch kein Konto?" },
  "auth.hasAccount": { en: "Already have an account?", he: "כבר יש לך חשבון?", es: "¿Ya tienes cuenta?", zh: "已有账户？", ar: "لديك حساب بالفعل؟", de: "Bereits ein Konto?" },
  "auth.error": { en: "Authentication Error", he: "שגיאת אימות", es: "Error de autenticación", zh: "认证错误", ar: "خطأ في المصادقة", de: "Authentifizierungsfehler" },
  "auth.checkEmail": { en: "Check your email", he: "בדקו את האימייל", es: "Revisa tu correo", zh: "查看您的邮箱", ar: "تحقق من بريدك", de: "Prüfe deine E-Mail" },
  "auth.checkEmailDesc": { en: "We sent you a verification link.", he: "שלחנו לכם קישור אימות.", es: "Te enviamos un enlace de verificación.", zh: "我们已发送验证链接。", ar: "أرسلنا لك رابط التحقق.", de: "Wir haben dir einen Bestätigungslink geschickt." },
  "auth.logout": { en: "Logout", he: "התנתקות", es: "Cerrar sesión", zh: "退出", ar: "تسجيل الخروج", de: "Abmelden" },
  "auth.forgotPassword": { en: "Forgot your password?", he: "שכחת סיסמה?", es: "¿Olvidaste tu contraseña?", zh: "忘记密码？", ar: "نسيت كلمة المرور؟", de: "Passwort vergessen?" },
  "auth.sendReset": { en: "Send Reset Link", he: "שלחו קישור איפוס", es: "Enviar enlace de restablecimiento", zh: "发送重置链接", ar: "إرسال رابط إعادة التعيين", de: "Reset-Link senden" },
  "auth.resetSent": { en: "Reset link sent!", he: "קישור איפוס נשלח!", es: "¡Enlace enviado!", zh: "重置链接已发送！", ar: "تم إرسال رابط إعادة التعيين!", de: "Reset-Link gesendet!" },
  "auth.resetSentDesc": { en: "Check your email for a password reset link.", he: "בדקו את האימייל לקישור איפוס סיסמה.", es: "Revisa tu correo para restablecer la contraseña.", zh: "查看您的邮箱获取重置链接。", ar: "تحقق من بريدك لرابط إعادة التعيين.", de: "Prüfe deine E-Mail für den Reset-Link." },
  "auth.backToLogin": { en: "Back to login", he: "חזרה להתחברות", es: "Volver al inicio de sesión", zh: "返回登录", ar: "العودة لتسجيل الدخول", de: "Zurück zur Anmeldung" },
  "auth.weak": { en: "Weak", he: "חלשה", es: "Débil", zh: "弱", ar: "ضعيف", de: "Schwach" },
  "auth.medium": { en: "Medium", he: "בינונית", es: "Media", zh: "中", ar: "متوسط", de: "Mittel" },
  "auth.strong": { en: "Strong", he: "חזקה", es: "Fuerte", zh: "强", ar: "قوي", de: "Stark" },
  "auth.veryStrong": { en: "Very Strong", he: "חזקה מאוד", es: "Muy fuerte", zh: "非常强", ar: "قوي جداً", de: "Sehr stark" },
  "auth.passwordRequirements": { en: "Min 8 chars, include numbers & symbols", he: "מינימום 8 תווים, כולל מספרים וסימנים", es: "Mín. 8 caracteres, incluir números y símbolos", zh: "至少8个字符，包含数字和符号", ar: "8 أحرف على الأقل، تشمل أرقام ورموز", de: "Min. 8 Zeichen, inkl. Zahlen & Symbole" },

  // Progress Tracker
  "progress.title": { en: "PROGRESS TRACKER", he: "מעקב התקדמות", es: "SEGUIMIENTO DE PROGRESO", zh: "进步追踪", ar: "متتبع التقدم", de: "FORTSCHRITTS-TRACKER" },
  "progress.subtitle": { en: "Upload photos to track your transformation", he: "העלו תמונות לעקוב אחר השינוי", es: "Sube fotos para seguir tu transformación", zh: "上传照片追踪变化", ar: "ارفع صور لتتبع تحولك", de: "Lade Fotos hoch, um deine Verwandlung zu verfolgen" },
  "progress.uploadHint": { en: "Tap to upload a progress photo", he: "לחצו להעלאת תמונת התקדמות", es: "Toca para subir una foto de progreso", zh: "点击上传进步照片", ar: "اضغط لرفع صورة تقدم", de: "Tippe zum Hochladen eines Fortschrittsfotos" },
  "progress.uploading": { en: "Uploading...", he: "מעלה...", es: "Subiendo...", zh: "上传中...", ar: "جاري الرفع...", de: "Hochladen..." },
  "progress.uploaded": { en: "Photo uploaded!", he: "תמונה הועלתה!", es: "¡Foto subida!", zh: "照片已上传！", ar: "تم رفع الصورة!", de: "Foto hochgeladen!" },
  "progress.error": { en: "Upload failed", he: "ההעלאה נכשלה", es: "Error al subir", zh: "上传失败", ar: "فشل الرفع", de: "Hochladen fehlgeschlagen" },
  "progress.empty": { en: "No photos yet. Start tracking your progress!", he: "אין עדיין תמונות. התחילו לעקוב!", es: "Sin fotos aún. ¡Empieza a seguir tu progreso!", zh: "还没有照片。开始追踪您的进步！", ar: "لا صور بعد. ابدأ بتتبع تقدمك!", de: "Noch keine Fotos. Starte dein Tracking!" },

  // Daily Workout
  "dailyWorkout.title": { en: "DAILY WORKOUT", he: "אימון יומי", es: "ENTRENO DIARIO", zh: "每日训练", ar: "تمرين يومي", de: "TÄGLICHES TRAINING" },
  "dailyWorkout.subtitle": { en: "Your exercise library with video guides", he: "ספריית התרגילים שלך עם הדרכות וידאו", es: "Tu biblioteca de ejercicios con videos", zh: "您的训练视频库", ar: "مكتبة تمارينك مع فيديوهات", de: "Deine Übungsbibliothek mit Video-Anleitungen" },
  "dailyWorkout.empty": { en: "No exercises available yet.", he: "אין עדיין תרגילים.", es: "Sin ejercicios disponibles aún.", zh: "暂无可用训练。", ar: "لا تمارين متاحة بعد.", de: "Noch keine Übungen verfügbar." },
  "dailyWorkout.videoSoon": { en: "Video coming soon", he: "וידאו בקרוב", es: "Video próximamente", zh: "视频即将推出", ar: "فيديو قريباً", de: "Video in Kürze" },

  // Nutrition Plan
  "nutritionPlan.title": { en: "MY NUTRITION", he: "התזונה שלי", es: "MI NUTRICIÓN", zh: "我的营养", ar: "تغذيتي", de: "MEINE ERNÄHRUNG" },
  "nutritionPlan.subtitle": { en: "Track and manage your daily meals", he: "עקבו ונהלו את הארוחות היומיות", es: "Gestiona tus comidas diarias", zh: "追踪管理每日餐食", ar: "تتبع وأدر وجباتك اليومية", de: "Verfolge und verwalte deine Mahlzeiten" },
  "nutritionPlan.addMeal": { en: "Add Meal", he: "הוסף ארוחה", es: "Añadir comida", zh: "添加餐食", ar: "إضافة وجبة", de: "Mahlzeit hinzufügen" },
  "nutritionPlan.editMeal": { en: "Edit Meal", he: "ערוך ארוחה", es: "Editar comida", zh: "编辑餐食", ar: "تعديل وجبة", de: "Mahlzeit bearbeiten" },
  "nutritionPlan.foodName": { en: "Food name", he: "שם המאכל", es: "Nombre del alimento", zh: "食物名称", ar: "اسم الطعام", de: "Lebensmittelname" },
  "nutritionPlan.calories": { en: "Calories", he: "קלוריות", es: "Calorías", zh: "热量", ar: "السعرات", de: "Kalorien" },
  "nutritionPlan.proteinG": { en: "Protein (g)", he: "חלבון (גרם)", es: "Proteína (g)", zh: "蛋白质(g)", ar: "بروتين (غرام)", de: "Protein (g)" },
  "nutritionPlan.save": { en: "Save", he: "שמור", es: "Guardar", zh: "保存", ar: "حفظ", de: "Speichern" },
  "nutritionPlan.updated": { en: "Meal updated!", he: "הארוחה עודכנה!", es: "¡Comida actualizada!", zh: "餐食已更新！", ar: "تم تحديث الوجبة!", de: "Mahlzeit aktualisiert!" },
  "nutritionPlan.added": { en: "Meal added!", he: "ארוחה נוספה!", es: "¡Comida añadida!", zh: "餐食已添加！", ar: "تمت إضافة الوجبة!", de: "Mahlzeit hinzugefügt!" },
  "nutritionPlan.deleted": { en: "Meal deleted", he: "ארוחה נמחקה", es: "Comida eliminada", zh: "餐食已删除", ar: "تم حذف الوجبة", de: "Mahlzeit gelöscht" },
  "nutritionPlan.error": { en: "Error", he: "שגיאה", es: "Error", zh: "错误", ar: "خطأ", de: "Fehler" },
  "nutritionPlan.empty": { en: "No meals logged yet. Start adding your meals!", he: "אין עדיין ארוחות. התחילו להוסיף!", es: "Sin comidas registradas. ¡Empieza a añadir!", zh: "暂无餐食记录。开始添加吧！", ar: "لا وجبات مسجلة بعد. ابدأ بالإضافة!", de: "Noch keine Mahlzeiten. Fang an zu loggen!" },
  "nutritionPlan.totalCals": { en: "Total Calories", he: "סה\"כ קלוריות", es: "Calorías totales", zh: "总热量", ar: "إجمالي السعرات", de: "Gesamtkalorien" },
  "nutritionPlan.totalProtein": { en: "Total Protein", he: "סה\"כ חלבון", es: "Proteína total", zh: "总蛋白质", ar: "إجمالي البروتين", de: "Gesamtprotein" },

  // Knowledge Hub
  "knowledgeHub.title": { en: "KNOWLEDGE HUB", he: "מרכז ידע", es: "CENTRO DE CONOCIMIENTO", zh: "知识中心", ar: "مركز المعرفة", de: "WISSENSZENTRUM" },
  "knowledgeHub.subtitle": { en: "Searchable articles & resources", he: "מאמרים ומשאבים עם חיפוש", es: "Artículos y recursos buscables", zh: "可搜索的文章与资源", ar: "مقالات وموارد قابلة للبحث", de: "Durchsuchbare Artikel & Ressourcen" },
  "knowledgeHub.search": { en: "Search articles...", he: "חפש מאמרים...", es: "Buscar artículos...", zh: "搜索文章...", ar: "البحث في المقالات...", de: "Artikel suchen..." },
  "knowledgeHub.all": { en: "All", he: "הכל", es: "Todos", zh: "全部", ar: "الكل", de: "Alle" },
  "knowledgeHub.readMore": { en: "Read More", he: "קרא עוד", es: "Leer más", zh: "阅读更多", ar: "اقرأ المزيد", de: "Mehr lesen" },
  "knowledgeHub.empty": { en: "No articles found.", he: "לא נמצאו מאמרים.", es: "No se encontraron artículos.", zh: "未找到文章。", ar: "لم يتم العثور على مقالات.", de: "Keine Artikel gefunden." },

  // Language names
  "lang.en": { en: "English", he: "English", es: "English", zh: "English", ar: "English", de: "English" },
  "lang.he": { en: "עברית", he: "עברית", es: "עברית", zh: "עברית", ar: "עברית", de: "עברית" },
  "lang.es": { en: "Español", he: "Español", es: "Español", zh: "Español", ar: "Español", de: "Español" },
  "lang.zh": { en: "中文", he: "中文", es: "中文", zh: "中文", ar: "中文", de: "中文" },
  "lang.ar": { en: "العربية", he: "العربية", es: "العربية", zh: "العربية", ar: "العربية", de: "العربية" },
  "lang.de": { en: "Deutsch", he: "Deutsch", es: "Deutsch", zh: "Deutsch", ar: "Deutsch", de: "Deutsch" },
};

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export const useLang = () => useContext(LangContext);

const LANGS: Lang[] = ["en", "he", "es", "zh", "ar", "de"];
const RTL_LANGS: Lang[] = ["he", "ar"];

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = () => {
    const idx = LANGS.indexOf(lang);
    setLang(LANGS[(idx + 1) % LANGS.length]);
  };

  const t = (key: string) => translations[key]?.[lang] || translations[key]?.["en"] || key;

  const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
};
