<template>
  <div class="card">
    <div class="card-header">
      <h2>Gemini API Key</h2>
      <p>Connect your Google Gemini key to get started</p>
    </div>
    
    <div class="input-group">
      <div class="input-wrapper">
        <input
          :type="showKey ? 'text' : 'password'"
          v-model="apiKey"
          placeholder="Enter your Gemini API key"
          @input="onInput"
        />
        <button class="input-action" @click="showKey = !showKey">
          {{ showKey ? 'Hide' : 'Show' }}
        </button>
      </div>
    </div>
    
    <div class="status" v-if="status" :class="status.type">
      {{ status.message }}
    </div>
    
    <div class="actions">
      <button 
        class="btn-primary" 
        @click="saveKey" 
        :disabled="!apiKey || saving"
      >
        {{ saving ? 'Verifying...' : 'Save Key' }}
      </button>
      <button 
        class="btn-secondary" 
        @click="clearKey" 
        v-if="hasSavedKey"
      >
        Clear
      </button>
    </div>
    
    <p class="hint">
      Your key is stored locally in your browser.
      <a href="https://aistudio.google.com/apikey" target="_blank">Get a Gemini API key →</a>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { saveApiKey, getApiKey, clearApiKey } from '../services/storage.js'
import { testApiKey } from '../services/gemini.js'

const emit = defineEmits(['keyUpdated'])

const apiKey = ref('')
const showKey = ref(false)
const saving = ref(false)
const hasSavedKey = ref(false)
const status = ref(null)

onMounted(() => {
  const saved = getApiKey()
  if (saved) {
    apiKey.value = saved
    hasSavedKey.value = true
    status.value = { type: 'success', message: '✓ Key loaded from storage' }
    emit('keyUpdated', saved)
  }
})

function onInput() {
  status.value = null
}

async function saveKey() {
  if (!apiKey.value) return
  
  saving.value = true
  status.value = { type: 'info', message: 'Testing API key...' }
  
  try {
    const result = await testApiKey(apiKey.value)
    
    if (result.valid) {
      saveApiKey(apiKey.value)
      hasSavedKey.value = true
      status.value = { type: 'success', message: '✓ Key saved and verified' }
      emit('keyUpdated', apiKey.value)
    } else {
      status.value = { type: 'error', message: `Invalid key: ${result.error}` }
    }
  } catch (error) {
    status.value = { type: 'error', message: `Error: ${error.message}` }
  } finally {
    saving.value = false
  }
}

function clearKey() {
  clearApiKey()
  apiKey.value = ''
  hasSavedKey.value = false
  status.value = { type: 'info', message: 'Key cleared' }
  emit('keyUpdated', '')
}
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 2rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.card-header p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.input-group {
  margin-bottom: 1rem;
}

.input-wrapper {
  display: flex;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.15s;
}

.input-wrapper:focus-within {
  border-color: var(--accent);
}

.input-wrapper input {
  flex: 1;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.input-wrapper input:focus {
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.input-action {
  padding: 0 1rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s;
}

.input-action:hover {
  color: var(--text-secondary);
}

.status {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
}

.status.success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status.info {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-light);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-light);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  background: var(--bg-elevated);
  border-color: var(--border-hover);
}

.hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.hint a {
  color: var(--accent-light);
}
</style>
