// Types pour l'API

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'athlete';
export type Goal = 'maintain' | 'lose' | 'gain';
export type GoalRate = 'slow' | 'medium' | 'fast';

export interface Profile {
  id: string;
  userId: string;
  sex: Sex | null;
  birthdate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  goalRate: GoalRate | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  profile?: Profile | null;
}

export interface Targets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface FoodSearchResult {
  source: 'ciqual';
  externalId: string;
  name: string;
  brand: string | null;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
}

export interface MealItem {
  id: string;
  mealId: string;
  foodSource: 'ciqual' | 'custom';
  externalFoodId: string | null;
  foodName: string;
  foodBrand: string | null;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  userId: string;
  eatenAt: string;
  mealType: string;
  note: string | null;
  items: MealItem[];
}

export interface RunDetails {
  id: string;
  workoutId: string;
  distanceKm: number;
  avgPaceSecKm: number;
}

export interface Workout {
  id: string;
  userId: string;
  startedAt: string;
  type: 'run' | 'strength';
  durationMin: number;
  rpe: number | null;
  notes: string | null;
  runDetails?: RunDetails | null;
}

export interface DayStats {
  date: string;
  nutrition: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  workouts: {
    count: number;
    totalDurationMin: number;
    totalBurnKcal: number;
  };
  targets: {
    tdee: number;
    targetCalories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null;
}

export interface WeekStatsDay {
  date: string;
  nutrition: { kcal: number };
  totalBurnKcal: number;
  totalDurationMin: number;
  targetCalories: number | null;
}

export interface WeekStats {
  days: WeekStatsDay[];
  targets: { targetCalories: number } | null;
}
