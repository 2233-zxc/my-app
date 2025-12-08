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
    <!-- 商品列表区域（仅通过Props渲染，无插槽） -->
    <div class="goods-container">
      <div class="goods-list">
        <!-- 遍历父组件传递的goodsList数据 -->
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义Props（补充goodsList，移除插槽相关逻辑）
const props = defineProps({
  // 主标题
  title: {
    type: String
  },
  // 副标题
  subTitle: {
    type: String
  },
  // 商品列表（核心：无插槽时仅靠这个Props渲染列表）
  goodsList: {
    type: Array,
    default: () => [] // 默认空数组，避免遍历报错
  }
})

// 可选：“查看全部”点击事件（向父组件传递）
const emit = defineEmits(["viewAll"])
const handleViewAll = () => {
  emit("viewAll")
}
</script>

<style scoped>
/* 原有样式保留 + 补充商品列表样式 */
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
  text-decoration: none; /* 移除下划线，优化样式 */
  display: flex;
  align-items: center;
}
.title-right i {
  margin-left: 4px; /* 图标和文字间距 */
}

/* 商品列表核心样式 */
.goods-container {
  width: 100%;
  height: calc(100% - 62px); /* 适配panel固定高度，减去标题高度 */
  overflow: hidden; /* 防止内容溢出 */
}
.goods-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5列布局，和截图一致 */
  gap: 20px; /* 商品间距 */
  height: 100%;
}
.goods-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.goods-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1; /* 图片正方形比例 */
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
.goods-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片自适应，不拉伸 */
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
  white-space: nowrap; /* 文字超出隐藏 */
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
</style>