// LocalStorage wrapper for persisting user data

const KEYS = {
  API_KEY: 'dtw_api_key',
  STYLE_GUIDE: 'dtw_style_guide',
  MODEL: 'dtw_model'
}

export function saveApiKey(key) {
  localStorage.setItem(KEYS.API_KEY, key)
}

export function getApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || ''
}

export function clearApiKey() {
  localStorage.removeItem(KEYS.API_KEY)
}

export function saveStyleGuide(guide) {
  localStorage.setItem(KEYS.STYLE_GUIDE, guide)
}

export function getStyleGuide() {
  return localStorage.getItem(KEYS.STYLE_GUIDE) || ''
}

export function clearStyleGuide() {
  localStorage.removeItem(KEYS.STYLE_GUIDE)
}

export function saveModel(model) {
  localStorage.setItem(KEYS.MODEL, model)
}

export function getModel() {
  return localStorage.getItem(KEYS.MODEL) || 'gemini-3-flash-preview'
}
