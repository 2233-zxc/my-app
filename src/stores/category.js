import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCategoryApi } from '@/apis/layoutAPI'

export const useCategoryStore = defineStore('category', () => {
  const categoryList = ref([])
  const loading = ref(false)

  const getCategory = async () => {
    try {
      loading.value = true

      // ✅ 直接获取数据（已经是后端返回的 data 数组）
      const data = await getCategoryApi()

      // ✅ 字段映射：headerNav → name
      const formatData = data.map(item => ({
        id: item.id,
        name: item.headerNav
      }))

      categoryList.value = formatData
      console.log('导航数据获取成功：', categoryList.value)
    } catch (error) {
      // 拦截器已自动弹出 ElMessage 错误提示
      console.error('获取导航数据失败：', error)
      categoryList.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    categoryList,
    loading,
    getCategory
  }
})