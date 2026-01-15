<template>
  <div class="card">
    <div class="card-header">
      <h2>Generated Article</h2>
      <div class="header-actions" v-if="article">
        <button class="btn-icon" @click="copyArticle" :title="copied ? 'Copied!' : 'Copy'">
          {{ copied ? '✓' : '📋' }}
        </button>
        <button class="btn-icon" @click="downloadArticle" title="Download">💾</button>
        <button class="btn-secondary" @click="$emit('newArticle')">New</button>
      </div>
    </div>
    
    <div class="preview" v-if="article">
      <div class="markdown" v-html="renderedHtml"></div>
    </div>
    
    <div class="empty" v-else>
      <p>Your article will appear here</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({ article: { type: String, default: '' } })
defineEmits(['newArticle'])

const copied = ref(false)

const renderedHtml = computed(() => {
  if (!props.article) return ''
  let html = props.article
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
  return `<p>${html}</p>`
})

async function copyArticle() {
  await navigator.clipboard.writeText(props.article)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function downloadArticle() {
  const lines = props.article.split('\n')
  let title = lines[0].replace(/^#+\s*/, '').trim() || 'article'
  title = title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').slice(0, 50)
  const blob = new Blob([props.article], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.md`
  a.click()
  URL.revokeObjectURL(url)
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: var(--bg-elevated);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--bg-elevated);
}

.preview {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  max-height: 450px;
  overflow-y: auto;
}

.markdown {
  color: var(--text-primary);
  line-height: 1.8;
  font-size: 0.95rem;
}

.markdown :deep(h1) { font-size: 1.5rem; margin: 0 0 1rem; font-weight: 700; }
.markdown :deep(h2) { font-size: 1.25rem; margin: 1.25rem 0 0.75rem; font-weight: 600; }
.markdown :deep(h3) { font-size: 1.1rem; margin: 1rem 0 0.5rem; font-weight: 600; }
.markdown :deep(p) { margin: 0 0 1rem; color: rgba(255,255,255,0.85); }
.markdown :deep(strong) { color: var(--text-primary); }
.markdown :deep(code) { background: var(--accent-glow); padding: 0.125rem 0.375rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; color: var(--accent-light); }
.markdown :deep(pre) { background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; margin: 1rem 0; }
.markdown :deep(pre code) { background: none; padding: 0; color: rgba(255,255,255,0.8); }
.markdown :deep(blockquote) { border-left: 2px solid var(--accent); padding-left: 1rem; color: var(--text-secondary); font-style: italic; margin: 1rem 0; }
.markdown :deep(li) { margin: 0.25rem 0; padding-left: 0.5rem; }

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
</style>
