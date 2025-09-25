<template>
  <div :class="['relative w-full h-full p-4 bg-background-paper border border-border-normal rounded-md image-previewer', className]">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner">加载中...</div>
    </div>
    
    <!-- 图片内容 -->
    <div v-if="!isLoading && imageSrc" class="max-h-[80vh] overflow-auto p-2">
      <img
        :src="imageSrc"
        alt="image"
        class="w-full h-auto max-w-full object-contain"
        @load="handleImageLoad"
      />
    </div>
  </div>
</template>

<script setup name="ImagePreviewer">
import { ref, watch, onBeforeUnmount } from 'vue'
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

const imageSrc = ref(null)
const isLoading = ref(true)
const token = getToken()

async function fetchImage() {
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
      throw new Error('Failed to load image')
    }

    const blob = await response.blob()
    imageSrc.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error('Error loading image:', err)
    emit('error', 'Failed to load image')
  } finally {
    isLoading.value = false
  }
}

function handleImageLoad() {
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
  }
}

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      fetchImage()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
  }
})
</script>

<style scoped>
.loading-spinner {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.image-previewer img {
  max-width: 100%;
  height: auto;
}
</style>

