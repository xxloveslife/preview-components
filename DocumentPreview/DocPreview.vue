<template>
  <div :class="['relative w-full h-[80vh] p-4 bg-background-paper border border-border-normal rounded-md', className]">
    <!-- 加载状态 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner loading-center">加载中...</div>
    </div>
    
    <!-- 文档内容 -->
    <div v-if="!loading" class="max-h-[80vh] overflow-auto p-2">
      <div v-html="htmlContent"></div>
    </div>
  </div>
</template>

<script setup name="DocPreviewer">
import { ref, watch } from 'vue'
import mammoth from 'mammoth'
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

const htmlContent = ref('')
const loading = ref(false)

const token = getToken(); 

async function fetchDocument() {
  loading.value = true
  try {
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      // body: JSON.stringify({object_id: props.id})
    })

    if (!response.ok) {
      throw new Error('Document parsing failed')
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })

    htmlContent.value = result.value
      .replace(/<p>/g, '<p class="mb-2">')
      .replace(/<h(\d)>/g, '<h$1 class="font-semibold mt-4 mb-2">')
  } catch (err) {
    console.error('Error loading document:', err)
    emit('error', 'Document parsing failed')
  } finally {
    loading.value = false
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
.loading-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

