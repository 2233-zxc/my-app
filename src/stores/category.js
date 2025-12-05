import { ref } from 'vue'
import { defineStore } from 'pinia'
// 导入API封装文件的接口函数
import { getCategoryApi } from '@/apis/layoutAPI'

export const useCategoryStore = defineStore('category', () =>{
  const categoryList = ref([])
  const loading = ref(false)

  const getCategory = async () => {
    try {
      loading.value = true
      // 调用API封装的函数
      const res = await getCategoryApi()
      
      //校验后端返回的code,处理数据（headerNav → name）
      if (res.code === 200) {
        // 字段映射：把headerNav转为name，适配组件模板
        const formatData = res.data.map(item => ({
          id: item.id,
          name: item.headerNav // 核心映射
        }))
        categoryList.value = formatData
        console.log('导航数据获取成功：', categoryList.value)
      } else {
        console.error('获取导航数据失败：', res.message)
        categoryList.value = []
      }
    } catch (error) {
      console.error('获取导航数据失败：', error.message)
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