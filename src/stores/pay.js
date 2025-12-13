import { ref, onMounted, onUnmounted } from 'vue' // 新增 onUnmounted
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/Order'
import { useUserStore } from '@/stores/user'
import { getUnpaidOrderDetailApi, getOrderPayStatusApi } from '@/apis/orderApi' 
const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()
const orderDetail = ref(null)
const isLoading = ref(true)
let pollTimer = null // 轮询定时器
let pollCount = 0 // 轮询次数限制（防止无限轮询）
const MAX_POLL_COUNT = 1000 // 最大轮询次数（3秒/次 → 15分钟）

// 1. 获取订单号（路由参数优先，兜底用Store）
const orderNo = route.query.orderNo || orderStore.realOrderNo

// 2. 清除轮询的通用方法（核心修复）
const clearPollTimer = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
    pollCount = 0
  }
}

// 3. 支付状态轮询（新增完整终止逻辑）
const startPayStatusPolling = () => {
  // 前置校验：参数为空直接终止
  const userId = userStore.userInfo?.userId
  if (!orderNo || !userId || userId <= 0) {
    clearPollTimer()
    return
  }

  // 防止重复启动轮询
  if (pollTimer) return

  pollTimer = setInterval(async () => {
    // 轮询次数限制：达到最大值自动终止
    if (pollCount >= MAX_POLL_COUNT) {
      clearPollTimer()
      ElMessage.warning('支付二维码已过期，请刷新页面重新获取')
      return
    }

    try {
      // 每次轮询前校验用户登录状态
      if (!userStore.isLogin) {
        clearPollTimer()
        ElMessage.error('登录状态失效，请重新登录')
        router.push('/login')
        return
      }

      const payStatus = await getOrderPayStatusApi(orderNo, userId)
      pollCount++

      // 状态判断 + 终止轮询
      if (payStatus === 1) {
        clearPollTimer()
        ElMessage.success('支付成功！即将跳转到订单列表')
        setTimeout(() => router.push('/order'), 3000)
      } else if (payStatus === 2) {
        clearPollTimer()
        ElMessage.warning('支付失败/超时，请重新尝试')
      }
    } catch (error) {
      pollCount++
      console.error('轮询支付状态失败：', error)
      // 403错误直接终止轮询
      if (error.response?.status === 403) {
        clearPollTimer()
        ElMessage.error('权限验证失败，请重新登录')
        router.push('/login')
      }
      // 连续失败5次终止轮询
      if (pollCount >= 5) {
        clearPollTimer()
      }
    }
  }, 1000)
}

// 4. 查询订单详情（修复轮询启动/终止逻辑）
const fetchOrderDetail = async () => {
  // 基础校验：失败直接终止并清除轮询
  if (!orderNo || !userStore.isLogin) {
    clearPollTimer() // 新增：清除轮询
    ElMessage.error('订单信息异常，请返回重新提交')
    router.push('/order')
    isLoading.value = false
    return
  }

  const userId = userStore.userInfo?.userId
  if (!userId || userId <= 0) {
    clearPollTimer() // 新增：清除轮询
    ElMessage.error('用户信息异常，请重新登录')
    router.push('/login')
    isLoading.value = false
    return
  }

  try {
    const response = await getUnpaidOrderDetailApi(orderNo, userId)
    orderDetail.value = response // 修复：request拦截器已返回data，无需.data
    
    if (!orderDetail.value) {
      clearPollTimer() // 新增：清除轮询
      ElMessage.error('订单不存在或已失效')
      router.push('/order')
    } else {
      // 订单查询成功后启动轮询（确保参数有效）
      startPayStatusPolling()
    }
  } catch (error) {
    clearPollTimer() // 新增：清除轮询
    const errorMsg = error.message || '订单查询失败，请检查网络或重新提交订单'
    ElMessage.error(errorMsg)
    console.error('订单详情查询失败：', error)
    router.push('/order')
  } finally {
    isLoading.value = false
  }
}

// 5. 页面挂载/卸载生命周期（核心修复）
onMounted(() => {
  fetchOrderDetail()
})

// 页面卸载时强制清除轮询（关键！）
onUnmounted(() => {
  clearPollTimer()
})

// 监听路由变化：跳转时清除轮询（新增）
router.afterEach(() => {
  clearPollTimer()
})