export interface WorkoutCompletionState {
  weekKey: string;
  workouts: Record<string, boolean>;
  exercises: Record<string, boolean>;
}

export interface NutritionCompletionState {
  weekKey: string;
  days: Record<string, boolean>;
  meals: Record<string, boolean>;
}

const WORKOUT_KEY = "fuelcore_workout_completion";
const NUTRITION_KEY = "fuelcore_nutrition_completion";
const NUTRITION_PLAN_KEY = "fuelcore_ai_meal_plan";

const getWeekKey = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date.toISOString().split("T")[0];
};

const readState = <T extends { weekKey: string }>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed.weekKey === fallback.weekKey ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeState = <T extends { weekKey: string }>(key: string, state: T) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(state));
};

const exerciseKey = (dayIdx: number, exerciseName: string) => `${dayIdx}::${exerciseName}`;
const mealKey = (dayIdx: number, mealIdx: number) => `${dayIdx}::${mealIdx}`;

export const getWorkoutCompletionState = (): WorkoutCompletionState => readState(WORKOUT_KEY, {
  weekKey: getWeekKey(),
  workouts: {},
  exercises: {},
});

export const saveWorkoutCompletionState = (state: WorkoutCompletionState) => writeState(WORKOUT_KEY, state);
export const clearWorkoutCompletionState = () => typeof window !== "undefined" && localStorage.removeItem(WORKOUT_KEY);

export const isExerciseCompleted = (state: WorkoutCompletionState, dayIdx: number, exerciseName: string) => Boolean(state.exercises[exerciseKey(dayIdx, exerciseName)]);
export const isWorkoutCompleted = (state: WorkoutCompletionState, dayIdx: number) => Boolean(state.workouts[String(dayIdx)]);

export const updateExerciseCompletion = (
  state: WorkoutCompletionState,
  dayIdx: number,
  exerciseName: string,
  exerciseNames: string[],
  completed: boolean,
): WorkoutCompletionState => {
  const next = { ...state, exercises: { ...state.exercises }, workouts: { ...state.workouts } };
  next.exercises[exerciseKey(dayIdx, exerciseName)] = completed;
  next.workouts[String(dayIdx)] = exerciseNames.every((name) => next.exercises[exerciseKey(dayIdx, name)]);
  return next;
};

export const updateWorkoutCompletion = (
  state: WorkoutCompletionState,
  dayIdx: number,
  exerciseNames: string[],
  completed: boolean,
): WorkoutCompletionState => {
  const next = { ...state, exercises: { ...state.exercises }, workouts: { ...state.workouts } };
  exerciseNames.forEach((name) => {
    next.exercises[exerciseKey(dayIdx, name)] = completed;
  });
  next.workouts[String(dayIdx)] = completed;
  return next;
};

export const getWorkoutWeeklyPercent = (totalDays: number) => {
  if (totalDays <= 0) return 0;
  const state = getWorkoutCompletionState();
  const done = Object.values(state.workouts).filter(Boolean).length;
  return Math.round((done / totalDays) * 100);
};

export const getNutritionCompletionState = (): NutritionCompletionState => readState(NUTRITION_KEY, {
  weekKey: getWeekKey(),
  days: {},
  meals: {},
});

export const saveNutritionCompletionState = (state: NutritionCompletionState) => writeState(NUTRITION_KEY, state);
export const clearNutritionCompletionState = () => typeof window !== "undefined" && localStorage.removeItem(NUTRITION_KEY);

export const isNutritionMealCompleted = (state: NutritionCompletionState, dayIdx: number, mealIdx: number) => Boolean(state.meals[mealKey(dayIdx, mealIdx)]);
export const isNutritionDayCompleted = (state: NutritionCompletionState, dayIdx: number) => Boolean(state.days[String(dayIdx)]);

export const updateNutritionMealCompletion = (
  state: NutritionCompletionState,
  dayIdx: number,
  mealIdx: number,
  mealCount: number,
  completed: boolean,
): NutritionCompletionState => {
  const next = { ...state, meals: { ...state.meals }, days: { ...state.days } };
  next.meals[mealKey(dayIdx, mealIdx)] = completed;
  next.days[String(dayIdx)] = Array.from({ length: mealCount }, (_, idx) => Boolean(next.meals[mealKey(dayIdx, idx)])).every(Boolean);
  return next;
};

export const updateNutritionDayCompletion = (
  state: NutritionCompletionState,
  dayIdx: number,
  mealCount: number,
  completed: boolean,
): NutritionCompletionState => {
  const next = { ...state, meals: { ...state.meals }, days: { ...state.days } };
  Array.from({ length: mealCount }, (_, idx) => idx).forEach((idx) => {
    next.meals[mealKey(dayIdx, idx)] = completed;
  });
  next.days[String(dayIdx)] = completed;
  return next;
};

export const saveStoredNutritionPlan = (days: unknown[] | null) => {
  if (typeof window === "undefined") return;
  if (!days) {
    localStorage.removeItem(NUTRITION_PLAN_KEY);
    return;
  }
  localStorage.setItem(NUTRITION_PLAN_KEY, JSON.stringify(days));
};

export const getStoredNutritionPlan = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(NUTRITION_PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Array<{ meals: unknown[] }>;
  } catch {
    return null;
  }
};

export const getNutritionWeeklyPercent = () => {
  const plan = getStoredNutritionPlan();
  if (!plan?.length) return 0;
  const totalMeals = plan.reduce((sum, day) => sum + day.meals.length, 0);
  if (!totalMeals) return 0;
  const state = getNutritionCompletionState();
  const done = Object.values(state.meals).filter(Boolean).length;
  return Math.round((done / totalMeals) * 100);
};