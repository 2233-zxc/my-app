<template>
  <header class="header-nav wrapper">
    <div class="logo">
      <router-link to="/"><img src="@/assets/小兔鲜儿logo.png" alt=""></router-link>
    </div>
    <div class="nav">
      <ul>
        <li><router-link to="/">首页</router-link></li>
        <li v-for="item in categoryList" :key="item.id">
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
      <router-link to="/cart">
        <i class="iconfont icon-cart-full"></i>
        <span>{{ cartCount }}</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/stores/category'
import { useCartStore } from '@/stores/Cart' // 👈 导入 cart store

// 分类数据
const categoryStore = useCategoryStore()
const { categoryList } = storeToRefs(categoryStore)

// 购物车数据 👇
const cartStore = useCartStore()
const { cartCount } = storeToRefs(cartStore) // 响应式解构
</script>

<style scoped>
/* 样式保持不变 */
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
.search .iconfont{
	margin-right: 8px;
	font-size: 20px;
	color: #CCCCCC;
}
.search input{
    border: none;
    outline: none;
}
.search input::placeholder{
	font-size: 16px;
	color: #CCCCCC;
}
.cart{
	position: relative;
}
.cart .iconfont{
	font-size: 24px;
}
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