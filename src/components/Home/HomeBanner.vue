<template>
  <div class="banner wrapper" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
    <!-- 左侧分类导航 -->
    <div class="subnav">
      <ul>
        <li v-for="(item, idx) in categories" :key="idx">
          <div class="subnav-item">
            <a href="#" class="classify">{{ item.main }}</a>
            <a v-for="sub in item.subs" :key="sub" href="#">{{ sub }}</a>
            <span class="iconfont icon-arrow-right-bold"></span>
          </div>
        </li>
      </ul>
    </div>

    <!-- 轮播区域：添加鼠标悬停/离开事件 -->
    <div class="swiper-content">
      <div class="swiper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(item, index) in bannerList" :key="item.id" class="swiper-item">
          <img :src="item.imgUrl" :alt="`Banner ${index + 1}`" />
        </div>
      </div>
    </div>

    <!-- 分页器：动态渲染 + 高亮 + 点击切换 -->
    <div v-if="bannerList.length > 0" class="swiper-pagination">
      <span
        v-for="(item, index) in bannerList"
        :key="item.id"
        class="pagination-dot"
        :class="{ active: index === currentIndex }"
        @click="switchToIndex(index)"
      ></span>
    </div>
    
    <!-- 切换按钮：绑定点击事件 + 禁用逻辑 -->
    <button 
      class="banner-left"
      @click="prevSlide"
      :disabled="bannerList.length <= 1"
      aria-label="上一张轮播图" v-if="isBannerbtn"
    >&lt;</button>
    <button 
      class="banner-right"
      @click="nextSlide"
      :disabled="bannerList.length <= 1"
      aria-label="下一张轮播图" v-if="isBannerbtn"
    >&gt;</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getBannerApi } from '@/apis/home';

const bannerList = ref([])
const getBanner = async()=>{
    try {
        const res = await getBannerApi()
        if (res.code === 200) { 
            bannerList.value = res.data || [] // 兜底空数组，避免undefined
        } else {
            console.error('接口返回失败：', res.message)
        }
    } catch (error) {
        console.error('请求接口失败：', error)
    }
}

// 当前显示索引
const currentIndex = ref(0)
// 自动轮播定时器
let timer = null

// 启动自动轮播（增加空数据判断）
function startAutoPlay() {
  // 数据为空时不启动轮播，避免 NaN 错误
  if (bannerList.value.length === 0) return
  
  // 先清除旧定时器，防止重复创建
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % bannerList.value.length
  }, 3000)
  isBannerbtn.value = false
}
const isBannerbtn = ref(false);
// 暂停自动轮播
function stopAutoPlay() {
  if (timer) {
    clearInterval(timer)
    // 不重置timer为null，保留引用方便后续恢复
    isBannerbtn.value = true
  }
}

// 点击分页器切换指定轮播图
function switchToIndex(index) {
  // 清除旧定时器，手动切换后重启轮播，避免节奏混乱
  clearInterval(timer)
  currentIndex.value = index
  startAutoPlay()
}

// 上一张切换逻辑
function prevSlide() {
  clearInterval(timer) // 暂停轮播
  // 处理边界：索引为0时切到最后一张
  currentIndex.value = (currentIndex.value - 1 + bannerList.value.length) % bannerList.value.length
  startAutoPlay() // 重启轮播
}

// 下一张切换逻辑
function nextSlide() {
  clearInterval(timer) // 暂停轮播
  // 正常循环切换
  currentIndex.value = (currentIndex.value + 1) % bannerList.value.length
  startAutoPlay() // 重启轮播
}

// 组件挂载：等待数据加载完成再启动轮播（解决异步时序问题）
onMounted(async () => {
  await getBanner() // 等待接口返回
  startAutoPlay()
})

// 监听bannerList变化，重新初始化轮播（适配数据更新）
watch(bannerList, () => {
  currentIndex.value = 0 // 数据变化时重置到第一张
  startAutoPlay()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 分类数据
const categories = ref([
  { main: '生鲜', subs: ['水果', '蔬菜'] },
  { main: '美食', subs: ['面点', '干果'] },
  { main: '餐厨', subs: ['餐具', '厨具', '小家电'] },
  { main: '家纺', subs: ['床品', '四件套', '被枕'] },
  { main: '居家', subs: ['清洁用品', '收纳', '家具'] },
  { main: '洗护', subs: ['洗发', '沐浴', '美妆'] },
  { main: '孕婴', subs: ['奶粉', '玩具', '辅食'] },
  { main: '服装', subs: ['女装', '男装', '童装'] },
  { main: '杂货', subs: ['户外', '图书', '文创'] },
  { main: '电器', subs: ['大家电', '小家电', '品牌制造'] }
])
</script>

<style scoped>
.banner {
  height: 500px;
  position: relative;
  margin-bottom: 20px;
}

/* --- 左侧分类导航 --- */
.subnav {
  width: 300px;
  height: 100%;
  position: absolute;
  z-index: 11;
}
.subnav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.subnav-item {
  width: 300px;
  height: 50px;
  padding: 0 20px 0 30px;
  background-color: rgba(0, 0, 0, 0.42);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
}
.subnav-item:hover {
  background-color: #5eb69c;
}
.classify {
  font-size: 24px;
  margin-right: 10px;
  white-space: nowrap;
}
.subnav-item a {
  color: #fff;
  text-decoration: none;
  margin-right: 8px;
  white-space: nowrap;
}

/* --- 轮播图区域 --- */
.swiper-content {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  overflow: hidden;
  cursor: pointer; /* 鼠标指针 */
}
.swiper {
  width: 100%;
  height: 100%;
  display: flex;
  transition: transform 0.5s ease-in-out; /* 平滑滑动 */
}
.swiper-item {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}
.swiper-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 防止图片拉伸变形 */
}

/* 分页器：保留你的定位，补充样式细节 */
.swiper-pagination{
  position: absolute;
  bottom: 3%;
  right: 50%;
  /* 水平居中（修正right:50%的偏移） */
  transform: translateX(50%);
  z-index: 11;
  /* 圆点横向排列 + 间距 */
  display: flex;
  gap: 8px;
}

/* 分页器圆点基础样式 */
.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%; /* 圆形 */
  background-color: rgba(255, 255, 255, 0.5); /* 未激活半透明 */
  cursor: pointer; /* 鼠标指针 */
  transition: all 0.3s ease; /* 高亮过渡 */
}

/* 当前页圆点高亮样式 */
.pagination-dot.active {
  background-color: #fff; /* 纯白高亮 */
  width: 24px; /* 拉长为椭圆，更醒目 */
  border-radius: 6px;
}

/* 鼠标悬浮圆点效果（可选） */
.pagination-dot:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

/* 切换按钮样式：适配白色+无点击效果 */
.banner-left, .banner-right {
  position: absolute;
  z-index: 11;
  width: 50px;
  height: 50px;
  border: none;
  outline: none;
  border-radius: 50%;
  top: 50%;
  /* 垂直居中 */
  transform: translateY(-50%);
  color: #fff;
  /* 箭头白色 */
  font-size: 20px;
  /* 箭头大小 */
  cursor: pointer;
  /* 鼠标指针 */
  transition: all 0.3s ease;
  /* 过渡动画 */
  /* 核心：适配白色的背景（半透黑+hover加深） */
  background-color: rgba(0, 0, 0, 0.3);
  /* 去除点击高亮 */
  -webkit-tap-highlight-color: transparent;
  tap-highlight-color: transparent;
  user-select: none;
}

/* 上一张按钮定位（避开左侧分类） */
.banner-left {
  left: 26%;
}

/* 下一张按钮定位 */
.banner-right {
  left: 95%;
}

/* hover效果：加深背景，提升交互反馈 */
.banner-left:hover, .banner-right:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 禁用状态样式（只有1张图时） */
.banner-left:disabled, .banner-right:disabled {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.5);
}

/* 去除点击/聚焦效果 */
.banner-left:focus, .banner-right:focus {
  outline: none;
  box-shadow: none;
}

.banner-left:active, .banner-right:active {
  background-color: rgba(0, 0, 0, 0.3);
  transform: translateY(-50%);
}
</style>