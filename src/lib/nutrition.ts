import type { Goals, Profile } from '../types'

/** Mifflin–St Jeor BMR */
export function calcBmr(profile: Profile): number {
  const { weightKg, heightCm, age, sex } = profile
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export function calcTdee(profile: Profile): number {
  return Math.round(calcBmr(profile) * profile.activity)
}

/** Weight-loss goals: calorie deficit + macro split ~30P / 30F / 40C */
export function calcGoals(profile: Profile): Goals {
  const tdee = calcTdee(profile)
  const calories = Math.max(1200, Math.round(tdee * (1 - profile.deficitPct / 100)))
  const proteinG = Math.round((calories * 0.3) / 4)
  const fatG = Math.round((calories * 0.3) / 9)
  const carbsG = Math.round((calories * 0.4) / 4)
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
