<template>
    <div class="renqi wrapper">
        <div class="renqi-title">
            <div class="title-left">
                <h3>人气推荐</h3>
                <p>人气爆款 不容错过</p>
            </div>
            <div class="title-right">
                <a href="#">查看全部</a>
                <span class="iconfont icon-arrow-right-bold"></span>
            </div>
        </div>
        <div class="renqi-content">
            <div class="renqi-item" v-for="(item,index) in renqiList" :key="item.id">
                <img v-img-lazy="item.imgUrl" alt="">
                <h4>{{ item.title }}</h4>
                <p>{{ item.text }}</p>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getRenqiApi } from '@/apis/home';
const renqiList = ref([])
const getRenqi = async()=>{
    try {
        const res = await getRenqiApi()
        if (res.code === 200) { // 增加接口成功校验
            renqiList.value = res.data
        } else {
            console.error('接口返回失败：', res.message)
        }
    } catch (error) {
        console.error('请求接口失败：', error)
    }
}
onMounted(() =>{
    getRenqi()
})
</script>
<style scoped>
.renqi{
    height: 470px;
    margin-bottom: 20px;
}
.renqi-title{
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