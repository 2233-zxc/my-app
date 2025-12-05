<template>
    <HomePanel title="新鲜好物" sub-title="新鲜出炉 品质靠谱">
        <div class="goods-content">
            <div v-if="goodsList.length === 0" class="empty">暂无商品数据</div>
            <div class="goods-item" v-for="(item,index) in goodsList" :key="item.id">
                <img :src="item.imgUrl" alt="">
                <h4>{{ item.name }}</h4>
                <span class="price">¥{{ item.price }}</span>
            </div>
        </div>
    </HomePanel>
</template>
<script setup>
import HomePanel from './HomePanel.vue';
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