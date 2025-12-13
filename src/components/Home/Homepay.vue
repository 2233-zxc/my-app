<template>
  <div class="unpaid-order-detail">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 订单详情内容 -->
    <div v-else-if="orderDetail" class="order-content">
      <!-- 订单基础信息 -->
      <el-card shadow="hover" class="order-base-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <!-- 动态更新支付状态标签 -->
            <el-tag 
              :type="statusTagType" 
              size="small"
            >
              {{ statusText }}
            </el-tag>
          </div>
        </template>

        <div class="order-base-info">
          <div class="info-item">
            <label>订单编号：</label>
            <span>{{ orderDetail.order.orderNo }}</span>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ formatTime(orderDetail.order.createTime) }}</span>
          </div>
          <div class="info-item">
            <label>支付方式：</label>
            <span>{{ orderDetail.order.payMethod === 'alipay' ? '支付宝' : '微信支付' }}</span>
          </div>
          <div class="info-item">
            <label>配送方式：</label>
            <span>{{ orderDetail.order.deliveryType === 'express' ? '快递配送' : '到店自提' }}</span>
          </div>
          <!-- 支付成功后显示支付时间 -->
          <div v-if="statusText === '完成付款'" class="info-item">
            <label>支付时间：</label>
            <span>{{ formatTime(orderDetail.order.payTime) || '暂无' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 收货地址 -->
      <el-card shadow="hover" class="address-card" style="margin-top: 16px;">
        <template #header>
          <span>收货地址</span>
        </template>
        <div class="address-info">
          <div class="receiver">
            <span>{{ orderDetail.order.receiverName }}</span>
            <span style="margin-left: 16px;">{{ orderDetail.order.receiverMobile }}</span>
          </div>
          <div class="address-detail" style="margin-top: 8px;">
            {{ orderDetail.order.provinceName }}{{ orderDetail.order.cityName }}{{ orderDetail.order.districtName }}{{ orderDetail.order.detailAddress }}
          </div>
        </div>
      </el-card>

      <!-- 商品明细 -->
      <el-card shadow="hover" class="goods-card" style="margin-top: 16px;">
        <template #header>
          <span>商品明细</span>
        </template>
        <el-table :data="orderDetail.orderItems" border size="small" style="width: 100%;">
          <el-table-column prop="goodsName" label="商品名称" />
          <el-table-column prop="goodsSpec" label="商品规格" />
          <el-table-column prop="price" label="单价" align="right">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" align="center" />
          <el-table-column prop="itemAmount" label="小计" align="right">
            <template #default="scope">
              ¥{{ scope.row.itemAmount.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 价格汇总 -->
      <el-card shadow="hover" class="price-card" style="margin-top: 16px;">
        <div class="price-summary">
          <div class="price-item">
            <span>商品总价：</span>
            <span>¥{{ orderDetail.order.goodsAmount.toFixed(2) }}</span>
          </div>
          <div class="price-item">
            <span>运费：</span>
            <span>¥{{ orderDetail.order.freight.toFixed(2) }}</span>
          </div>
          <div class="price-item">
            <span>优惠：</span>
            <span>¥{{ orderDetail.order.discount.toFixed(2) }}</span>
          </div>
          <div class="price-item">
            <span>服务费：</span>
            <span>¥{{ orderDetail.order.payServiceFee.toFixed(2) }}</span>
          </div>
          <div class="price-item total">
            <span>订单总计：</span>
            <span>¥{{ orderDetail.order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 支付二维码：仅待付款状态显示 -->
      <el-card 
        v-if="statusText === '待付款'" 
        shadow="hover" 
        class="qr-code-card" 
        style="margin-top: 16px; text-align: center;"
      >
        <template #header>
          <span>支付二维码</span>
        </template>
        <div v-if="isRefreshingQrCode" class="qr-loading">
          <el-skeleton variant="circle" style="width: 100px; height: 100px; margin: 0 auto;" />
        </div>
        <div v-else class="qr-code-container">
          <img 
            :src="orderDetail.payQrCodeBase64" 
            alt="支付二维码" 
            class="qr-code-img"
            v-if="orderDetail.payQrCodeBase64"
          />
          <div v-else class="qr-empty">
            <el-empty description="二维码生成失败，请点击刷新" />
          </div>
          <p style="margin-top: 8px; color: #666;">请使用支付宝扫码支付（15分钟内有效）</p>
          <p style="color: #f56c6c;">订单金额：¥{{ orderDetail.order.totalAmount.toFixed(2) }}</p>
        </div>
        <el-button 
          type="primary" 
          size="default" 
          style="margin-top: 16px;"
          @click="refreshQrCode"
          :loading="isRefreshingQrCode"
        >
          刷新支付二维码
        </el-button>
      </el-card>

      <!-- 支付成功状态 -->
      <el-card 
        v-else-if="statusText === '完成付款'" 
        shadow="hover" 
        class="status-card success" 
        style="margin-top: 16px; text-align: center;"
      >
        <h3 style="color: #67c23a;">支付成功！</h3>
        <p>您的订单已完成付款，我们将尽快为您发货</p>
        <el-button 
          type="primary" 
          size="default" 
          style="margin-top: 16px;"
          @click="goToOrderList"
        >
          查看我的订单
        </el-button>
      </el-card>

      <!-- 支付失败/超时状态 -->
      <el-card 
        v-else 
        shadow="hover" 
        class="status-card fail" 
        style="margin-top: 16px; text-align: center;"
      >
        <el-icon size="48" color="#f56c6c" style="margin-bottom: 16px;">
          <CircleClose />
        </el-icon>
        <h3 style="color: #f56c6c;">支付超时/失败</h3>
        <p>您的订单支付已超时或失败，请重新尝试支付</p>
        <el-button 
          type="primary" 
          size="default" 
          style="margin-top: 16px;"
          @click="refreshQrCode"
        >
          重新生成支付二维码
        </el-button>
      </el-card>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="empty-container">
      <el-empty description="暂无订单数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/Order'
import { useUserStore } from '@/stores/user'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { 
  getUnpaidOrderDetailApi, 
  getOrderPayStatusApi 
} from '@/apis/orderApi' 

// 路由和Store实例
const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 响应式数据
const orderDetail = ref(null)
const isLoading = ref(true)
const isRefreshingQrCode = ref(false)
const payStatus = ref(0) // 0-待付款 1-完成付款 2-支付失败/超时
let pollTimer = null
let pollCount = 0
const MAX_POLL_COUNT = 300 // 3秒/次 → 15分钟

// 订单号
const orderNo = route.query.orderNo || orderStore.realOrderNo

// 1. 计算属性：根据支付状态生成展示文本（核心映射）
const statusText = computed(() => {
  switch (payStatus.value) {
    case 0: return '待付款'       // 接口返回data=0
    case 1: return '完成付款'     // 接口返回data=1
    case 2: return '支付失败/超时' // 接口返回data=2
    default: return '待付款'
  }
})

// 2. 计算属性：根据支付状态生成标签样式
const statusTagType = computed(() => {
  switch (payStatus.value) {
    case 0: return 'warning' // 待付款-黄色
    case 1: return 'success' // 完成付款-绿色
    case 2: return 'danger'  // 失败/超时-红色
    default: return 'warning'
  }
})

// 3. 清除轮询定时器（防止内存泄漏）
const clearPollTimer = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  pollCount = 0
}

// 4. 时间格式化工具函数
const formatTime = (timeStr) => {
  if (!timeStr) return '暂无'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

// 5. 核心：查询支付状态（精准解析接口返回的data字段）
const queryPayStatus = async () => {
  if (!orderNo || !userStore.userInfo?.userId) return

  try {
    // 调用接口：返回格式为 {code:200, message:"success", data:0/1/2}
    // axios响应拦截器已提取res.data，所以直接拿到状态值
    const resStatus = await getOrderPayStatusApi(orderNo, userStore.userInfo.userId)
    
    // 关键：将接口返回的data值赋值给payStatus，触发页面更新
    payStatus.value = resStatus

    // 支付成功后（data=1），重新拉取订单详情更新支付时间等信息
    if (resStatus === 1) {
      const detail = await getUnpaidOrderDetailApi(orderNo, userStore.userInfo.userId)
      orderDetail.value = detail
    }
  } catch (error) {
    console.error('查询支付状态失败：', error)
    // 接口请求失败（非200）时，不更新状态，仅打印日志
  }
}

// 6. 刷新二维码（重置状态+重新获取二维码）
const refreshQrCode = async () => {
  clearPollTimer()
  if (!orderNo || !userStore.userInfo?.userId) {
    ElMessage.error('订单信息异常，无法刷新二维码')
    return
  }

  isRefreshingQrCode.value = true
  try {
    // 重置状态为待付款
    payStatus.value = 0
    const response = await getUnpaidOrderDetailApi(orderNo, userStore.userInfo.userId)
    if (response && response.payQrCodeBase64) {
      orderDetail.value = response
      ElMessage.success('二维码刷新成功')
      startPolling() // 重启轮询
    } else {
      ElMessage.error('二维码刷新失败，请重试')
    }
  } catch (error) {
    ElMessage.error(error.message || '二维码刷新失败')
    console.error('刷新二维码失败：', error)
  } finally {
    isRefreshingQrCode.value = false
  }
}

// 7. 获取订单详情（页面初始化）
const fetchOrderDetail = async () => {
  // 基础校验
  if (!orderNo || !userStore.isLogin) {
    clearPollTimer()
    ElMessage.error('订单信息异常，请返回重新提交')
    router.push('/order')
    isLoading.value = false
    return
  }

  const userId = userStore.userInfo?.userId
  if (!userId || userId <= 0) {
    clearPollTimer()
    ElMessage.error('用户信息异常，请重新登录')
    router.push('/login')
    isLoading.value = false
    return
  }

  try {
    // 1. 获取订单详情
    const response = await getUnpaidOrderDetailApi(orderNo, userId)
    orderDetail.value = response

    // 2. 初始化查询支付状态（页面加载时就同步最新状态）
    await queryPayStatus()

    if (!orderDetail.value || !orderDetail.value.order) {
      clearPollTimer()
      ElMessage.error('订单不存在或已失效')
      router.push('/order')
    } else {
      startPolling() // 启动轮询
    }
  } catch (error) {
    clearPollTimer()
    ElMessage.error(error.message || '订单查询失败')
    console.error('订单详情查询失败：', error)
    router.push('/order')
  } finally {
    isLoading.value = false
  }
}

// 8. 启动支付状态轮询（每3秒查询一次接口）
const startPolling = () => {
  clearPollTimer()
  const userId = userStore.userInfo?.userId
  if (!orderNo || !userId) return

  // 每3秒调用一次查询支付状态接口
  pollTimer = setInterval(async () => {
    // 轮询次数超限（15分钟），标记为超时
    if (pollCount >= MAX_POLL_COUNT) {
      clearPollTimer()
      if (payStatus.value === 0) {
        payStatus.value = 2
        ElMessage.warning('支付二维码已过期，请刷新重新支付')
      }
      return
    }

    // 登录状态失效，终止轮询
    if (!userStore.isLogin) {
      clearPollTimer()
      ElMessage.error('登录状态失效，请重新登录')
      router.push('/login')
      return
    }

    // 正常轮询查询状态
    await queryPayStatus()
    pollCount++

    // 支付成功（data=1），终止轮询并提示
    if (payStatus.value === 1) {
      clearPollTimer()
      ElMessage.success('支付成功！订单状态已更新为完成付款')
      // 3秒后自动跳转到订单列表（可选）
      setTimeout(() => {
        goToOrderList()
      }, 3000)
    }
  }, 3000)

  // 兜底：15分钟后强制停止轮询
  setTimeout(() => {
    clearPollTimer()
  }, 15 * 60 * 1000)
}

// 9. 跳转订单列表
const goToOrderList = () => {
  router.push('/order')
}

// 10. 监听路由变化，清除轮询
watch(
  () => router.currentRoute.path,
  () => clearPollTimer(),
  { immediate: true }
)

// 页面挂载：加载订单详情 + 启动轮询
onMounted(() => {
  fetchOrderDetail()
})

// 页面卸载：强制清除轮询定时器（关键）
onUnmounted(() => {
  clearPollTimer()
})
</script>

<style scoped>
.unpaid-order-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-base-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  color: #666;
  margin-right: 8px;
  min-width: 80px;
}

.address-info {
  padding: 8px 0;
}

.receiver {
  font-size: 16px;
}

.address-detail {
  color: #666;
  line-height: 1.5;
}

.price-summary {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.price-item.total {
  font-weight: bold;
  font-size: 16px;
  color: #f56c6c;
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 8px;
}

.qr-code-container, .qr-loading, .qr-empty {
  padding: 16px;
}

.qr-code-img {
  width: 250px;
  height: 250px;
  object-fit: contain;
}

.status-card {
  padding: 32px;
}

.status-card h3 {
  margin: 8px 0 16px 0;
}

.empty-container {
  padding: 40px 0;
  text-align: center;
}
</style>