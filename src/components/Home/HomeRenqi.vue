<template>
    <HomePanel title="人气推荐" sub-title="人气爆款 不容错过">
        <div class="renqi-content">
            <div class="renqi-item" v-for="(item,index) in renqiList" :key="item.id">
                <img v-img-lazy="item.imgUrl" alt="">
                <h4>{{ item.title }}</h4>
                <p>{{ item.text }}</p>
            </div>
        </div>
    </HomePanel>
</template>
<script setup>
import HomePanel from './HomePanel.vue';
import { ref, onMounted } from 'vue';
import { getRenqiApi } from '@/apis/home';
const renqiList = ref([])
const getRenqi = async () => {
  try {
    // ✅ 直接获取数据（已经是后端返回的 data 数组）
    const data = await getRenqiApi()
    renqiList.value = data || []
    console.log('人气商品数据获取成功：', data)
  } catch (error) {
    // ✅ 错误已由 request.js 拦截器统一处理（如 ElMessage 弹窗）
    console.error('获取人气商品失败：', error.message || error)
    renqiList.value = []
  }
}
onMounted(() =>{
    getRenqi()
})
</script>
<style scoped>
.renqi-content{
    display: flex;
    justify-content: space-between;
}
.renqi-item{
    width: 290px;
    border-radius: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡动画 */
    background-color: #EEF9F4;
    text-align: center;
}
.renqi-item:hover {
    transform: translateY(-8px); /* 向上移动 8px */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* 添加柔和阴影 */
}
.renqi-item img{
    width: 290px;
    height: 290px;
}
</style>