// Types pour l'API

export interface User {
  id: string;
  email: string;
  createdAt: string;
  profile?: {
    weightKg: number | null;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Food {
  id: string;
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
  foodId: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  food: Food;
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
}
