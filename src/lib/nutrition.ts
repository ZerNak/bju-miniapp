import type { Goals, PlanWeeks, Profile } from '../types'

/** ~7700 ккал ≈ 1 кг жира */
const KCAL_PER_KG = 7700

/** Mifflin–St Jeor BMR */
export function calcBmr(profile: Profile): number {
  const { weightKg, heightCm, age, sex } = profile
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calcTdee(profile: Profile): number {
  return Math.round(calcBmr(profile) * profile.activity)
}

export function resolveWeeks(profile: Profile): PlanWeeks {
  const w = profile.weeks
  if (w === 4 || w === 8 || w === 12 || w === 16 || w === 24) return w
  return 12
}

export function resolveTargetWeight(profile: Profile): number {
  if (typeof profile.targetWeightKg === 'number' && profile.targetWeightKg > 0) {
    return profile.targetWeightKg
  }
  // legacy: процент похудения от текущего веса
  const pct = profile.deficitPct > 0 ? profile.deficitPct : 10
  return Math.round(profile.weightKg * (1 - pct / 100) * 10) / 10
}

export function calcPlanMeta(profile: Profile) {
  const tdee = calcTdee(profile)
  const weeks = resolveWeeks(profile)
  const targetWeightKg = resolveTargetWeight(profile)
  const kgToLose = Math.max(0, Math.round((profile.weightKg - targetWeightKg) * 10) / 10)
  const kgPerWeek = weeks > 0 ? Math.round((kgToLose / weeks) * 100) / 100 : 0
  const goals = calcGoals(profile)
  const deficitPct = tdee > 0 ? Math.max(0, Math.round((1 - goals.calories / tdee) * 100)) : 0
  return { tdee, weeks, targetWeightKg, kgToLose, kgPerWeek, deficitPct, goals }
}

/**
 * Калории: TDEE − дефицит из (кг к потере × 7700) / дни срока.
 * Дефицит ограничивается 25% TDEE (безопасный максимум).
 * БЖУ: белок 2.0 г/кг, жир ≥ 0.9 г/кг и ~25% ккал, углеводы — остаток.
 */
export function calcGoals(profile: Profile): Goals {
  const tdee = calcTdee(profile)
  const minCal = profile.sex === 'male' ? 1500 : 1200
  const weeks = resolveWeeks(profile)
  const target = resolveTargetWeight(profile)
  const kgToLose = Math.max(0, profile.weightKg - target)

  let dailyDeficit =
    kgToLose > 0 && weeks > 0 ? (kgToLose * KCAL_PER_KG) / (weeks * 7) : tdee * 0.15

  const maxDeficit = tdee * 0.25
  dailyDeficit = Math.min(dailyDeficit, maxDeficit)

  const calories = Math.max(minCal, Math.round(tdee - dailyDeficit))

  const proteinG = Math.max(80, Math.round(profile.weightKg * 2.0))
  const fatG = Math.max(
    Math.round(profile.weightKg * 0.9),
    Math.round((calories * 0.25) / 9),
  )

  let carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4)
  if (carbsG < 40) {
    carbsG = 40
  }

  return { calories, proteinG, fatG, carbsG }
}

export function macrosForGrams(
  per100: { calories: number; protein: number; fat: number; carbs: number },
  grams: number,
) {
  const k = grams / 100
  return {
    calories: Math.round(per100.calories * k),
    protein: Math.round(per100.protein * k * 10) / 10,
    fat: Math.round(per100.fat * k * 10) / 10,
    carbs: Math.round(per100.carbs * k * 10) / 10,
  }
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function sumMacros(
  items: Array<{ calories: number; protein: number; fat: number; carbs: number }>,
) {
  return items.reduce(
    (acc, x) => ({
      calories: acc.calories + x.calories,
      protein: Math.round((acc.protein + x.protein) * 10) / 10,
      fat: Math.round((acc.fat + x.fat) * 10) / 10,
      carbs: Math.round((acc.carbs + x.carbs) * 10) / 10,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  )
}
