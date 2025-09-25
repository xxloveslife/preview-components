<template>
  <div
    ref="containerRef"
    :class="[
      'relative w-full h-[80vh]  p-4 bg-background-paper border border-border-normal rounded-md',
      className
    ]"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner">加载中...</div>
    </div>
    <div class="">
      <div class="flex flex-col gap-4">
        <div ref="wrapper" />
      </div>
    </div>
  </div>
</template>

<script setup name="PptPreviewer">
import { ref, watch } from 'vue'
import { init } from 'pptx-preview'
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

const containerRef = ref(null)
const isLoading = ref(true)
const token = getToken()

async function fetchDocument() {
  isLoading.value = true
  try {
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      }
    })

    if (!response.ok) {
      throw new Error('Document parsing failed')
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    if (containerRef.value) {
      let width = 500
      let height = containerRef.value.clientHeight // 使用容器实际高度以适配滚动
      width = containerRef.value.clientWidth

      const pptxPreviewer = init(containerRef.value, {
        width: width,
        height: height,
      })
      pptxPreviewer
        .preview(arrayBuffer)
        .then(() => {
          isLoading.value = false
        })
        .catch((e) => {
          console.warn('PPT preview failed', e)
          isLoading.value = false
          emit('error', 'ppt parse failed')
        })
    } else {
      isLoading.value = false
    }
  } catch (err) {
    console.error('Error loading document:', err)
    emit('error', 'ppt parse failed')
    isLoading.value = false
  }
}

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      fetchDocument()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.loading-spinner {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.overflow-auto {
  overflow: auto;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-4 > * + * {
  margin-top: 1rem;
}
</style>

