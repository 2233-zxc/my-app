<template>
  <GoodsPanel 
    title="生鲜" 
    sub-title="" 
    :leftBigImg="freshLeftImg"
    :goodsList="goodsList"
  />
</template>

<script setup>
import GoodsPanel from './GoodsPanel.vue';
import freshLeftImg from '@/assets/uploads/fresh_left.png'; 
import { ref, onMounted } from 'vue';
import { getFreshApi } from '@/apis/lauyoutCategoriesApi';

const goodsList = ref([]);

const getFresh = async () => {
  try {
    const data = await getFreshApi();
    goodsList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('请求生鲜商品接口失败：', error.message || error);
    goodsList.value = [];
  }
};

onMounted(() => {
  getFresh();
});
</script>