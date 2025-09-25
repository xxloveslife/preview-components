// 工具函数
export const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    if (options.responseType === 'blob') {
      return { data: await response.blob() }
    }
    
    return { data: await response.json() }
  } catch (error) {
    console.error('Request error:', error)
    if (options.onError) {
      options.onError(error)
    }
    throw error
  }
}

// 消息提示工具
export const message = {
  error: (text) => {
    console.error(text)
    // 这里可以集成实际的UI消息组件
    // 比如 Element Plus 的 ElMessage
  },
  success: (text) => {
    console.log(text)
  },
  warning: (text) => {
    console.warn(text)
  }
}

// 尺寸监听工具
export const useResizeObserver = (callback) => {
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      callback(entry.contentRect.width, entry.contentRect.height)
    }
  })
  
  return {
    observe: (element) => {
      if (element) {
        resizeObserver.observe(element)
      }
    },
    unobserve: (element) => {
      if (element) {
        resizeObserver.unobserve(element)
      }
    },
    disconnect: () => {
      resizeObserver.disconnect()
    }
  }
}

// 高亮文本工具
export const highlightPattern = (text, pattern, pageNumber) => {
  if (pageNumber === 2) {
    return `<mark>${text}</mark>`
  }
  if (text.trim() !== '' && pattern.match(text)) {
    return `<mark>${text}</mark>`
  }
  return text.replace(pattern, (value) => `<mark>${value}</mark>`)
}






// 错误处理工具
export const useCatchDocumentError = async (url) => {
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (data.code !== 0) {
      return data?.message || 'Document load failed'
    }
    return ''
  } catch (error) {
    return 'Document load failed'
  }
}

// 类名合并工具
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
