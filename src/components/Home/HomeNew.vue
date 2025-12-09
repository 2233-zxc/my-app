<template>
    <div class="new wrapper">
        <div class="new-title">
            <div class="title-left">
                <h3>最新专题</h3>
            </div>
            <div class="title-right">
                <a href="#">查看全部</a>
                <span class="iconfont icon-arrow-right-bold"></span>
            </div>
        </div>
        <div class="new-content">
            <div class="new-item" v-for="(item,index) in newList" :key="item.id">
                <img v-img-lazy="item.imgUrl" alt="">
                <div class="new-icon">
                    <div class="new-icon-left">
                        <span class="iconfont icon-fabulous">{{ item.likeCount }}</span>
                        <span class="iconfont icon-browse">{{ item.viewCount }}</span>
                    </div>
                    <div class="new-icon-right">
                        <span class="iconfont icon-comment">{{ item.commentCount }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { getNewApi } from '@/apis/home';
const newList = ref([])
const getNews = async () => {
  try {
    // 直接获取数据（已经是后端返回的 data 数组）
    const data = await getNewApi()
    newList.value = data || []
    console.log('新闻/资讯数据获取成功：', data)
  } catch (error) {
    // ✅ 错误已由 request.js 拦截器统一处理（如 ElMessage 提示）
    console.error('获取新闻数据失败：', error.message || error)
    newList.value = []
  }
}
onMounted(() =>{
    getNews()
})

</script>
<style scoped>
.new{
    height: 470px;
    margin-bottom: 20px;
}
.new-title{
    height: 42px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
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
.new-content{
    display: flex;
    justify-content: space-between;
}
.new-item{
    width: 390px;
    border-radius: 8px;
    background-color: #EEF9F4;
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡动画 */
    text-align: center;
}
.new-item:hover{
    transform: translateY(-8px); /* 向上移动 8px */
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* 添加柔和阴影 */
}
.new-icon{
    height: 50px;
    display: flex;
    justify-content: space-between;
    margin-top: 10px
}
.new-icon-left span{
    padding-left: 20px;
}
.new-item img{
    width: 390px;
    height: 320px;
}
.new-icon-right{
    margin-right: 10px;
}
</style>