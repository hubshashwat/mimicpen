<template>
  <div class="app">
    <!-- Animated flame background -->
    <div class="flame-container">
      <div class="flame"></div>
    </div>
    
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">✍️</span>
          <span class="logo-text">MimicPen</span>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="hero" v-if="currentStep === 1 && !apiKey">
        <h1>Create your personal <span class="text-accent">writing AI</span></h1>
        <p class="hero-sub">Upload your writing samples. Get an AI that writes exactly like you.</p>
      </div>

      <!-- Progress Steps -->
      <nav class="steps">
        <button
          v-for="(step, idx) in steps"
          :key="idx"
          class="step"
          :class="{ 
            active: currentStep === idx + 1, 
            completed: currentStep > idx + 1,
            clickable: canGoToStep(idx + 1)
          }"
          @click="canGoToStep(idx + 1) && goToStep(idx + 1)"
        >
          <span class="step-indicator">
            <span v-if="currentStep > idx + 1">✓</span>
            <span v-else>{{ idx + 1 }}</span>
          </span>
          <span class="step-label">{{ step }}</span>
        </button>
      </nav>

      <!-- Content -->
      <div class="content">
        <section v-if="currentStep === 1" class="step-content">
          <ApiKeyInput @keyUpdated="onApiKeyUpdated" />
          <div class="step-action" v-if="apiKey">
            <button class="btn-primary" @click="goToStep(hasStyleGuide ? 4 : 2)">
              {{ hasStyleGuide ? 'Go to Generate' : 'Continue' }}
              <span>→</span>
            </button>
          </div>
        </section>

        <section v-if="currentStep === 2" class="step-content">
          <FileUploader @analyze="onAnalyze" />
        </section>

        <section v-if="currentStep === 3" class="step-content">
          <StyleGuideEditor 
            :styleGuide="styleGuide" 
            @save="onSaveStyleGuide"
            @back="goToStep(2)"
          />
        </section>

        <section v-if="currentStep === 4" class="step-content step-content--wide">
          <ArticleGenerator 
            @generate="onGenerate"
            @editStyle="goToStep(3)"
          />
          <ArticlePreview 
            :article="generatedArticle"
            @newArticle="generatedArticle = ''"
          />
        </section>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <span class="footer-badge">🔒 Client-side only</span>
        <span class="footer-text">Powered by <b>Google Gemini</b> • Your data never leaves your browser</span>
        <button class="reset-btn" @click="resetAll">Reset All</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import FileUploader from './components/FileUploader.vue'
import StyleGuideEditor from './components/StyleGuideEditor.vue'
import ArticleGenerator from './components/ArticleGenerator.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import { getApiKey, getStyleGuide, saveStyleGuide as saveGuide, getModel } from './services/storage.js'
import { analyzeWritingStyle, generateArticle } from './services/gemini.js'

const steps = ['API Key', 'Upload', 'Style', 'Generate']
const currentStep = ref(1)
const apiKey = ref('')
const styleGuide = ref('')
const generatedArticle = ref('')

const hasStyleGuide = computed(() => !!styleGuide.value)

onMounted(() => {
  apiKey.value = getApiKey()
  styleGuide.value = getStyleGuide()
  
  if (apiKey.value && styleGuide.value) {
    currentStep.value = 4
  } else if (apiKey.value) {
    currentStep.value = 2
  }
})

function canGoToStep(step) {
  if (step === 1) return true
  if (step === 2) return !!apiKey.value
  if (step === 3) return !!apiKey.value && !!styleGuide.value
  if (step === 4) return !!apiKey.value && !!styleGuide.value
  return false
}

function goToStep(step) {
  currentStep.value = step
}

function onApiKeyUpdated(key) {
  apiKey.value = key
}

async function onAnalyze(samples, callback) {
  try {
    const model = getModel()
    const result = await analyzeWritingStyle(apiKey.value, model, samples)
    styleGuide.value = result
    currentStep.value = 3
    callback()
  } catch (error) {
    callback()
    alert(`Error: ${error.message}`)
  }
}

function onSaveStyleGuide(guide) {
  styleGuide.value = guide
  saveGuide(guide)
  currentStep.value = 4
}

async function onGenerate({ topic, model, wordCount }, callback) {
  try {
    const promptWithLength = `${topic}\n\n[Target length: approximately ${wordCount} words]`
    const result = await generateArticle(apiKey.value, model, promptWithLength, styleGuide.value)
    generatedArticle.value = result
    callback()
  } catch (error) {
    callback(error.message)
  }
}

function resetAll() {
  if (confirm('Clear all data? This will remove your API key, style guide, and all settings.')) {
    localStorage.clear()
    location.reload()
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Header */
.header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.25rem;
}

.logo-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* Main */
.main {
  flex: 1;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* Hero */
.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.text-accent {
  color: var(--accent-light);
}

.hero-sub {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0 auto;
}

/* Steps */
.steps {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: default;
  transition: all 0.15s;
}

.step.clickable {
  cursor: pointer;
}

.step.clickable:hover {
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.step.active {
  background: var(--bg-card);
  border-color: var(--border-default);
  color: var(--text-primary);
}

.step.completed {
  color: var(--success);
}

.step-indicator {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
}

.step.active .step-indicator {
  background: var(--accent);
  color: white;
}

.step.completed .step-indicator {
  background: var(--success);
  color: white;
}

.step-label {
  display: none;
}

@media (min-width: 480px) {
  .step-label {
    display: inline;
  }
}

/* Content */
.content {
  width: 100%;
}

.step-content {
  animation: fadeIn 0.2s ease;
}

.step-content--wide {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-action {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

/* Footer */
.footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-subtle);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.footer-badge {
  background: var(--bg-elevated);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.reset-btn {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--error);
  color: var(--error);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-primary:hover {
  background: var(--accent-light);
  box-shadow: 0 8px 24px var(--accent-glow-strong);
  transform: translateY(-1px);
}
</style>
