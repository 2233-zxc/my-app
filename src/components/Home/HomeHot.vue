<template>
    <div class="hot wrapper">
        <div class="hot-title">
            <div class="title-left">
                <h3>热门品牌</h3>
                <p>国际经典 品牌认证</p>
            </div>
            <div class="title-right">
                <a href="#">查看全部</a>
                <span class="iconfont icon-arrow-right-bold"></span>
            </div>
        </div>
        <div class="hot-content">
            <div class="hot-item" v-for="(item,index) in hotList" :key="item.id">
                <img v-img-lazy="item.imgUrl" alt="">
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getHotApi } from '@/apis/home';
const hotList = ref([])
const getHot = async () => {
  try {
    // 直接获取数据（已经是后端返回的 data 数组）
    const data = await getHotApi()
    hotList.value = data || []
    console.log('热门商品数据获取成功：', data)
  } catch (error) {
    // 错误已被 request.js 拦截器统一处理（如 ElMessage 提示）
    console.error('获取热门商品失败：', error.message || error)
    hotList.value = []
  }
}
onMounted(() =>{
    getHot()
})


</script>
<style scoped>
.hot{
    height: 470px;
    margin-bottom: 20px;
}
.hot-title{
    height: 42px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
.title-left{
    display: flex;
    align-items: center;
}
.title-right{
    display: flex;
    align-items: center;
}
.title-left h3{
    margin: 0;
    font-size: 30px;
    color: #333333;
}
.title-left p{
    margin-bottom: 0;
    margin-left: 20px;
    color: #A1A1A1;
}
.title-right a{
    color: #A1A1A1;
}
.hot-content{
    display: flex;
    justify-content: space-between;
}
.hot-item{
    width: 290px;
    border-radius: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡动画 */
    text-align: center;
}
.hot-item:hover{
    transform: translateY(-8px); /* 向上移动 8px */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* 添加柔和阴影 */
}
.hot-item img{
    width: 290px;
    height: 320px;
}
</style>