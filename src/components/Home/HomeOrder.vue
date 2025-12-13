<template>
  <div class="confirm-order-page wrapper">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>确认订单</h2>
      <p class="order-number">订单编号：{{ orderStore.realOrderNo || '待生成' }}</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-wrap">
      <el-skeleton active :rows="8" />
    </div>

    <div v-else class="payment-container">
      <!-- 左侧：订单信息表单 -->
      <div class="payment-form">
        <!-- 订单商品列表模块 -->
        <div class="form-section">
          <div class="section-title">
            <span>订单商品</span>
            <span class="goods-count">共 {{ cartStore.totalCount }} 件商品</span>
          </div>
          
          <!-- 商品列表 -->
          <div class="goods-list">
            <div class="goods-item" v-for="(goods, idx) in cartStore.items" :key="idx">
              <div class="goods-img">
                <img :src="goods.image" :alt="goods.name" />
              </div>
              <div class="goods-info">
                <h4 class="goods-name">{{ goods.name }}</h4>
                <p class="goods-spec" v-if="goods.spec">{{ goods.spec }}</p>
                <div class="goods-price-count">
                  <span class="goods-price">¥{{ goods.price.toFixed(2) }}</span>
                  <span class="goods-count">x{{ goods.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 收货地址模块 -->
        <div class="form-section">
          <div class="section-title">
            <span>收货地址</span>
            <el-button type="text" @click="showAddressModal = true">
              <i class="iconfont icon-edit"></i> 编辑/新增
            </el-button>
          </div>

          <!-- 地址展示 -->
          <div class="address-card" v-if="selectedAddress">
            <div class="address-info">
              <p class="recipient">
                {{ selectedAddress.receiverName }} {{ selectedAddress.receiverMobile }}
              </p>
              <p class="address-detail">
                {{ selectedAddress.provinceName }}{{ selectedAddress.cityName }}{{ selectedAddress.districtName }}{{ selectedAddress.detailAddress }}
              </p>
            </div>
            <el-button type="text" @click="showAddressModal = true" class="edit-address">
              更换地址
            </el-button>
          </div>

          <!-- 无地址提示 -->
          <div class="no-address" v-else @click="showAddressModal = true">
            <i class="iconfont icon-add"></i>
            <p>暂无收货地址，请添加</p>
          </div>
        </div>

        <!-- 用户信息模块 -->
        <div class="form-section">
          <div class="section-title">用户信息</div>
          <div class="user-info-card">
            <div class="info-item">
              <label>用户名：</label>
              <span>{{ userInfo.userName }}</span>
            </div>
            <div class="info-item">
              <label>会员等级：</label>
              <span>{{ userInfo.vipLevel || '普通会员' }}</span>
            </div>
          </div>
        </div>

        <!-- 订单备注 -->
        <div class="form-section">
          <div class="section-title">订单备注</div>
          <el-input
            type="textarea"
            v-model="orderRemark"
            placeholder="请输入订单备注（选填），如特殊配送要求等"
            :rows="3"
            maxlength="200"
            show-word-limit
          ></el-input>
        </div>

        <!-- 配送方式选择 -->
        <div class="form-section">
          <div class="section-title">配送方式</div>
          <div class="delivery-methods">
            <div 
              class="method-item" 
              :class="{ active: selectedDelivery === 'express' }"
              @click="selectedDelivery = 'express'"
            >
              <div class="method-icon">
                <i class="iconfont icon-express"></i>
              </div>
              <div class="method-name">普通快递</div>
              <div class="method-desc">预计{{ Number(cartStore.totalAmount) === 0 ? '包邮' : '¥' + cartStore.totalAmount }}，3-5天送达</div>
              <el-radio v-model="selectedDelivery" label="express" class="radio-btn"></el-radio>
            </div>

            <div 
              class="method-item" 
              :class="{ active: selectedDelivery === 'fast' }"
              @click="selectedDelivery = 'fast'"
              v-if="Number(cartStore.totalAmount) >= 200"
            >
              <div class="method-icon">
                <i class="iconfont icon-fast"></i>
              </div>
              <div class="method-name">顺丰速运</div>
              <div class="method-desc">运费¥15，1-2天送达（订单满200元可选）</div>
              <el-radio v-model="selectedDelivery" label="fast" class="radio-btn"></el-radio>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：订单汇总 -->
      <div class="order-summary">
        <div class="summary-title">订单汇总</div>
        
        <!-- 支付方式选择 -->
        <div class="payment-methods">
          <div class="payment-title">支付方式</div>
          <div 
            class="payment-item" 
            :class="{ active: selectedPayment === 'wechat' }"
            @click="selectedPayment = 'wechat'"
          >
            <div class="payment-icon">
              <i class="iconfont icon-wechat"></i>
            </div>
            <div class="payment-name">微信支付</div>
            <el-radio v-model="selectedPayment" label="wechat" class="radio-btn"></el-radio>
          </div>
          <div 
            class="payment-item" 
            :class="{ active: selectedPayment === 'alipay' }"
            @click="selectedPayment = 'alipay'"
          >
            <div class="payment-icon">
              <i class="iconfont icon-alipay"></i>
            </div>
            <div class="payment-name">支付宝支付</div>
            <el-radio v-model="selectedPayment" label="alipay" class="radio-btn"></el-radio>
          </div>
          <div 
            class="payment-item" 
            :class="{ active: selectedPayment === 'cod' }"
            @click="selectedPayment = 'cod'"
            v-if="Number(cartStore.totalAmount) >= 100"
          >
            <div class="payment-icon">
              <i class="iconfont icon-cod"></i>
            </div>
            <div class="payment-name">货到付款</div>
            <div class="payment-desc">加收5元服务费（订单满100元可选）</div>
            <el-radio v-model="selectedPayment" label="cod" class="radio-btn"></el-radio>
          </div>
        </div>

        <div class="summary-content">
          <!-- 商品总价 -->
          <div class="summary-item">
            <label>商品总价：</label>
            <span>¥{{ cartStore.totalAmount }}</span>
          </div>
          <!-- 运费 -->
          <div class="summary-item">
            <label>运费：</label>
            <span>{{ getFreightText() }}</span>
          </div>
          <!-- 支付方式服务费 -->
          <div class="summary-item" v-if="selectedPayment === 'cod'">
            <label>服务费：</label>
            <span>¥5.00</span>
          </div>
          <!-- 优惠金额 -->
          <div class="summary-item discount">
            <label>优惠减免：</label>
            <span>-¥0.00</span>
          </div>
          <!-- 实付金额 -->
          <div class="summary-item total">
            <label>应付金额：</label>
            <span>¥{{ getActualAmount() }}</span>
          </div>
        </div>

        <!-- 提交订单按钮 -->
        <div class="pay-btn-wrap">
          <el-button
            type="primary"
            size="large"
            class="pay-btn"
            :disabled="!selectedAddress || !selectedDelivery || !selectedPayment || isSubmitting || cartStore.items.length === 0"
            @click="handleSubmitOrder"
          >
            <span v-if="isSubmitting"><i class="el-icon-loading"></i> 提交中...</span>
            <span v-else>提交订单</span>
          </el-button>
          <p class="tips">提交订单后请在15分钟内完成支付，超时订单将自动取消</p>
          <p class="tips red" v-if="orderStore.isOrderExpired">
            订单即将过期，请尽快提交！
          </p>
        </div>
      </div>
    </div>

    <!-- 地址选择/新增弹窗 -->
    <el-dialog
      v-model="showAddressModal"
      title="收货地址管理"
      width="600px"
      destroy-on-close
    >
      <div class="address-modal-content">
        <!-- 地址列表加载状态 -->
        <div v-if="addressStore.isLoading" class="addr-loading">
          <el-skeleton active :rows="3" />
        </div>
        
        <!-- 地址列表 -->
        <div class="address-list" v-else-if="addressList.length > 0">
          <div 
            class="address-item" 
            v-for="(addr, idx) in addressList"
            :key="idx"
            :class="{ selected: addr.addressId === selectedAddress?.addressId }"
            @click="selectAddress(addr)"
          >
            <div class="addr-info">
              <p class="addr-recipient">{{ addr.receiverName }} {{ addr.receiverMobile }}</p>
              <p class="addr-detail">{{ addr.provinceName }}{{ addr.cityName }}{{ addr.districtName }}{{ addr.detailAddress }}</p>
              <span v-if="addr.isDefault === 1" class="default-tag">默认地址</span>
            </div>
            <div class="addr-actions">
              <el-button type="text" @click.stop="editAddress(addr)">编辑</el-button>
              <el-button type="text" @click.stop="deleteAddress(addr.addressId)">删除</el-button>
            </div>
          </div>
        </div>

        <!-- 无地址提示 -->
        <div class="no-address-tips" v-else>
          暂无保存的收货地址，请添加新地址
        </div>

        <!-- 地址表单 -->
        <div class="address-form">
          <el-form
            ref="addressFormRef"
            :model="addressForm"
            :rules="addressRules"
            label-width="80px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收货人" prop="receiverName">
                  <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="receiverMobile">
                  <el-input v-model="addressForm.receiverMobile" placeholder="请输入手机号"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="所在地区" prop="region">
              <el-cascader
                v-model="addressForm.region"
                :options="regionOptions"
                placeholder="请选择省/市/区"
                style="width: 100%"
                filterable
                @change="handleRegionChange"
              ></el-cascader>
            </el-form-item>

            <el-form-item label="详细地址" prop="detailAddress">
              <el-input v-model="addressForm.detailAddress" placeholder="请输入详细地址（如街道、门牌号）"></el-input>
            </el-form-item>

            <el-form-item label="是否默认" prop="isDefault">
              <el-switch v-model="addressForm.isDefault" active-value="1" inactive-value="0"></el-switch>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveAddress" :loading="addressStore.isLoading">保存地址</el-button>
              <el-button @click="resetAddressForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/Order'
import { useAddressStore } from '@/stores/address'
import { useCartStore } from '@/stores/Cart'

// ========== 核心修复：增加组件卸载标记 & 安全路由跳转 ==========
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUnmounted = ref(false) // 组件是否已卸载标记

// ========== 初始化实例（增加 Route 实例 & 安全校验） ==========
const router = useRouter()
const route = useRoute() // 新增：获取当前路由实例
const userStore = useUserStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()
const cartStore = useCartStore()

// 安全路由跳转方法（核心修复 Router state 错误）
const safeRouterPush = (to) => {
  // 校验：组件已卸载 或 Router 实例不存在时，不执行跳转
  if (isUnmounted.value || !router || !router.push) {
    console.warn('路由跳转失败：组件已卸载或Router实例无效')
    return Promise.resolve()
  }
  // 捕获重复导航错误
  return router.push(to).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('路由跳转异常：', err)
    }
  })
}

// ========== 计算属性 ==========
const userInfo = computed(() => {
  return userStore.userInfo || { userName: '游客', phone: '', vipLevel: '' }
})

const addressList = computed(() => addressStore.addressList)

const selectedAddress = computed({
  get: () => addressStore.selectedAddress,
  set: (val) => addressStore.selectAddress(val)
})

// ========== 响应式数据 ==========
const selectedDelivery = ref('express')
const selectedPayment = ref('wechat')
const orderRemark = ref('')
const showAddressModal = ref(false)

const addressFormRef = ref(null)
const addressForm = reactive({
  receiverName: '',
  receiverMobile: '',
  region: [],
  provinceName: '',
  cityName: '',
  districtName: '',
  detailAddress: '',
  isDefault: '0'
})

// ========== 常量定义 ==========
const regionOptions = ref([
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '通州区', label: '通州区' },
          { value: '顺义区', label: '顺义区' },
          { value: '昌平区', label: '昌平区' },
          { value: '大兴区', label: '大兴区' },
          { value: '房山区', label: '房山区' },
          { value: '门头沟区', label: '门头沟区' },
          { value: '怀柔区', label: '怀柔区' },
          { value: '平谷区', label: '平谷区' },
          { value: '密云区', label: '密云区' },
          { value: '延庆区', label: '延庆区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '长宁区', label: '长宁区' },
          { value: '静安区', label: '静安区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' },
          { value: '杨浦区', label: '杨浦区' },
          { value: '闵行区', label: '闵行区' },
          { value: '宝山区', label: '宝山区' },
          { value: '嘉定区', label: '嘉定区' },
          { value: '浦东新区', label: '浦东新区' },
          { value: '金山区', label: '金山区' },
          { value: '松江区', label: '松江区' },
          { value: '青浦区', label: '青浦区' },
          { value: '奉贤区', label: '奉贤区' },
          { value: '崇明区', label: '崇明区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '荔湾区', label: '荔湾区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '天河区', label: '天河区' },
          { value: '白云区', label: '白云区' },
          { value: '黄埔区', label: '黄埔区' },
          { value: '番禺区', label: '番禺区' },
          { value: '花都区', label: '花都区' },
          { value: '南沙区', label: '南沙区' },
          { value: '从化区', label: '从化区' },
          { value: '增城区', label: '增城区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '罗湖区', label: '罗湖区' },
          { value: '福田区', label: '福田区' },
          { value: '南山区', label: '南山区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' },
          { value: '盐田区', label: '盐田区' },
          { value: '龙华区', label: '龙华区' },
          { value: '坪山区', label: '坪山区' },
          { value: '光明区', label: '光明区' }
        ]
      }
    ]
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      {
        value: '南京市',
        label: '南京市',
        children: [
          { value: '玄武区', label: '玄武区' },
          { value: '秦淮区', label: '秦淮区' },
          { value: '建邺区', label: '建邺区' },
          { value: '鼓楼区', label: '鼓楼区' },
          { value: '浦口区', label: '浦口区' },
          { value: '栖霞区', label: '栖霞区' },
          { value: '雨花台区', label: '雨花台区' },
          { value: '江宁区', label: '江宁区' }
        ]
      },
      {
        value: '苏州市',
        label: '苏州市',
        children: [
          { value: '姑苏区', label: '姑苏区' },
          { value: '虎丘区', label: '虎丘区' },
          { value: '吴中区', label: '吴中区' },
          { value: '相城区', label: '相城区' },
          { value: '吴江区', label: '吴江区' },
          { value: '昆山市', label: '昆山市' }
        ]
      }
    ]
  }
])

const addressRules = ref({
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverMobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
})

// ========== 方法定义 ==========
const handleRegionChange = (value) => {
  if (value && value.length >= 3) {
    addressForm.provinceName = value[0]
    addressForm.cityName = value[1]
    addressForm.districtName = value[2]
  } else {
    addressForm.provinceName = ''
    addressForm.cityName = ''
    addressForm.districtName = ''
  }
}

const selectAddress = (addr) => {
  addressStore.selectAddress(addr)
  
  orderStore.setReceiverAddress({
    receiverName: addr.receiverName,
    receiverMobile: addr.receiverMobile,
    provinceName: addr.provinceName,
    cityName: addr.cityName,
    districtName: addr.districtName,
    detailAddress: addr.detailAddress
  })
  
  showAddressModal.value = false
  ElMessage.success('已选择收货地址')
}

const editAddress = (addr) => {
  addressForm.receiverName = addr.receiverName
  addressForm.receiverMobile = addr.receiverMobile
  addressForm.region = [addr.provinceName, addr.cityName, addr.districtName]
  addressForm.provinceName = addr.provinceName
  addressForm.cityName = addr.cityName
  addressForm.districtName = addr.districtName
  addressForm.detailAddress = addr.detailAddress
  addressForm.isDefault = addr.isDefault === 1 ? '1' : '0'
}

const deleteAddress = async (addressId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该地址吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const userId = Number(userStore.userInfo?.userId);
    if (!userId || isNaN(userId)) {
      ElMessage.error('用户ID无效，请重新登录');
      return;
    }
    
    const success = await addressStore.deleteAddress(addressId, userId);
    if (success) {
      ElMessage.success('地址删除成功');
      
      if (selectedAddress.value?.addressId === addressId) {
        addressStore.selectAddress(null);
        orderStore.setReceiverAddress({})
      }
    } else {
      ElMessage.error('地址删除失败，请重试');
    }
  } catch (error) {
    ElMessage.info('已取消删除地址');
  }
};

const saveAddress = async () => {
  const userId = Number(userStore.userInfo?.userId)
  
  if (!userStore.isLogin || !userId || isNaN(userId)) {
    ElMessage.warning('请先登录后再添加地址')
    return
  }

  addressFormRef.value.validate(async (valid) => {
    if (!valid) return

    const addressParams = {
      userId: userId,
      receiverName: addressForm.receiverName.trim(),
      receiverMobile: addressForm.receiverMobile.trim(),
      provinceName: addressForm.provinceName,
      cityName: addressForm.cityName,
      districtName: addressForm.districtName,
      detailAddress: addressForm.detailAddress.trim(),
      isDefault: addressForm.isDefault === '1' ? 1 : 0,
      isValid: 1
    }

    const success = await addressStore.addAddress(addressParams, userId)
    if (success) {
      showAddressModal.value = false
      resetAddressForm()
      await addressStore.fetchAddressList(userId)
      ElMessage.success('地址保存成功')
    }
  })
}

const resetAddressForm = () => {
  if (addressFormRef.value) {
    addressFormRef.value.resetFields()
  }
  
  Object.assign(addressForm, {
    receiverName: '',
    receiverMobile: '',
    region: [],
    provinceName: '',
    cityName: '',
    districtName: '',
    detailAddress: '',
    isDefault: '0'
  })
}

const getFreightText = () => {
  return selectedDelivery.value === 'fast' ? '¥15.00' : '¥0.00'
}

const getActualAmount = () => {
  const goodsAmount = Number(cartStore.totalAmount) || 0
  const freight = selectedDelivery.value === 'fast' ? 15 : 0
  const serviceFee = selectedPayment.value === 'cod' ? 5 : 0
  const discount = 0
  
  return (goodsAmount + freight + serviceFee - discount).toFixed(2)
}

/**
 * 提交订单（核心修复：兼容后端返回 & 安全路由跳转）
 */
const handleSubmitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    showAddressModal.value = true
    return
  }
  
  if (!selectedPayment.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空，请先添加商品')
    await safeRouterPush('/cart') // 替换为安全跳转
    return
  }

  const isConfirm = window.confirm(`确认提交订单？应付金额：¥${getActualAmount()}`);
  if (!isConfirm) {
    ElMessage.info('已取消提交订单');
    return;
  }

  try {
    isSubmitting.value = true

    // 设置支付信息
    orderStore.setPayInfo({
      payMethod: selectedPayment.value,
      deliveryType: selectedDelivery.value,
      payServiceFee: selectedPayment.value === 'cod' ? '5.00' : '0.00',
      remark: orderRemark.value
    })

    // 组装订单商品数据
    const orderGoodsData = {
      goodsList: cartStore.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        count: item.count,
        image: item.image,
        spec: item.spec
      })),
      totalAmount: cartStore.totalAmount,
      freight: selectedDelivery.value === 'fast' ? '15.00' : '0.00',
      discount: '0.00',
      actualAmount: getActualAmount()
    }
    
    const setOrderDataSuccess = orderStore.setOrderData(orderGoodsData)
    if (!setOrderDataSuccess) {
      throw new Error('订单数据格式错误')
    }

    // 创建订单
    const orderResult = await orderStore.createOrder()
    console.log('订单创建结果：', orderResult) // 调试日志
    
    if (!orderResult.success) {
      // 兼容：拦截器误判失败但后端实际创建成功的情况
      if (orderResult.responseData?.orderNo) {
        orderStore.setRealOrderNo(orderResult.responseData.orderNo)
        await safeRouterPush({
          path: '/pay',
          query: { orderNo: orderResult.responseData.orderNo }
        })
        ElMessage.success('订单创建成功！')
        return
      }
      throw new Error(orderResult.error || '订单创建失败')
    }

    // 跳转支付页（安全跳转）
    orderStore.setRealOrderNo(orderResult.orderNo)
    await safeRouterPush({
      path: '/pay',
      query: { orderNo: orderResult.orderNo }
    })

    ElMessage.success('订单创建成功！')

  } catch (error) {
    // 优化错误提示：区分响应码问题和真错误
    const errorMsg = error.message || '网络异常'
    if (errorMsg.includes('请求失败') && errorMsg.includes('Error')) {
      ElMessage.error('订单提交失败：后端返回状态码不匹配，请联系管理员')
    } else {
      ElMessage.error(`订单提交失败：${errorMsg}`)
    }
    console.error('提交订单失败：', error)
  } finally {
    // 修复：组件卸载后不修改状态
    if (!isUnmounted.value) {
      isSubmitting.value = false
    }
  }
}

// ========== 生命周期（核心修复：组件卸载保护） ==========
onBeforeUnmount(() => {
  isUnmounted.value = true // 标记组件即将卸载
})

onMounted(async () => {
  if (!userStore.isLogin) {
    await safeRouterPush({ 
      path: '/login', 
      query: { redirect: route.fullPath } // 使用 route 实例而非 router.currentRoute
    })
    return
  }

  const userId = Number(userStore.userInfo?.userId)
  if (!userId || isNaN(userId)) {
    ElMessage.error('用户信息异常，请重新登录')
    userStore.logout()
    await safeRouterPush('/login')
    return
  }

  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空，请先添加商品')
    await safeRouterPush('/cart')
    return
  }

  isLoading.value = true

  try {
    await addressStore.fetchAddressList(userId)

    if (addressStore.defaultAddress) {
      addressStore.selectAddress(addressStore.defaultAddress)
      orderStore.setReceiverAddress({
        receiverName: addressStore.defaultAddress.receiverName,
        receiverMobile: addressStore.defaultAddress.receiverMobile,
        provinceName: addressStore.defaultAddress.provinceName,
        cityName: addressStore.defaultAddress.cityName,
        districtName: addressStore.defaultAddress.districtName,
        detailAddress: addressStore.defaultAddress.detailAddress
      })
    }
  } catch (error) {
    ElMessage.error('初始化订单页面失败：' + (error.message || '未知错误'))
    console.error('页面初始化异常：', error)
  } finally {
    // 修复：组件卸载后不修改状态
    if (!isUnmounted.value) {
      isLoading.value = false
    }
  }
})

onUnmounted(() => {
  isUnmounted.value = true
  if (orderStore.stopPayStatusPolling) {
    orderStore.stopPayStatusPolling()
  }
})
</script>

<style scoped>
/* 基础样式调整 */
.confirm-order-page {
  padding: 20px 0;
  color: #333;
  min-height: calc(100vh - 120px);
  background-color: #f8f9fa;
}

.wrapper {
  width: 1200px;
  margin: 0 auto;
}

/* 加载状态 */
.loading-wrap {
  padding: 40px 0;
}

.addr-loading {
  padding: 20px 0;
}

/* 页面标题 */
.page-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.order-number {
  color: #999;
  margin: 0;
}

.payment-container {
  display: flex;
  gap: 30px;
}

/* 左侧表单区域 */
.payment-form {
  flex: 2;
}

.form-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 商品列表样式 */
.goods-count {
  font-size: 14px;
  font-weight: normal;
  color: #999;
}

.goods-list {
  max-height: 300px;
  overflow-y: auto;
}

.goods-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  margin-bottom: 10px;
}

.goods-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.goods-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.goods-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  flex: 1;
  margin-left: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 5px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.goods-spec {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
}

.goods-price-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 15px;
  color: #e26237;
  font-weight: 600;
}

/* 收货地址样式 */
.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
}

.address-info .recipient {
  font-size: 15px;
  margin: 0 0 8px 0;
}

.address-info .address-detail {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.edit-address {
  color: #5EB69C;
}

.no-address {
  padding: 30px;
  text-align: center;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.no-address:hover {
  border-color: #5EB69C;
  color: #5EB69C;
}

.no-address i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
  color: #5EB69C;
}

/* 用户信息样式 */
.user-info-card {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fafafa;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  width: 80px;
  color: #666;
}

/* 配送方式样式 */
.delivery-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fafafa;
}

.method-item:hover {
  border-color: #ddd;
}

.method-item.active {
  border-color: #5EB69C;
  background-color: rgba(94, 182, 156, 0.05);
}

.method-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.method-icon i {
  font-size: 24px;
}

.icon-express {
  color: #1677ff;
}

.icon-fast {
  color: #e26237;
}

.method-name {
  font-size: 15px;
  font-weight: 500;
  margin-right: 10px;
}

.method-desc {
  color: #999;
  font-size: 12px;
  flex: 1;
}

.radio-btn {
  margin-left: auto;
}

/* 右侧订单汇总 */
.order-summary {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 支付方式样式 */
.payment-methods {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.payment-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.2s;
  background-color: #fafafa;
}

.payment-item:hover {
  border-color: #ddd;
}

.payment-item.active {
  border-color: #5EB69C;
  background-color: rgba(94, 182, 156, 0.05);
}

.payment-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.payment-icon i {
  font-size: 20px;
}

.icon-wechat {
  color: #07c160;
}

.icon-alipay {
  color: #1677ff;
}

.icon-cod {
  color: #e26237;
}

.payment-name {
  font-size: 14px;
  flex: 1;
}

.payment-desc {
  font-size: 12px;
  color: #999;
  margin-right: 10px;
}

/* 订单汇总样式 */
.summary-content {
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 15px;
}

.summary-item.discount span {
  color: #e26237;
}

.summary-item.total {
  font-size: 18px;
  font-weight: 600;
  color: #e26237;
  padding-top: 15px;
  border-top: 1px dashed #eee;
  margin-bottom: 0;
}

/* 提交订单按钮 */
.pay-btn-wrap {
  text-align: center;
}

.pay-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background-color: #5EB69C;
  border: none;
}

.pay-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.tips.red {
  color: #e26237;
  font-weight: 500;
}

/* 地址弹窗样式 */
.address-modal-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 10px 0;
}

.address-list {
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.address-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  background-color: #fafafa;
}

.address-item:hover {
  border-color: #ddd;
}

.address-item.selected {
  border-color: #5EB69C;
  background-color: rgba(94, 182, 156, 0.05);
}

.addr-recipient {
  font-size: 14px;
  margin: 0 0 5px 0;
  font-weight: 500;
}

.addr-detail {
  font-size: 12px;
  color: #666;
  margin: 0 0 5px 0;
  line-height: 1.4;
}

.default-tag {
  font-size: 12px;
  color: #fff;
  background-color: #5EB69C;
  padding: 2px 6px;
  border-radius: 3px;
}

.addr-actions {
  display: flex;
  gap: 10px;
}

.addr-actions el-button {
  font-size: 12px;
}

.no-address-tips {
  text-align: center;
  padding: 20px;
  color: #999;
  border: 1px dashed #eee;
  border-radius: 4px;
  margin-bottom: 20px;
}

.address-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .wrapper {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .payment-container {
    flex-direction: column;
  }
  .goods-img {
    width: 60px;
    height: 60px;
  }
  .address-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .addr-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>