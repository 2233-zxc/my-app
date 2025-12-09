<template>
  <div class="panel wrapper">
    <!-- 标题区域 -->
    <div class="panel-title">
      <div class="title-left">
        <h3>{{ title }}</h3>
        <p>{{ subTitle }}</p>
      </div>
      <div class="title-right">
        <a href="#" @click.prevent="handleViewAll">查看全部</a>
        <span class="iconfont icon-arrow-right-bold"></span>
      </div>
    </div>
    <!-- 商品容器：左侧大图 + 右侧列表（上下各4个） -->
    <div class="goods-container">
      <!-- 左侧大图（保留原有结构，不修改） -->
      <div class="goods-left">
        <img :src="leftBigImg" alt="" class="left-img" />
      </div>
      <!-- 右侧商品列表（调整为2行4列，上下各4个） -->
      <router-link>
        <div class="goods-list">
          <div class="goods-item" v-for="(item, idx) in goodsList" :key="idx">
            <!-- 商品图片 -->
            <div class="goods-img-wrap">
              <img :src="item.imgUrl" :alt="item.name" class="goods-img" />
              <!-- 商品标签（如“全场3件8折”） -->
              <span class="goods-tag" v-if="item.tag">{{ item.tag }}</span>
            </div>
            <!-- 商品名称 -->
            <div class="goods-name">{{ item.name }}</div>
            <!-- 商品规格 -->
            <div class="goods-spec">{{ item.spec }}</div>
            <!-- 商品价格 -->
            <div class="goods-price">¥ {{ item.price }}</div>
            <!-- 加入购物车按钮 -->
            <button class="add-to-cart-btn" @click="addToCart(item)">加入购物车</button>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/Cart'
const cartStore = useCartStore()

// 定义Props（完全保留原有逻辑）
const props = defineProps({
  title: { type: String },
  subTitle: { type: String },
  leftBigImg: { type: String },
  goodsList: {
    type: Array,
    default: () => []
  }
})

// “查看全部”点击事件
const emit = defineEmits(["viewAll"])
const handleViewAll = () => {
  emit("viewAll")
}

// 添加商品到购物车
const addToCart = (product) => {
  cartStore.addItem(product)
  alert('商品已成功添加到购物车！')
}
</script>

<style scoped>
/* 原有标题样式保留 */
.panel {
  height: 800px;
  margin-bottom: 20px;
}
.panel-title {
  height: 42px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title-left {
  display: flex;
  align-items: center;
}
.title-left h3 {
  margin: 0;
  font-size: 30px;
  color: #333333;
}
.title-left p {
  margin-bottom: 0;
  margin-left: 20px;
  color: #A1A1A1;
}
.title-right{
  display: flex;
  align-items: center;
}
.title-right a {
  color: #A1A1A1;
  text-decoration: none;
  display: flex;
  align-items: center;
}
.title-right .iconfont {
  margin-left: 4px;
}

/* 核心：左侧大图 + 右侧列表布局（左侧完全保留） */
.goods-container {
  display: flex;
  gap: 20px; /* 左侧与右侧的间距 */
  height: calc(100% - 62px); /* 减去标题高度 */
}

/* 左侧大图样式（完全保留，不修改） */
.goods-left {
  width: 20%; /* 左侧占比不变 */
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}
.left-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧商品列表：核心修改 → 2行4列（上下各4个） */
.goods-list {
  width: 80%; /* 右侧占比不变 */
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每行4列（原5列） */
  grid-template-rows: repeat(2, 1fr); /* 共2行 → 上下各4个，总计8个 */
  gap: 20px; /* 商品之间的间距（可微调为25px更宽松） */
  height: 100%;
}

/* 商品项样式（适配2行4列布局，微调优化） */
.goods-item {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px; /* 新增内边距，提升视觉效果 */
  box-sizing: border-box;
}
.goods-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1; /* 图片正方形（可改为4/3增大图片） */
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
.goods-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.goods-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #ff6700;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
}
.goods-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}
.goods-spec {
  font-size: 12px;
  color: #A1A1A1;
  margin-bottom: 4px;
}
.goods-price {
  font-size: 14px;
  color: #ff6700;
  font-weight: 600;
}
/* 原有样式保持不变 */
.add-to-cart-btn {
  background-color: #e26237;
  color: white;
  border: none;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-top: auto; /* 让按钮始终位于商品项底部 */
}
.add-to-cart-btn:hover {
  background-color: darken(#e26237, 10%);
}
</style>