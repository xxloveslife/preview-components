<template>
  <div
    ref="containerRef"
    :class="[
      'relative w-full h-full p-4 bg-background-paper border border-border-normal rounded-md',
      'overflow-auto max-h-[80vh] p-2'
    ]"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="loading-spinner">加载中...</div>
    </div>
    
    <!-- CSV表格 -->
    <table v-else-if="data" class="min-w-full divide-y divide-border-normal">
      <thead class="bg-background-header-bar">
        <tr>
          <th
            v-for="(header, index) in data.headers"
            :key="`header-${index}`"
            class="px-6 py-3 text-left text-sm font-medium text-text-primary"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-background-paper divide-y divide-border-normal">
        <tr v-for="(row, rowIndex) in data.rows" :key="`row-${rowIndex}`">
          <td
            v-for="(cell, cellIndex) in row"
            :key="`cell-${rowIndex}-${cellIndex}`"
            class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary"
          >
            {{ cell || '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup name="CSVFileViewer">
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

const data = ref(null)
const isLoading = ref(true)
const containerRef = ref(null)
const token = getToken()

function parseCSV(csvText) {
  console.log('Parsing CSV data:', csvText)
  const lines = csvText.split('\n')
  const headers = lines[0].split(',').map((header) => header.trim())
  const rows = lines
    .slice(1)
    .map((line) => line.split(',').map((cell) => cell.trim()))

  return { headers, rows }
}

async function loadCSV() {
  try {
    isLoading.value = true
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      }
    })

    if (!response.ok) {
      throw new Error('file load failed')
    }

    const blob = await response.blob()
    const reader = new FileReader()
    reader.readAsText(blob)
    reader.onload = () => {
      const parsedData = parseCSV(reader.result)
      console.log('file loaded successfully', reader.result)
      data.value = parsedData
    }
  } catch (error) {
    console.error('Error loading CSV file:', error)
    emit('error', 'CSV file parse failed')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl) {
      loadCSV()
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

.min-w-full {
  min-width: 100%;
}

.divide-y > * + * {
  border-top-width: 1px;
}

.divide-border-normal > * + * {
  border-color: #e5e7eb;
}

.bg-background-header-bar {
  background-color: #f9fafb;
}

.bg-background-paper {
  background-color: #ffffff;
}

.text-text-primary {
  color: #111827;
}

.text-text-secondary {
  color: #6b7280;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

.whitespace-nowrap {
  white-space: nowrap;
}
</style>

