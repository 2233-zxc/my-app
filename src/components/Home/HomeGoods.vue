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
const getGoods = async () => {
  try {
    // ✅ 成功时：res 就是后端返回的 data（如商品列表数组）
    const data = await getGoodsApi()
    goodsList.value = data || []
    console.log('商品数据获取成功：', data)
  } catch (error) {
    // ✅ 失败时：拦截器已自动提示错误（如 ElMessage），这里只做日志记录
    console.error('请求商品接口失败：', error.message || error)
    goodsList.value = []
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