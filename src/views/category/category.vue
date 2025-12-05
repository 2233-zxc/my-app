<template>
  <div class="category-page">
    <!-- 动态渲染分类子组件 -->
    <component 
      :is="currentCategoryComponent" 
      :category-id="categoryId"
    />

    <!-- 无匹配分类的兜底 -->
    <div v-if="!currentCategoryComponent" class="empty">
      暂无该分类内容
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// 导入需要的分类子组件
import FreshComponent from '@/components/category/FreshComponent.vue'

// 1. 获取路由实例并提取ID参数
const route = useRoute()
const categoryId = computed(() => route.params.id)

// 2. 分类ID与组件的映射关系
const categoryMap = {
  '1': FreshComponent, // id=1对应生鲜组件
  // 可扩展其他分类：如 '2': SnackComponent
}

// 3. 计算当前要渲染的组件
const currentCategoryComponent = computed(() => {
  return categoryMap[categoryId.value] || null
})
</script>

<style scoped>
.category-page {
  min-height: 80vh;
  padding: 20px;
}

.empty {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #999;
}
</style>