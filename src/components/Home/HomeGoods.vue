<template>
    <div class="goods wrapper">
        <div class="goods-title">
            <div class="title-left">
                <h3>新鲜好物</h3>
                <p>新鲜出炉 品质靠谱</p>
            </div>
            <div class="title-right">
                <a href="#">查看全部</a>
                <span class="iconfont icon-arrow-right-bold"></span>
            </div>
        </div>
        <div class="goods-content">
            <div v-if="goodsList.length === 0" class="empty">暂无商品数据</div>
            <div class="goods-item" v-for="(item,index) in goodsList" :key="item.id">
                <img :src="item.imgUrl" alt="">
                <h4>{{ item.name }}</h4>
                <span class="price">¥{{ item.price }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getGoodsApi } from '@/apis/home';
const goodsList = ref([])
const getGoods = async()=>{
    try {
        const res = await getGoodsApi()
        if (res.code === 200) { // 增加接口成功校验
            goodsList.value = res.data
        } else {
            console.error('接口返回失败：', res.message)
        }
    } catch (error) {
        console.error('请求接口失败：', error)
    }
}
onMounted(() =>{
    getGoods()
})

</script>
<style scoped>
.goods{
    height: 470px;
    margin-bottom: 20px;
}
.goods-title{
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
.title-left p{
    margin-bottom: 0;
    margin-left: 20px;
    color: #A1A1A1;
}
.title-right a{
    color: #A1A1A1;
}
.goods-content{
    display: flex;
    justify-content: space-between;
}
.goods-item{
    width: 290px;
    border-radius: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡动画 */
    background-color: #EEF9F4;
    text-align: center;

}
.goods-item:hover{
    transform: translateY(-8px); /* 向上移动 8px */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* 添加柔和阴影 */
}
.goods-item img{
    width: 290px;
    height: 290px;
}
</style>