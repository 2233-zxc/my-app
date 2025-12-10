<template>
  <div class="confirm-order-page wrapper">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>确认订单</h2>
      <p class="order-number">订单编号：{{ orderInfo.orderNo || '待生成' }}</p>
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
            <span class="goods-count">共 {{ orderInfo.totalCount }} 件商品</span>
          </div>
          
          <!-- 商品列表 -->
          <div class="goods-list">
            <div class="goods-item" v-for="(goods, idx) in orderInfo.goodsList" :key="idx">
              <div class="goods-img">
                <img :src="goods.image" :alt="goods.name" />
              </div>
              <div class="goods-info">
                <h4 class="goods-name">{{ goods.name }}</h4>
                <p class="goods-spec" v-if="goods.spec">{{ goods.spec }}</p>
                <div class="goods-price-count">
                  <span class="goods-price">¥{{ goods.price }}</span>
                  <span class="goods-count">x{{ goods.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 1. 收货地址模块 -->
        <div class="form-section">
          <div class="section-title">
            <span>收货地址</span>
            <el-button type="text" @click="showAddressModal = true">
              <i class="iconfont icon-edit"></i> 编辑/新增
            </el-button>
          </div>

          <!-- 地址展示（选中状态） -->
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

        <!-- 2. 用户信息模块 -->
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

        <!-- 3. 订单备注（保留） -->
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

        <!-- 新增：配送方式选择（确认订单核心项） -->
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
              <div class="method-desc">预计{{ orderInfo.freight === '0.00' ? '包邮' : '¥' + orderInfo.freight }}，3-5天送达</div>
              <el-radio v-model="selectedDelivery" label="express" class="radio-btn"></el-radio>
            </div>

            <div 
              class="method-item" 
              :class="{ active: selectedDelivery === 'fast' }"
              @click="selectedDelivery = 'fast'"
              v-if="Number(orderInfo.totalAmount) >= 200"
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
        
        <!-- ========== 新增：支付方式选择区域 ========== -->
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
            v-if="Number(orderInfo.totalAmount) >= 100"
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
            <span>¥{{ orderInfo.totalAmount }}</span>
          </div>
          <!-- 运费（根据配送方式动态调整） -->
          <div class="summary-item">
            <label>运费：</label>
            <span>{{ getFreightText() }}</span>
          </div>
          <!-- 新增：支付方式服务费 -->
          <div class="summary-item" v-if="selectedPayment === 'cod'">
            <label>服务费：</label>
            <span>¥5.00</span>
          </div>
          <!-- 优惠金额 -->
          <div class="summary-item discount">
            <label>优惠减免：</label>
            <span>-¥{{ orderInfo.discount }}</span>
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
            :disabled="!selectedAddress || !selectedDelivery || !selectedPayment || isSubmitting || !orderStore.isOrderComplete"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/Order'
import { useAddressStore } from '@/stores/address'

// 初始化路由和Store
const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()

// ========== 基础数据 ==========
// 加载状态
const isLoading = ref(false)
// 提交状态（防止重复提交）
const isSubmitting = ref(false)

// 核心改造：从OrderStore读取订单信息
const orderInfo = computed(() => {
  if (!orderStore.orderData?.goodsList?.length) {
    ElMessage.warning('订单数据不存在，请重新选择商品结算')
    router.push('/cart')
    return {
      orderNo: '',
      totalAmount: '0.00',
      freight: '0.00',
      discount: '0.00',
      actualAmount: '0.00',
      goodsList: [],
      totalCount: 0
    }
  }
  return orderStore.orderData
})

// 用户信息（从Store获取）
const userInfo = computed(() => {
  return userStore.userInfo || { userName: '游客', phone: '', vipLevel: '' }
})

// 地址列表：从Pinia Store读取
const addressList = computed(() => addressStore.addressList)

// 完整省市区数据
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

// ========== 状态管理 ==========
// 选中的收货地址（响应式绑定Store）
const selectedAddress = computed({
  get: () => addressStore.selectedAddress,
  set: (val) => addressStore.selectAddress(val)
})

// 选中的配送方式
const selectedDelivery = ref('express')
// 选中的支付方式（默认微信支付）
const selectedPayment = ref('wechat')
// 订单备注
const orderRemark = ref(orderStore.payInfo.remark || '')
// 地址弹窗显示状态
const showAddressModal = ref(false)

// 地址表单相关（完全匹配后端字段）
const addressFormRef = ref(null)
const addressForm = reactive({
  addressId: '', // 后端的addressId
  receiverName: '', // 收货人姓名
  receiverMobile: '', // 手机号
  region: [], // 省市区级联选择值
  provinceName: '', // 省
  cityName: '', // 市
  districtName: '', // 区
  detailAddress: '', // 详细地址
  isDefault: '0' // 是否默认（0/1）
})

// 地址表单校验规则
const addressRules = ref({
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverMobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
})

// ========== 方法 ==========
// 省市区选择变更处理
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

// 选择收货地址
const selectAddress = (addr) => {
  addressStore.selectAddress(addr)
  orderStore.setPayInfo({ addressId: addr.addressId })
  showAddressModal.value = false
  ElMessage.success('已选择收货地址')
}

// 编辑地址
const editAddress = (addr) => {
  addressForm.addressId = addr.addressId
  addressForm.receiverName = addr.receiverName
  addressForm.receiverMobile = addr.receiverMobile
  addressForm.region = [addr.provinceName, addr.cityName, addr.districtName]
  addressForm.provinceName = addr.provinceName
  addressForm.cityName = addr.cityName
  addressForm.districtName = addr.districtName
  addressForm.detailAddress = addr.detailAddress
  addressForm.isDefault = addr.isDefault === 1 ? '1' : '0'
}

// 删除地址
const deleteAddress = async (addressId) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      type: 'warning'
    })
    const userId = Number(userStore.userInfo?.userId)
    if (!userId || isNaN(userId)) {
      ElMessage.error('用户ID无效，请重新登录')
      return
    }
    const success = await addressStore.deleteAddress(addressId, userId)
    if (success) {
      if (selectedAddress.value?.addressId === addressId) {
        orderStore.setPayInfo({ addressId: '' })
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除地址失败：' + (error.message || '操作异常'))
    }
  }
}

// 保存地址（核心修复）
const saveAddress = async () => {
  const userId = Number(userStore.userInfo?.userId)
  // 1. 登录校验
  if (!userStore.isLogin || !userId || isNaN(userId)) {
    ElMessage.warning('请先登录后再添加地址')
    return
  }

  // 2. 表单校验
  addressFormRef.value.validate(async (valid) => {
    if (!valid) return

    // 3. 构造后端参数
    const addressParams = {
      addressId: addressForm.addressId ? Number(addressForm.addressId) : undefined,
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

    // 4. 调用Store新增/编辑方法
    const success = await addressStore.addAddress(addressParams, userId)
    if (success) {
      showAddressModal.value = false
      resetAddressForm()
      ElMessage.success(addressForm.addressId ? '地址编辑成功' : '地址添加成功')
    }
  })
}

// 重置地址表单
const resetAddressForm = () => {
  if (addressFormRef.value) {
    addressFormRef.value.resetFields()
  }
  Object.assign(addressForm, {
    addressId: '',
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

// ========== 计算属性 ==========
/**
 * 根据配送方式获取运费文本
 */
const getFreightText = () => {
  if (selectedDelivery.value === 'fast') {
    return '¥15.00'
  }
  return orderInfo.value.freight === '0.00' ? '免运费' : '¥' + orderInfo.value.freight
}

/**
 * 根据配送方式+支付方式计算实际应付金额
 */
const getActualAmount = () => {
  const baseAmount = parseFloat(orderInfo.value.actualAmount || 0)
  // 顺丰速运额外加15元运费
  let freightAdd = selectedDelivery.value === 'fast' ? 15 : 0
  // 货到付款额外加5元服务费
  let payServiceFee = selectedPayment.value === 'cod' ? 5 : 0
  // 总金额 = 基础金额 + 运费 + 支付服务费
  const total = baseAmount + freightAdd + payServiceFee
  return total.toFixed(2)
}

// 提交订单
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

  orderStore.setPayInfo({
    addressId: selectedAddress.value.addressId,
    remark: orderRemark.value,
    paymentType: selectedPayment.value,
    deliveryType: selectedDelivery.value
  })

  if (!orderStore.isOrderComplete) {
    ElMessage.warning('订单信息不完整，请检查收货地址和商品信息')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认提交订单？应付金额：¥${getActualAmount()}`,
      '订单确认',
      {
        type: 'info',
        confirmButtonText: '确认提交',
        cancelButtonText: '取消'
      }
    )

    isSubmitting.value = true

    const orderParams = {
      ...orderStore.getPayParams(),
      deliveryType: selectedDelivery.value,
      paymentType: selectedPayment.value,
      freight: selectedDelivery.value === 'fast' ? '15.00' : orderInfo.value.freight,
      payServiceFee: selectedPayment.value === 'cod' ? '5.00' : '0.00',
      actualAmount: getActualAmount(),
      userId: userStore.userInfo.userId
    }

    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    const res = {
      code: 200,
      msg: '订单创建成功',
      data: {
        orderNo: `ORD${Date.now()}`,
        status: 'pending'
      }
    }

    if (res.code === 200 && res.data.orderNo) {
      orderStore.setOfficialOrderNo(res.data.orderNo)
      ElMessage.success('订单提交成功！即将跳转到支付页面')
      
      setTimeout(() => {
        router.push({
          path: '/payment',
          query: { 
            orderNo: res.data.orderNo,
            paymentType: selectedPayment.value,
            actualAmount: getActualAmount()
          }
        })
      }, 1000)
    } else {
      ElMessage.error(res.msg || '订单提交失败，请重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`订单提交失败：${error.message || '网络异常'}`)
      console.error('提交订单失败：', error)
    }
  } finally {
    isSubmitting.value = false
  }
}

// ========== 页面生命周期 ==========
onMounted(async () => {
  if (!userStore.isLogin) {
    router.push({ path: '/login', query: { redirect: router.currentRoute.fullPath } })
    return
  }

  const userId = Number(userStore.userInfo?.userId)
  if (!userId || isNaN(userId)) {
    ElMessage.error('用户信息异常，请重新登录')
    userStore.logout()
    router.push('/login')
    return
  }

  isLoading.value = true

  try {
    await addressStore.fetchAddressList(userId)
    orderRemark.value = orderStore.payInfo.remark || ''

    if (orderStore.payInfo.addressId) {
      const defaultAddr = addressStore.addressList.find(addr => addr.addressId === orderStore.payInfo.addressId)
      if (defaultAddr) {
        addressStore.selectAddress(defaultAddr)
      }
    } else if (addressStore.defaultAddress) {
      addressStore.selectAddress(addressStore.defaultAddress)
    }

    if (orderStore.payInfo.paymentType) {
      selectedPayment.value = orderStore.payInfo.paymentType
    }

    if (!orderStore.isGoodsAmountValid) {
      ElMessage.warning('订单金额异常，可能已被修改，请重新结算')
      router.push('/cart')
    }

    if (orderStore.isOrderExpired) {
      ElMessage.warning('当前订单即将过期，请尽快提交！')
    }
  } catch (error) {
    ElMessage.error('初始化订单页面失败：' + (error.message || '未知错误'))
    console.error('页面初始化异常：', error)
  } finally {
    isLoading.value = false
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