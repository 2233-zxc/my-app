<template>
    <GoodsPanel title="生鲜" sub-title=""  :goodsList="goodsList">
        
    </GoodsPanel>
</template>
<script setup>
import GoodsPanel from './GoodsPanel.vue';
import { ref, onMounted } from 'vue';
import { getFreshApi } from '@/apis/lauyoutCategoriesApi';

// 响应式变量定义正确
const goodsList = ref([])

const getFresh = async()=>{
    try {
        const res = await getFreshApi()
        // 先统一做基础校验，避免解构报错
        if (res && res.code === 200) { 
            goodsList.value = res.data || [] // 空值保护：避免 data 为 undefined 导致渲染异常
        } else {
            console.error('接口返回失败：', res?.message || '未知错误')
        }
    } catch (error) {
        console.error('请求接口失败：', error)
        goodsList.value = []
    }
}

onMounted(() =>{
    getFresh()
})
</script>
<style>

</style>