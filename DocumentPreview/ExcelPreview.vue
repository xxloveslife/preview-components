<template>
  <div
    ref="containerRef"
    :class="[
      'relative w-full h-[80vh] p-4 bg-background-paper border border-border-normal rounded-md overflow-auto',
      className
    ]"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner">加载中...</div>
    </div>
  </div>
</template>

<script setup name="ExcelCsvPreviewer">
import { ref, watch, nextTick } from 'vue'
import jsPreviewExcel from '@js-preview/excel'
import { getToken } from "@/utils/auth";

const props = defineProps({
  className: {
    type: String,
    default: ''
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

const emit = defineEmits(['error'])

const status = ref(true)
const error = ref('')
const containerRef = ref(null)
const isLoading = ref(true)
const token = getToken()

async function fetchExcel() {
  try {
    isLoading.value = true
    if (!containerRef.value) {
      await nextTick()
    }
    let myExcelPreviewer
    if (containerRef.value) {
      myExcelPreviewer = jsPreviewExcel.init(containerRef.value)
    } else {
      // 再次等待 DOM 挂载
      await nextTick()
      if (containerRef.value) {
        myExcelPreviewer = jsPreviewExcel.init(containerRef.value)
      }
    }

    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load Excel file')
    }

    const blob = await response.blob()

    if (myExcelPreviewer) {
      myExcelPreviewer
        .preview(blob)
        .then(() => {
          console.log('Excel preview succeed')
          status.value = true
          isLoading.value = false
        })
        .catch((e) => {
          console.warn('Excel preview failed', e)
          myExcelPreviewer.destroy()
          status.value = false
          emit('error', 'Excel preview failed')
          isLoading.value = false
        })
    } else {
      isLoading.value = false
    }
  } catch (e) {
    console.error('Error loading Excel file:', e)
    emit('error', 'Excel file load failed')
    isLoading.value = false
  }
}

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      // 延后到 DOM patch 后，确保 ref 已赋值
      nextTick(() => fetchExcel())
    }
  },
  { immediate: true, flush: 'post' }
)
</script>

<style scoped>
:deep(.x-spreadsheet-sheet){
  height:70vh !important;
}
.loading-spinner {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}
</style>

