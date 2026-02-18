/**
 * Calculs de cibles nutritionnelles (BMR, TDEE, calories cible, macros).
 * Politique: tous les champs requis (sex, birthdate, weightKg, heightCm, activityLevel, goal)
 * doivent être renseignés pour retourner des cibles; sinon on retourne null.
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'athlete';
export type Goal = 'maintain' | 'lose' | 'gain';
export type GoalRate = 'slow' | 'medium' | 'fast';

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

/** Perte: -300 (slow), -500 (medium), -700 (fast). Prise: +250, +400, +600 */
const GOAL_DELTA_KCAL: Record<GoalRate, { lose: number; gain: number }> = {
  slow: { lose: -300, gain: 250 },
  medium: { lose: -500, gain: 400 },
  fast: { lose: -700, gain: 600 },
};

export interface ProfileForTargets {
  sex: 'male' | 'female' | null;
  birthdate: Date | null;
  weightKg: number | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  goalRate: GoalRate | null;
}

export interface TargetsResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarTargetG: number;
  fiberTargetG: number;
}

function getAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) age--;
  return age;
}

/**
 * BMR formule Mifflin-St Jeor
 * Homme: 10*poids + 6.25*taille - 5*âge + 5
 * Femme: 10*poids + 6.25*taille - 5*âge - 161
 */
function calcBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number {
  const w = weightKg;
  const h = heightCm;
  const a = age;
  if (sex === 'male') {
    return 10 * w + 6.25 * h - 5 * a + 5;
  }
  return 10 * w + 6.25 * h - 5 * a - 161;
}

/**
 * Protéines: maintain/lose 1.6 g/kg, gain 1.8 g/kg.
 * Lipides: 0.8 g/kg (minimum).
 * Glucides: le reste des calories (targetCalories - protein*4 - fat*9) / 4
 */
function calcMacros(
  weightKg: number,
  targetCalories: number,
  goal: Goal,
): { proteinG: number; fatG: number; carbsG: number } {
  const proteinPerKg = goal === 'gain' ? 1.8 : 1.6;
  const proteinG = Math.round(proteinPerKg * weightKg);
  const fatG = Math.round(0.8 * weightKg);
  const kcalFromProtein = proteinG * 4;
  const kcalFromFat = fatG * 9;
  const remainingKcal = targetCalories - kcalFromProtein - kcalFromFat;
  const carbsG = Math.max(0, Math.round(remainingKcal / 4));
  return { proteinG, fatG, carbsG };
}

export function computeTargets(profile: ProfileForTargets): TargetsResult | null {
  if (
    !profile.sex ||
    !profile.birthdate ||
    profile.weightKg == null ||
    profile.heightCm == null ||
    !profile.activityLevel ||
    !profile.goal
  ) {
    return null;
  }

  const age = getAge(new Date(profile.birthdate));
  const bmr = calcBMR(
    profile.weightKg,
    profile.heightCm,
    age,
    profile.sex as 'male' | 'female',
  );
  const tdee = bmr * ACTIVITY_FACTOR[profile.activityLevel as ActivityLevel];

  let targetCalories = tdee;
  if (profile.goal === 'lose' || profile.goal === 'gain') {
    const rate = profile.goalRate || 'medium';
    const delta = GOAL_DELTA_KCAL[rate as GoalRate];
    targetCalories = tdee + (profile.goal === 'lose' ? delta.lose : delta.gain);
  }
  targetCalories = Math.round(Math.max(1200, targetCalories));

  const { proteinG, fatG, carbsG } = calcMacros(profile.weightKg, targetCalories, profile.goal as Goal);

  // Cibles par défaut pour sucres et fibres
  // Sucres: recommandation OMS < 50g/jour (idéalement < 25g), on utilise 50g comme cible max
  // Fibres: recommandation ANSES 25-30g/jour selon l'âge/sexe, on utilise 30g comme cible
  const sugarTargetG = 50;
  const fiberTargetG = 30;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    proteinG,
    fatG,
    carbsG,
    sugarTargetG,
    fiberTargetG,
  };
}
