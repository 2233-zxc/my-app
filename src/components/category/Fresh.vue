<template>
  <GoodsPanel 
    title="生鲜" 
    sub-title="" 
    :leftBigImg="freshLeftImg"
    :goodsList="goodsList"
  /><!-- 直接绑定同步导入的图片路径 -->
</template>

<script setup>
import GoodsPanel from './GoodsPanel.vue';
// 导入同步导出的图片（此时 freshLeftImg 是 Vite 处理后的绝对路径字符串）
import freshLeftImg from '@/assets/uploads/fresh_left.png'; 
import { ref, onMounted } from 'vue';
import { getFreshApi } from '@/apis/lauyoutCategoriesApi';

// 响应式商品列表
const goodsList = ref([]);

// 获取生鲜商品数据
const getFresh = async()=>{
  try {
    const res = await getFreshApi();
    // 严谨的空值+状态码校验
    if (res && res.code === 200) { 
      goodsList.value = res.data || []; // 兜底空数组，避免渲染报错
    } else {
      console.error('接口返回失败：', res?.message || '未知错误');
    }
  } catch (error) {
    console.error('请求接口失败：', error);
    goodsList.value = []; // 异常时清空列表，避免脏数据
  }
};

// 组件挂载后请求数据
onMounted(() => {
  getFresh();
});
</script>

<style scoped>
/* 可选：添加 scoped 隔离样式，避免样式污染 */
</style>