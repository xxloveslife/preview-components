<template>
  <div>
    <!-- PDF预览 -->
    <section v-if="fileType === 'pdf'" class="document-preview">
      <Suspense>
        <template #default>
          <PdfPreviewer 
            :highlights="highlights" 
            :set-width-and-height="setWidthAndHeight" 
            :url="url" 
            :id="id"
          />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载PDF预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
    
    <!-- Word文档预览 -->
    <section v-if="['doc', 'docx'].includes(fileType)">
      <Suspense>
        <template #default>
          <DocPreviewer :class="className" :url="url" :id="id" />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载Word预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
    
    <!-- 文本预览 -->
    <section v-if="['txt', 'md'].includes(fileType)">
      <Suspense>
        <template #default>
          <TxtPreviewer :class="className" :url="url" :id="id" />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载文本预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
    
    <!-- 图片预览 -->
    <section v-if="['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileType)">
      <Suspense>
        <template #default>
          <ImagePreviewer :class="className" :url="url" :id="id" />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载图片预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
    
    <!-- PPT预览 -->
    <section v-if="fileType === 'pptx'">
      <Suspense>
        <template #default>
          <PptPreviewer :class="className" :url="url" :id="id" />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载PPT预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
    
    <!-- Excel预览 -->
    <section v-if="fileType === 'xlsx'">
      <Suspense>
        <template #default>
          <ExcelPreviewer :class="className" :url="url" :id="id" />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载Excel预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
    
    <!-- CSV预览 -->
    <section v-if="fileType === 'csv'">
      <Suspense>
        <template #default>
          <CSVPreviewer :class="className" :url="url" :id="id" />
        </template>
        <template #fallback>
          <div class="loading-container">
            <div class="loading-spinner">加载CSV预览组件中...</div>
          </div>
        </template>
      </Suspense>
    </section>
  </div>
</template>

<script setup name="DocumentPreview">
import { defineAsyncComponent, onMounted } from 'vue'

// 使用 defineAsyncComponent 进行动态导入
const DocPreviewer = defineAsyncComponent({
  loader: () => import('./DocPreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

const TxtPreviewer = defineAsyncComponent({
  loader: () => import('./TxtPreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

const ImagePreviewer = defineAsyncComponent({
  loader: () => import('./ImagePreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

const PptPreviewer = defineAsyncComponent({
  loader: () => import('./PptPreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

const ExcelPreviewer = defineAsyncComponent({
  loader: () => import('./ExcelPreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

const CSVPreviewer = defineAsyncComponent({
  loader: () => import('./CSVPreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

const PdfPreviewer = defineAsyncComponent({
  loader: () => import('./PdfPreview.vue'),
  errorComponent: () => import('./ErrorPreview.vue'),
  delay: 200,
  timeout: 3000
})

// 预加载常用组件（可选）
onMounted(() => {
  // 在空闲时间预加载常用组件
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      // 预加载图片和文本预览组件（最常用且轻量）
      import('./ImagePreview.vue')
      import('./TxtPreview.vue')
    })
  }
})

const props = defineProps({
  fileType: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  highlights: {
    type: Array,
    default: () => []
  },
  setWidthAndHeight: {
    type: Function,
    default: null
  },
  id:{
    type: String,
    default: ''
  }
  
})
</script>

<style scoped>
.document-preview {
  width: 100%;
  height: calc(100vh - 170px);
  position: relative;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
}

.loading-spinner {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  color: #666;
  font-size: 14px;
}
</style>

