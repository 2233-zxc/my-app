<template>
  <div class="home-container wrapper">
    <!-- 背景轮播图（底层） -->
    <div class="banner-wrapper">
      <div class="swiper-content">
        <div class="swiper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div v-for="(item, index) in bannerList" :key="item.id" class="swiper-item">
            <img :src="item.imgUrl" :alt="`Banner ${index + 1}`" />
          </div>
        </div>
      </div>

      <!-- 轮播分页器 -->
      <div v-if="bannerList.length > 0" class="swiper-pagination">
        <span
          v-for="(item, index) in bannerList"
          :key="item.id"
          class="pagination-dot"
          :class="{ active: index === currentIndex }"
          @click="switchToIndex(index)"
        ></span>
      </div>
      
      <!-- 轮播切换按钮 -->
      <button 
        class="banner-left"
        @click="prevSlide"
        :disabled="bannerList.length <= 1"
        aria-label="上一张轮播图" 
        v-if="isBannerbtn"
      >&lt;</button>
      <button 
        class="banner-right"
        @click="nextSlide"
        :disabled="bannerList.length <= 1"
        aria-label="下一张轮播图" 
        v-if="isBannerbtn"
      >&gt;</button>
    </div>

    <!-- 左侧分类导航（悬浮层）- 重构布局 -->
    <div class="home-category" @mouseleave="handleContainerLeave">
      <!-- 分类栏（固定宽度，不被挤压） -->
      <div class="subnav">
        <ul>
          <li v-for="(item, idx) in categories" :key="idx">
            <div 
              class="subnav-item"  
              @click="handleCategoryClick(item)"
            >
              <span class="classify">{{ item.main }}</span>
              <span v-for="sub in item.subs" :key="sub" class="sub-text">{{ sub }}</span>
              <span class="iconfont icon-arrow-right-bold"></span>
            </div>
          </li>
        </ul>
      </div>
      <!-- 分类推荐层（绝对定位，脱离文档流） -->
      <div class="layer" v-if="isCategory">
        <h4>分类推荐 <small>根据您的购买或浏览记录推荐</small></h4>
        <ul v-if="currentGoodsList.length">
          <li v-for="item in currentGoodsList" :key="item.id">
            <div class="goods-item">
              <img :src="item.imgUrl" alt="" />
              <div class="info">
                <p class="name ellipsis-2">{{ item.name }}</p>
                <p class="desc ellipsis"></p>
                <p class="price"><i>¥</i>{{ item.price }}</p>
              </div>
            </div>
          </li>
        </ul>
        <div class="empty-tip" v-else>
          暂无该分类商品
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getBannerApi } from '@/apis/home';

// ===================== 轮播组件逻辑 =====================
const bannerList = ref([])
const getBanner = async()=>{
    try {
        const res = await getBannerApi()
        if (res.code === 200) { 
            bannerList.value = res.data || []
        } else {
            console.error('接口返回失败：', res.message)
        }
    } catch (error) {
        console.error('请求接口失败：', error)
    }
}

const currentIndex = ref(0)
let timer = null
const isBannerbtn = ref(false);
// 新增：标记是否为手动操作（点击分页器/按钮）
const isManualOperate = ref(false);

// 轮播自动播放（优化：仅非手动操作时隐藏按钮）
function startAutoPlay() {
  if (bannerList.value.length === 0) return
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % bannerList.value.length
  }, 3000)
  // 关键：仅当非手动操作时，才隐藏按钮
  if (!isManualOperate.value) {
    isBannerbtn.value = false
  }
}

// 轮播暂停播放（鼠标悬停）
function stopAutoPlay() {
  if (timer) {
    clearInterval(timer)
    isBannerbtn.value = true
  }
}

// 分页器切换（优化：标记手动操作，保持按钮显示）
function switchToIndex(index) {
  clearInterval(timer)
  currentIndex.value = index
  isManualOperate.value = true // 标记为手动操作
  isBannerbtn.value = true     // 强制显示按钮
  startAutoPlay()
}

// 上一张（优化：标记手动操作）
function prevSlide() {
  if (bannerList.value.length <= 1) return
  clearInterval(timer)
  currentIndex.value = (currentIndex.value - 1 + bannerList.value.length) % bannerList.value.length
  isManualOperate.value = true // 标记为手动操作
  isBannerbtn.value = true     // 强制显示按钮
  startAutoPlay()
}

// 下一张（优化：标记手动操作）
function nextSlide() {
  if (bannerList.value.length <= 1) return
  clearInterval(timer)
  currentIndex.value = (currentIndex.value + 1) % bannerList.value.length
  isManualOperate.value = true // 标记为手动操作
  isBannerbtn.value = true     // 强制显示按钮
  startAutoPlay()
}

// 新增：鼠标离开轮播区域时的处理（重置手动操作状态）
function handleBannerMouseLeave() {
  isManualOperate.value = false // 重置手动操作标记
  startAutoPlay() // 重启自动播放，此时会隐藏按钮
}

// ===================== 分类组件逻辑 =====================
const categories = ref([
  {id:10001, main: '生鲜', subs: ['水果', '蔬菜'], fresh:[{id: 1, imgUrl: "src/assets/fresh/good1.jpg", name: "进口车厘子500g", price: 89.9},{id: 2, imgUrl: "src/assets/fresh/good2.jpg", name: "赣南脐橙10斤", price: 49.9},{id: 3, imgUrl: "src/assets/fresh/good3.jpg", name: "阳光玫瑰葡萄2斤", price: 59.9}]},
  {id:10002, main: '美食', subs: ['面点', '干果'], food:[{id: 1, imgUrl: "src/assets/uploads/fresh1.png", name: "面饼", price: 12},{id: 2, imgUrl: "src/assets/uploads/fresh2.png", name: "面包", price: 11},{id: 3, imgUrl: "src/assets/uploads/fresh3.png", name: "小蛋糕", price: 10},{id: 4, imgUrl: "src/assets/uploads/fresh4.png", name: "面包", price: 18}]},
  {id:10003, main: '餐厨', subs: ['餐具', '厨具', '小家电'],kitchen:[{id:1, imgUrl:"src/assets/uploads/kitchen1.png", name:"创意碗",price:20.39},{id:2, imgUrl:"src/assets/uploads/kitchen2.png", name:"果盘",price:14.39}] },
  {id:10004, main: '家纺', subs: ['床品', '四件套', '被枕'] },
  {id:10005, main: '居家', subs: ['清洁用品', '收纳', '家具'] },
  {id:10006, main: '洗护', subs: ['洗发', '沐浴', '美妆'] },
  {id:10007, main: '孕婴', subs: ['奶粉', '玩具', '辅食'] },
  {id:10008, main: '服装', subs: ['女装', '男装', '童装'] },
  {id:10009, main: '杂货', subs: ['户外', '图书', '文创'] },
  {id:10010, main: '电器', subs: ['大家电', '小家电', '品牌制造'] }
]);

const currentGoodsList = ref([]);
const isCategory = ref(false);

// 点击分类显示推荐层
const handleCategoryClick = (item) => {
  const goodsKey = Object.keys(item).find(key => ['fresh', 'food', 'kitchen'].includes(key));
  currentGoodsList.value = goodsKey ? item[goodsKey] : [];
  isCategory.value = true;
};

// 移出分类容器隐藏推荐层
const handleContainerLeave = () => {
  isCategory.value = false;
  currentGoodsList.value = [];
};

// ===================== 生命周期 =====================
onMounted(async () => {
  await getBanner()
  startAutoPlay()
  // 给轮播容器绑定鼠标事件（优化：离开时重置手动操作）
  const bannerContainer = document.querySelector('.banner-wrapper')
  if (bannerContainer) {
    bannerContainer.addEventListener('mouseenter', stopAutoPlay)
    bannerContainer.addEventListener('mouseleave', handleBannerMouseLeave) // 替换为新的离开处理函数
  }
})

watch(bannerList, () => {
  currentIndex.value = 0
  isManualOperate.value = false // 数据变化时重置手动操作
  startAutoPlay()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  // 移除事件监听
  const bannerContainer = document.querySelector('.banner-wrapper')
  if (bannerContainer) {
    bannerContainer.removeEventListener('mouseenter', stopAutoPlay)
    bannerContainer.removeEventListener('mouseleave', handleBannerMouseLeave)
  }
})
</script>

<style scoped>
/* 全局容器 */
.home-container {
  height: 500px;
  position: relative;
  overflow: hidden; /* 防止内容溢出 */
}

/* ===================== 轮播样式 ===================== */
.banner-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* 轮播作为背景，层级最低 */
}

.swiper-content {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none; /* 允许事件穿透到分类/分页器 */
}

.swiper {
  width: 100%;
  height: 100%;
  display: flex;
  transition: transform 0.5s ease-in-out;
  pointer-events: auto;
}

.swiper-item {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.swiper-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 背景图铺满 */
}

/* 轮播分页器 */
.swiper-pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99; /* 分页器层级高于分类 */
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 2px;
  box-sizing: content-box;
}

.pagination-dot.active {
  background-color: #fff;
  width: 24px;
  border-radius: 6px;
}

.pagination-dot:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

/* 轮播切换按钮 */
.banner-left, .banner-right {
  position: absolute;
  z-index: 99; /* 按钮层级高于分类 */
  width: 50px;
  height: 50px;
  border: none;
  outline: none;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(0, 0, 0, 0.3);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  pointer-events: auto;
}

.banner-left {
  left: 320px; /* 避开300px宽的分类栏 */
}

.banner-right {
  right: 20px;
  left: auto;
}

.banner-left:hover, .banner-right:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.banner-left:disabled, .banner-right:disabled {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.5);
}

/* ===================== 分类样式 - 核心修复 ===================== */
.home-category {
  width: 300px; /* 固定分类容器宽度，仅包含分类栏 */
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10; /* 分类层级高于轮播背景，低于分页器/按钮 */
  pointer-events: auto;
}

/* 分类栏 - 固定宽度，不被挤压 */
.subnav {
  width: 100%; /* 继承容器300px宽度 */
  height: 100%;
  background-color: rgba(0, 0, 0, 0.42); /* 半透明背景，凸显分类 */
}

.subnav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.subnav-item {
  width: 100%;
  height: 50px;
  padding: 0 20px 0 30px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
}

.subnav-item:hover {
  background-color: #5eb69c;
}

.classify {
  font-size: 24px;
  margin-right: 10px;
  white-space: nowrap;
  color: #fff;
}

.sub-text {
  color: #fff;
  margin-right: 8px;
  white-space: nowrap;
  font-size: 14px;
}

/* 分类推荐层 - 绝对定位，脱离文档流，叠加在分类栏右侧 */
.layer {
  position: absolute;
  top: 0;
  left: 100%; /* 紧贴分类栏右侧 */
  width: 800px; /* 固定推荐层宽度，避免自适应挤压 */
  min-height: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 0 15px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1); /* 增加阴影，区分层级 */
  z-index: 11; /* 推荐层层级高于分类栏 */
  pointer-events: auto;
}

.layer h4 {
  font-size: 20px;
  font-weight: normal;
  line-height: 30px;
  margin: 10px 0;
}

.layer small {
  font-size: 16px;
  color: #666;
}

.layer ul {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}

.layer li {
  width: 310px;
  height: 120px;
  margin: 0 15px 15px 0;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
}

.goods-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.layer li img {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.layer .info {
  flex: 1;
  padding: 0 10px;
  color: #333;
}

.layer .info .name {
  font-size: 14px;
  margin: 0 0 5px 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.layer .info .desc {
  font-size: 12px;
  color: #666;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer .info .price {
  font-size: 16px;
  color: #f40;
  margin: 0;
}

.layer .info .price i {
  font-style: normal;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  font-size: 20px;
  color: #999;
}
</style>