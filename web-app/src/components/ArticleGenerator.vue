<template>
  <div class="card">
    <div class="card-header">
      <h2>Generate Article</h2>
      <p>Enter a topic and let your digital twin write</p>
    </div>
    
    <div class="input-section">
      <textarea
        v-model="topic"
        placeholder="What should I write about?"
        rows="3"
      ></textarea>
    </div>
    
    <div class="options">
      <label class="select-group">
        <span class="select-label">Model</span>
        <select v-model="model">
          <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
        </select>
      </label>
      <label class="select-group">
        <span class="select-label">Words</span>
        <select v-model="wordCount">
          <option value="300">~300</option>
          <option value="500">~500</option>
          <option value="800">~800</option>
          <option value="1000">~1000</option>
          <option value="1500">~1500</option>
          <option value="2000">~2000</option>
        </select>
      </label>
    </div>
    
    <div class="actions">
      <button class="btn-secondary" @click="$emit('editStyle')">Edit Style</button>
      <button class="btn-primary" @click="generate" :disabled="generating || !topic.trim()">
        {{ generating ? 'Generating...' : 'Generate' }}
      </button>
    </div>
    
    <div class="progress" v-if="generating">
      <div class="progress-bar"></div>
    </div>
    
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { getModel, saveModel } from '../services/storage.js'

const emit = defineEmits(['generate', 'editStyle'])

const topic = ref('')
const model = ref('gemini-3-flash-preview')
const wordCount = ref('800')
const generating = ref(false)
const error = ref('')

onMounted(() => { model.value = getModel() })

function generate() {
  if (!topic.value.trim()) return
  error.value = ''
  generating.value = true
  saveModel(model.value)
  
  emit('generate', { topic: topic.value, model: model.value, wordCount: wordCount.value }, (err) => {
    generating.value = false
    if (err) error.value = err
  })
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

.input-section textarea {
  width: 100%;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;
}

.input-section textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.input-section textarea::placeholder {
  color: var(--text-muted);
}

.options {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.select-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.select-group select {
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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
  padding: 0.75rem 1.25rem;
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
}

.progress {
  margin-top: 1.5rem;
  height: 3px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent);
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 40%; margin-left: 30%; }
  100% { width: 0%; margin-left: 100%; }
}

.error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--error);
  font-size: 0.85rem;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .card {
    padding: 1.25rem;
  }
  
  .card-header p {
    font-size: 0.85rem;
  }
  
  .options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .select-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .select-group select {
    flex: 1;
    min-width: 0;
  }
  
  .actions {
    flex-direction: column-reverse;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
