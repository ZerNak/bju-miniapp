import * as tf from '@tensorflow/tfjs'
import foods from '../data/foods.json'
import type { FoodInfo, RecognitionResult } from '../types'

const FOOD101_MODEL_URL =
  'https://tomwalczak.github.io/food-vision-mobile-tensorflowjs/models/mobilenet_v2_100pc_js_model/model.json'

const CACHE_KEY = 'indexeddb://bju-food101-mobilenet-v2'

/** Food-101 class index → id (sorted by original dataset order) */
const FOOD101_IDS: string[] = [
  'apple_pie',
  'baby_back_ribs',
  'baklava',
  'beef_carpaccio',
  'beef_tartare',
  'beet_salad',
  'beignets',
  'bibimbap',
  'bread_pudding',
  'breakfast_burrito',
  'bruschetta',
  'caesar_salad',
  'cannoli',
  'caprese_salad',
  'carrot_cake',
  'ceviche',
  'cheese_plate',
  'cheesecake',
  'chicken_curry',
  'chicken_quesadilla',
  'chicken_wings',
  'chocolate_cake',
  'chocolate_mousse',
  'churros',
  'clam_chowder',
  'club_sandwich',
  'crab_cakes',
  'creme_brulee',
  'croque_madame',
  'cup_cakes',
  'deviled_eggs',
  'donuts',
  'dumplings',
  'edamame',
  'eggs_benedict',
  'escargots',
  'falafel',
  'filet_mignon',
  'fish_and_chips',
  'foie_gras',
  'french_fries',
  'french_onion_soup',
  'french_toast',
  'fried_calamari',
  'fried_rice',
  'frozen_yogurt',
  'garlic_bread',
  'gnocchi',
  'greek_salad',
  'grilled_cheese_sandwich',
  'grilled_salmon',
  'guacamole',
  'gyoza',
  'hamburger',
  'hot_and_sour_soup',
  'hot_dog',
  'huevos_rancheros',
  'hummus',
  'ice_cream',
  'lasagna',
  'lobster_bisque',
  'lobster_roll_sandwich',
  'macaroni_and_cheese',
  'macarons',
  'miso_soup',
  'mussels',
  'nachos',
  'omelette',
  'onion_rings',
  'oysters',
  'pad_thai',
  'paella',
  'pancakes',
  'panna_cotta',
  'peking_duck',
  'pho',
  'pizza',
  'pork_chop',
  'poutine',
  'prime_rib',
  'pulled_pork_sandwich',
  'ramen',
  'ravioli',
  'red_velvet_cake',
  'risotto',
  'samosa',
  'sashimi',
  'scallops',
  'seaweed_salad',
  'shrimp_and_grits',
  'spaghetti_bolognese',
  'spaghetti_carbonara',
  'spring_rolls',
  'steak',
  'strawberry_shortcake',
  'sushi',
  'tacos',
  'takoyaki',
  'tiramisu',
  'tuna_tartare',
  'waffles',
]

const foodById = new Map((foods as FoodInfo[]).map((f) => [f.id, f]))

let modelPromise: Promise<tf.GraphModel> | null = null
let status: 'idle' | 'loading' | 'ready' | 'error' = 'idle'

export function getModelStatus() {
  return status
}

export function getFood(id: string): FoodInfo | undefined {
  return foodById.get(id)
}

export function listFoods(): FoodInfo[] {
  return foods as FoodInfo[]
}

export function searchFoods(query: string): FoodInfo[] {
  const q = query.trim().toLowerCase()
  if (!q) return listFoods().slice(0, 40)
  return listFoods()
    .filter(
      (f) =>
        f.nameRu.toLowerCase().includes(q) ||
        f.nameEn.toLowerCase().includes(q) ||
        f.id.includes(q.replace(/\s+/g, '_')),
    )
    .slice(0, 40)
}

async function loadModel(): Promise<tf.GraphModel> {
  if (!modelPromise) {
    status = 'loading'
    modelPromise = (async () => {
      await tf.ready()
      try {
        const cached = await tf.loadGraphModel(CACHE_KEY)
        status = 'ready'
        return cached
      } catch {
        // first run — fetch open-source Food-101 MobileNet (tomwalczak)
      }

      const model = await tf.loadGraphModel(FOOD101_MODEL_URL)
      try {
        await model.save(CACHE_KEY)
      } catch {
        // cache optional
      }
      status = 'ready'
      return model
    })().catch((err) => {
      status = 'error'
      modelPromise = null
      throw err
    })
  }
  return modelPromise
}

/** Warm up model in background (optional). */
export function preloadModel(): void {
  void loadModel().catch(() => undefined)
}

function topK(probs: Float32Array | Int32Array | Uint8Array, k: number) {
  const indexed = Array.from(probs as Float32Array).map((p, i) => ({ i, p }))
  indexed.sort((a, b) => b.p - a.p)
  return indexed.slice(0, k)
}

export async function recognizeFood(
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
): Promise<RecognitionResult> {
  const model = await loadModel()

  const result = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(image)
    const resized = tf.image.resizeBilinear(pixels, [224, 224])
    const normalized = resized.div(255).expandDims(0)
    const logits = model.predict(normalized) as tf.Tensor
    const data = logits.dataSync()
    return topK(data, 5)
  })

  const alternatives = result
    .map(({ i, p }) => ({
      foodId: FOOD101_IDS[i] ?? 'pizza',
      confidence: p,
    }))
    .filter((a) => foodById.has(a.foodId))

  if (!alternatives.length) {
    throw new Error('Не удалось распознать блюдо')
  }

  return {
    foodId: alternatives[0].foodId,
    confidence: alternatives[0].confidence,
    alternatives,
  }
}
