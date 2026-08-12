import { calcGoals, resolveTargetWeight, resolveWeeks } from './nutrition'
import type { AppState, DiaryEntry, Goals, Profile } from '../types'

const KEY = 'bju-miniapp-v1'

const empty: AppState = {
  profile: null,
  goals: null,
  entries: [],
}

function normalizeProfile(raw: Profile): Profile {
  const targetWeightKg = resolveTargetWeight(raw)
  const weeks = resolveWeeks(raw)
  return {
    ...raw,
    targetWeightKg,
    weeks,
    deficitPct: raw.deficitPct ?? 15,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty, entries: [] }
    const parsed = JSON.parse(raw) as AppState
    const profile = parsed.profile ? normalizeProfile(parsed.profile) : null
    const goals = profile ? calcGoals(profile) : (parsed.goals ?? null)
    return {
      profile,
      goals,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  } catch {
    return { ...empty, entries: [] }
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function saveProfile(profile: Profile, goals: Goals): AppState {
  const state = loadState()
  const next = { ...state, profile, goals }
  saveState(next)
  return next
}

export function addEntry(entry: DiaryEntry): AppState {
  const state = loadState()
  const next = { ...state, entries: [entry, ...state.entries] }
  saveState(next)
  return next
}

export function removeEntry(id: string): AppState {
  const state = loadState()
  const next = { ...state, entries: state.entries.filter((e) => e.id !== id) }
  saveState(next)
  return next
}

export function clearAll(): AppState {
  saveState({ ...empty, entries: [] })
  return { ...empty, entries: [] }
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
