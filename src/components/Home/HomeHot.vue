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
const getHot = async()=>{
    try {
        const res = await getHotApi()
        if (res.code === 200) { // 增加接口成功校验
            hotList.value = res.data
        } else {
            console.error('接口返回失败：', res.message)
        }
    } catch (error) {
        console.error('请求接口失败：', error)
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