<template>
  <div class="document-container rounded-[10px] overflow-hidden">
    <!-- 加载状态 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner">加载中...</div>
    </div>
    
    <!-- PDF内容 -->
    <div v-if="!loading && !error" class="pdf-wrapper">
      <!-- PDF嵌入组件 -->
      <VuePdfEmbed
        ref="pdfRef"
        :source="pdfSource"
        :page="currentPage"
        :scale="scale"
        @loaded="onPdfLoaded"
        @loading-failed="onPdfError"
        @page-loaded="onPageLoaded"
        class="pdf-embed"
      />
      
      <!-- 高亮层 -->
      <div v-if="highlights.length > 0" class="highlight-layer">
        <div
          v-for="(highlight, index) in visibleHighlights"
          :key="highlight.id || index"
          :style="getHighlightStyle(highlight)"
          class="highlight-item"
          @mouseenter="showHighlightPopup(highlight, $event)"
          @mouseleave="hideHighlightPopup"
        >
          <div v-if="highlight.comment && highlight.comment.text" class="highlight-popup">
            {{ highlight.comment.emoji }} {{ highlight.comment.text }}
          </div>
        </div>
      </div>
      
      <!-- 分页控制 -->
      <div v-if="totalPages > 1" class="page-controls">
        <button @click="prevPage" :disabled="currentPage <= 1" class="page-btn">
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-btn">
          下一页
        </button>
      </div>
      
      <!-- 缩放控制 -->
      <!-- <div class="scale-controls">
        <button @click="zoomOut" class="scale-btn">-</button>
        <span class="scale-info">{{ Math.round(scale * 100) }}%</span>
        <button @click="zoomIn" class="scale-btn">+</button>
      </div> -->
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup name="PdfPreviewer">
import { ref, watch, nextTick } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { getToken } from "@/utils/auth";

const props = defineProps({
  highlights: {
    type: Array,
    default: () => []
  },
  setWidthAndHeight: {
    type: Function,
    default: null
  },
  url: {
    type: String,
    required: true
  },
  id:{
    type: String,
    default: () => ''
  }
})

const emit = defineEmits(['pdf-loaded', 'error'])

const loading = ref(false)
const error = ref('')
const pdfSource = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const pageDimensions = ref(null)
const visibleHighlights = ref([])
const showPopup = ref(false)
const popupHighlight = ref(null)
const popupPosition = ref({ x: 0, y: 0 })
const pdfRef = ref(null)
const token = getToken()

async function loadPDF() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load PDF blob')
    }

    const blob = await response.blob()
    pdfSource.value = await blob.arrayBuffer() 
    loading.value = false
  } catch (err) {
    console.error('Error loading PDF:', err)
    error.value = 'Failed to load PDF document'
    emit('error', error.value)
    loading.value = false
  }
}

function onPdfLoaded(pdf) {
  loading.value = false
  totalPages.value = pdf.numPages
  emit('pdf-loaded', {
    totalPages: totalPages.value,
    currentPage: currentPage.value
  })
}

function onPageLoaded(page) {
  const viewport = page.getViewport({ scale: 1 })
  pageDimensions.value = {
    width: viewport.width,
    height: viewport.height
  }
  if (props.setWidthAndHeight) {
    props.setWidthAndHeight(viewport.width, viewport.height)
  }
  nextTick(() => {
    updateVisibleHighlights()
  })
}

function onPdfError(e) {
  loading.value = false
  error.value = 'Failed to load PDF document'
  console.error('PDF loading error:', e)
  emit('error', error.value)
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 3.0)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.5)
}

function updateVisibleHighlights() {
  visibleHighlights.value = (props.highlights || []).filter(
    (highlight) => highlight.position && highlight.position.pageNumber === currentPage.value
  )
}

function getHighlightStyle(highlight) {
  if (!highlight.position || !pageDimensions.value) {
    return { display: 'none' }
  }
  const { boundingRect } = highlight.position
  return {
    position: 'absolute',
    left: `${(boundingRect.x1 / pageDimensions.value.width) * 100}%`,
    top: `${(boundingRect.y1 / pageDimensions.value.height) * 100}%`,
    width: `${((boundingRect.x2 - boundingRect.x1) / pageDimensions.value.width) * 100}%`,
    height: `${((boundingRect.y2 - boundingRect.y1) / pageDimensions.value.height) * 100}%`,
    backgroundColor: 'rgba(255, 226, 143, 0.6)',
    border: '1px solid #ffd700',
    pointerEvents: 'all',
    zIndex: 10
  }
}

function showHighlightPopup(highlight, event) {
  popupHighlight.value = highlight
  popupPosition.value = { x: event.clientX, y: event.clientY }
  showPopup.value = true
}

function hideHighlightPopup() {
  showPopup.value = false
  popupHighlight.value = null
}

function scrollToHighlight(highlight) {
  if (highlight.position && highlight.position.pageNumber) {
    currentPage.value = highlight.position.pageNumber
    nextTick(() => {
      const highlightElement = document.querySelector(`[data-highlight-id="${highlight.id}"]`)
      if (highlightElement) {
        highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
}

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      loadPDF()
    }
  },
  { immediate: true }
)

watch(
  () => props.highlights,
  (newHighlights) => {
    updateVisibleHighlights()
    if (newHighlights && newHighlights.length > 0) {
      scrollToHighlight(newHighlights[0])
    }
  },
  { deep: true }
)

watch(currentPage, () => {
  updateVisibleHighlights()
})
</script>

<style scoped>
.document-container {
  width: 100%;
  height: calc(100vh - 170px);
  position: relative;
  background: #f5f5f5;
}

.pdf-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.pdf-embed {
  width: 100%;
  height: auto;
}

.highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.highlight-item {
  pointer-events: all;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.highlight-item:hover {
  background-color: rgba(255, 226, 143, 0.8) !important;
}

.highlight-popup {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 20;
}

.page-controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  z-index: 15;
}

.page-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  min-width: 60px;
  text-align: center;
}

.scale-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  z-index: 15;
}

.scale-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scale-info {
  font-size: 12px;
  min-width: 40px;
  text-align: center;
}

.loading-spinner {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.error-message {
  padding: 20px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}

.rounded-\[10px\] {
  border-radius: 10px;
}

.overflow-hidden {
  overflow: hidden;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}
</style>
