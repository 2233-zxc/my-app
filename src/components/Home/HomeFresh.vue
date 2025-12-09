<template>
    <div class="fresh wrapper">
        <div class="fresh-title">
            <div class="title-left">
                <h3>生鲜</h3>
            </div>
            <div class="title-right">
                <ul class="fresh-list">
                    <li><a href="#">热门</a></li>
                    <li><a href="#">蔬菜</a></li>
                    <li><a href="#">肉禽蛋</a></li>
                    <li><a href="#">水果</a></li>
                    <li><a href="#">海鲜</a></li>
                    <li><a href="#">零食</a></li>
                    <li><a href="#">饮料</a></li>
                </ul>
                <a href="#">查看全部</a>
                <span class="iconfont icon-arrow-right-bold"></span>
            </div>
        </div>
        <div class="fresh-content">
            <div class="fresh-item" v-for="(item,index) in freshList" :key="item.id">
                <img v-img-lazy="item.imgUrl" alt="">
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getFreshApi } from '@/apis/home';
const freshList = ref([])
const getFresh = async () => {
    try {
        // 直接获取data数组，因为响应拦截器已处理过code和message
        const data = await getFreshApi();
        freshList.value = data || []; // 直接赋值data，不需要检查code
        console.log('生鲜数据获取成功：', freshList.value);
    } catch (error) {
        console.error('请求接口失败：', error.message); // 错误信息通过error.message获取
    }
};
onMounted(() =>{
    getFresh()
})

</script>
<style scoped>
.fresh{
    height: 470px;
    margin-bottom: 20px;
}
.fresh-title{
    height: 42px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
.title-left{
    display: flex;
    align-items: center;
}
.title-left h3{
    margin: 0;
    font-size: 30px;
    color: #333333;
}
.title-right{
    display: flex;
    align-items: center;
}
.title-right li a{
    color: #333;
}
.title-right li a:hover{
    color: #5EB69C;
}
.title-right a{
    color: #A1A1A1;
}
.fresh-list{
    display: flex;
    margin-right: 40px;
}
.fresh-list li{
    margin-left: 10px;
}
.fresh-content{
    display: flex;
    justify-content: space-between;
}
.fresh-item{
    background-color: #EEF9F4;
    text-align: center;
}
.fresh-item img{
    width: 290px;
    height: 290px;
}
</style>