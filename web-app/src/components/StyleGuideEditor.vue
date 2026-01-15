<template>
  <div class="card">
    <div class="card-header">
      <h2>Your Style Guide</h2>
      <p>Review and customize your writing fingerprint</p>
    </div>
    
    <div class="editor">
      <textarea
        v-model="localGuide"
        placeholder="Your style guide will appear here..."
        rows="14"
      ></textarea>
    </div>
    
    <div class="footer">
      <div class="meta">
        {{ wordCount }} words · {{ charCount.toLocaleString() }} chars
      </div>
      
      <div class="actions">
        <button class="btn-secondary" @click="$emit('back')">← Back</button>
        <button class="btn-secondary" @click="copyGuide" :disabled="!localGuide">
          {{ copied ? '✓ Copied' : 'Copy' }}
        </button>
        <button class="btn-primary" @click="saveGuide" :disabled="!localGuide">
          Save & Continue →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  styleGuide: { type: String, default: '' }
})

const emit = defineEmits(['save', 'back'])

const localGuide = ref(props.styleGuide)
const copied = ref(false)

watch(() => props.styleGuide, (val) => { localGuide.value = val })

const wordCount = computed(() => localGuide.value.trim().split(/\s+/).filter(w => w).length)
const charCount = computed(() => localGuide.value.length)

async function copyGuide() {
  await navigator.clipboard.writeText(localGuide.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function saveGuide() {
  emit('save', localGuide.value)
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

.editor textarea {
  width: 100%;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.7;
  resize: vertical;
  transition: border-color 0.15s;
}

.editor textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.85rem;
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
  padding: 0.625rem 1rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-elevated);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
