<template>
  <div :class="['relative w-full h-full p-4 bg-background-paper border border-border-normal rounded-md', className]">
    <!-- 加载状态 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner">加载中...</div>
    </div>
    
    <!-- 文本内容 -->
    <pre v-if="!loading" class="whitespace-pre-wrap p-2">{{ data }}</pre>
  </div>
</template>

<script setup name="TxtPreviewer">
import { ref, watch } from 'vue'
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

const loading = ref(false)
const data = ref('')
const token = getToken()

async function fetchTxt() {
  loading.value = true
  try {
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      }
    })

    if (!response.ok) {
      throw new Error('Failed to load file')
    }

    const blob = await response.blob()
    const reader = new FileReader()
    reader.readAsText(blob)
    reader.onload = () => {
      data.value = reader.result
      loading.value = false
    }
  } catch (err) {
    console.error('Error loading file:', err)
    emit('error', 'Failed to load file')
    loading.value = false
  }
}

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      fetchTxt()
    } else {
      loading.value = false
      data.value = ''
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

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>

