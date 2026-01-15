<template>
  <div class="card">
    <div class="card-header">
      <h2>Upload Samples</h2>
      <p>Add 3-5 of your writing samples for best results</p>
    </div>
    
    <div 
      class="dropzone"
      :class="{ 'dropzone--active': isDragging, 'dropzone--filled': files.length > 0 }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput"
        type="file" 
        multiple 
        accept=".txt,.md"
        @change="handleFileSelect"
        hidden
      />
      
      <div class="dropzone-content" v-if="files.length === 0">
        <div class="dropzone-icon">↑</div>
        <p class="dropzone-text">Drop files here or click to browse</p>
        <p class="dropzone-hint">.txt or .md files</p>
      </div>
      
      <div class="file-list" v-else>
        <div class="file-item" v-for="(file, index) in files" :key="index">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-meta">{{ file.wordCount.toLocaleString() }} words</span>
          <button class="file-remove" @click.stop="removeFile(index)">×</button>
        </div>
      </div>
    </div>
    
    <div class="stats" v-if="files.length > 0">
      <span>{{ files.length }} file{{ files.length !== 1 ? 's' : '' }}</span>
      <span class="stats-divider">•</span>
      <span>{{ totalWords.toLocaleString() }} total words</span>
    </div>
    
    <div class="actions" v-if="files.length > 0">
      <button 
        class="btn-primary" 
        @click="analyzeStyle" 
        :disabled="analyzing"
      >
        {{ analyzing ? 'Analyzing...' : 'Analyze My Style' }}
      </button>
      <button class="btn-secondary" @click="clearFiles">
        Clear All
      </button>
    </div>
    
    <div class="progress" v-if="analyzing">
      <div class="progress-bar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'

const emit = defineEmits(['analyze'])

const fileInput = ref(null)
const files = ref([])
const isDragging = ref(false)
const analyzing = ref(false)

const totalWords = computed(() => {
  return files.value.reduce((sum, f) => sum + f.wordCount, 0)
})

function triggerFileInput() {
  if (files.value.length > 0) return
  fileInput.value?.click()
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

async function processFiles(fileList) {
  for (const file of fileList) {
    if (!file.name.match(/\.(txt|md)$/i)) continue
    const text = await file.text()
    files.value.push({
      name: file.name,
      content: text,
      wordCount: countWords(text)
    })
  }
}

async function handleDrop(e) {
  isDragging.value = false
  await processFiles(e.dataTransfer.files)
}

async function handleFileSelect(e) {
  await processFiles(e.target.files)
  e.target.value = ''
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function clearFiles() {
  files.value = []
}

function analyzeStyle() {
  const combinedSamples = files.value
    .map((f, i) => `--- Sample ${i + 1}: ${f.name} ---\n\n${f.content}`)
    .join('\n\n')
  
  analyzing.value = true
  emit('analyze', combinedSamples, () => {
    analyzing.value = false
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

.dropzone {
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone:hover,
.dropzone--active {
  border-color: var(--accent);
  background: var(--accent-glow);
}

.dropzone--filled {
  cursor: default;
  border-style: solid;
  padding: 1rem;
}

.dropzone-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  background: var(--bg-elevated);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-muted);
}

.dropzone-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.dropzone-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.file-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.file-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  padding: 0;
  cursor: pointer;
  line-height: 1;
}

.file-remove:hover {
  color: var(--error);
}

.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.stats-divider {
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
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
</style>
