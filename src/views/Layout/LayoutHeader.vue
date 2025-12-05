<template>
    <header class="header-nav wrapper">
        <div class="logo">
            <router-link to="/"><img src="@/assets/小兔鲜儿logo.png" alt=""></router-link>
        </div>
        <div class="nav">
            <ul>
                <li><router-link to="/">首页</router-link></li>
                <li v-for="(item,index) in categoryList" :key="item.id">
                    <router-link :to="`/category/${item.id}`">{{ item.name }}</router-link>
                </li>
            </ul>
        </div>
        <div class="search">
            <span class="iconfont icon-search"></span>
            <input type="text" placeholder="搜一搜" />
		</div>
        <!-- 购物车 -->
        <div class="cart">
            <i class="iconfont icon-cart-full"></i>
            <span>{{ cartCount }}</span>
        </div>
    </header>
</template>
<script setup>
import { ref } from 'vue';
//使用Pinia的数据
//1.导入pinia中的storeToRefs方法实现解构响应式数据
import { storeToRefs } from 'pinia';
//2.导入Pinia Store
import { useCategoryStore } from '@/stores/category'
//3.创建store实例
const categoryStore = useCategoryStore()
//4. 核心：用storeToRefs解构响应式的categoryList（必须！否则失去响应式）
const { categoryList, loading } = storeToRefs(categoryStore)

const cartCount = ref(0)
</script>
<style scoped>

.header-nav{
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}
.logo router-link img{
    width: 200px;
    height: 90px;
}
.header-nav ul{
    display: flex;
}
.header-nav li{
    margin-right: 30px;
    font-size: 24px;
}
.header-nav li .router-link-exact-active {
  border-bottom: 2px solid #5EB69C;
  padding-bottom: 5px;
  color: #5EB69C;
}
.header-nav a{
    color: #333333;
}
.header-nav li a:hover{
    color: #5EB69C;
}
.search{
    display: flex;
    align-items: center;
    width: 170px;
    height: 33px;
    border-bottom: 2px solid #F4F4F4;
}
/* 搜索图标 */
.search .iconfont{
	margin-right: 8px;
	font-size: 20px;
	color: #CCCCCC;
}

.search input{
    border: none;
    /* 消除input输入的聚焦状态 */
    outline: none;
}
/* 搜一搜字体大小颜色的设置 */
.search input::placeholder{
	font-size: 16px;
	color: #CCCCCC;
}
/* 购物车 */
.cart{
	position: relative;
}
/* 字体图片 */
.cart .iconfont{
	font-size: 24px;
}
/* 数字2 */
.cart span{
	position: absolute;
	top: 1px;
	left: 15px;
	height: 15px;
	padding: 0 6px;
	background-color: #E26237;
	border-radius: 8px;
	font-size: 14px;
	color: #FFFFFF;
	line-height: 15px;
}
</style>