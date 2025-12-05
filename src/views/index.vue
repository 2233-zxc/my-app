<template>
   <LayoutFixed />
   <LayoutNav />
   <LayoutHeader />
   <router-view />
   <LayoutFooter />
</template>
<script setup>
import LayoutFixed from './Layout/LayoutFixed.vue';
import LayoutNav from '@/views/Layout/LayoutNav.vue';
import LayoutHeader from '@/views/Layout/LayoutHeader.vue';
import LayoutFooter from '@/views/Layout/LayoutFooter.vue';
import { onMounted } from 'vue';

// 1. 导入Pinia Store
import { useCategoryStore } from '@/stores/category'

// 2. 创建Pinia实例
const categoryStore = useCategoryStore()

// 3. 解构方法
const { getCategory } = categoryStore

// 4. 组件挂载时调用Pinia的方法加载数据
onMounted(() => {
  getCategory()
})
</script>