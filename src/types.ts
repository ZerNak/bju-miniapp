export type Sex = 'male' | 'female'

export type Screen = 'today' | 'add' | 'manual' | 'profile' | 'confirm'

export type PlanWeeks = 4 | 8 | 12 | 16 | 24

export interface Profile {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: 1.2 | 1.375 | 1.55 | 1.725
  /** Целевой вес, кг */
  targetWeightKg: number
  /** Срок похудения в неделях */
  weeks: PlanWeeks
  /** Устаревшее поле — сохраняем для совместимости */
  deficitPct: number
}

export interface Goals {
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
}

export interface FoodInfo {
  id: string
  nameRu: string
  nameEn: string
  /** per 100 g */
  calories: number
  protein: number
  fat: number
  carbs: number
  defaultGrams: number
}

export interface DiaryEntry {
  id: string
  date: string
  foodId: string
  nameRu: string
  grams: number
  calories: number
  protein: number
  fat: number
  carbs: number
  source: 'ai' | 'manual'
  createdAt: number
}

export interface AppState {
  profile: Profile | null
  goals: Goals | null
  entries: DiaryEntry[]
}

export interface RecognitionResult {
  foodId: string
  confidence: number
  alternatives: Array<{ foodId: string; confidence: number }>
}
