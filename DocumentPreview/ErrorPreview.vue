<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <div class="error-message">预览组件加载失败</div>
      <div class="error-detail">请刷新页面重试</div>
    </div>
  </div>
</template>

<script setup name="ErrorPreview">
// 错误组件，当预览组件加载失败时显示
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-content {
  text-align: center;
  color: #dc2626;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.error-message {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.error-detail {
  font-size: 14px;
  color: #6b7280;
}
</style>
