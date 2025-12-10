import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  addAddressApi,
  getAddressByIdApi,
  listUserAddressesApi,
  setDefaultAddressApi,
  deleteAddressApi
} from '@/apis/addressApi'

export const useAddressStore = defineStore('address', {
  state: () => ({
    addressList: [], // 直接存储后端返回的地址对象
    selectedAddress: null,
    isLoading: false
  }),

  getters: {
    // 直接使用后端的isDefault字段（数字0/1）
    defaultAddress: (state) => {
      return state.addressList.find(addr => addr.isDefault === 1) || null
    },
    hasAddress: (state) => {
      return state.addressList.length > 0
    }
  },

  actions: {
    /**
     * 加载用户地址列表（直接使用后端字段，无映射）
     */
    async fetchAddressList(userId) {
      if (!userId || isNaN(Number(userId))) {
        ElMessage.warning('用户ID不能为空，请先登录')
        return
      }

      this.isLoading = true
      try {
        const res = await listUserAddressesApi(userId)
        
        if (Array.isArray(res)) {
          // 直接过滤有效地址，无需字段映射
          const validAddresses = res.filter(addr => 
            addr.addressId && 
            addr.receiverName && 
            addr.receiverMobile && 
            addr.provinceName && 
            addr.cityName && 
            addr.districtName && 
            addr.detailAddress
          );
          
          this.addressList = validAddresses;
          
          // 自动选中默认地址
          if (!this.selectedAddress && this.defaultAddress) {
            this.selectedAddress = this.defaultAddress
          }

          if (validAddresses.length === 0) {
            ElMessage.info('暂无收货地址，请添加')
          }
        } else {
          this.addressList = []
          ElMessage.error('加载地址失败：后端接口返回数据错误（非地址列表）')
          console.error('地址接口返回异常数据：', res)
        }
      } catch (error) {
        console.error('加载地址列表异常：', error)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 新增/编辑地址（完全使用后端字段名）
     */
    async addAddress(addressForm, userId) {
      // 1. 基础校验
      if (!userId || isNaN(Number(userId))) {
        ElMessage.warning('用户ID不能为空，请先登录')
        return false
      }
      if (!addressForm) {
        ElMessage.error('地址表单数据不能为空')
        return false
      }

      this.isLoading = true
      try {
        // 2. 构造请求参数（完全匹配后端字段名）
        const addressParams = {
          userId: Number(userId),
          addressId: addressForm.addressId ? Number(addressForm.addressId) : undefined, // 编辑时传，新增时不传
          receiverName: (addressForm.receiverName || '').trim(),
          receiverMobile: (addressForm.receiverMobile || '').trim(),
          provinceName: addressForm.provinceName || '',
          cityName: addressForm.cityName || '',
          districtName: addressForm.districtName || '',
          detailAddress: (addressForm.detailAddress || '').trim(),
          isDefault: addressForm.isDefault ? 1 : 0,
          isValid: 1 // 默认为有效地址
        }

        // 3. 前置校验：必填项检查
        if (!addressParams.receiverName) {
          ElMessage.warning('收货人姓名不能为空')
          this.isLoading = false
          return false
        }
        if (!addressParams.receiverMobile) {
          ElMessage.warning('收货人手机号不能为空')
          this.isLoading = false
          return false
        }
        if (!addressParams.provinceName || !addressParams.cityName || !addressParams.districtName) {
          ElMessage.warning('请完整选择省/市/区')
          this.isLoading = false
          return false
        }
        if (!addressParams.detailAddress) {
          ElMessage.warning('详细地址不能为空')
          this.isLoading = false
          return false
        }

        // 4. 调用接口
        console.log('新增/编辑地址请求参数：', addressParams)
        const newAddress = await addAddressApi(addressParams)

        // 5. 校验返回结果（直接使用后端返回的addressId）
        if (newAddress && newAddress.addressId) {
          // 重新加载最新地址列表
          await this.fetchAddressList(userId)
          
          // 自动选中新增的默认地址
          if (addressForm.isDefault) {
            const defaultAddr = this.addressList.find(addr => addr.addressId === newAddress.addressId)
            if (defaultAddr) {
              this.selectedAddress = defaultAddr
            }
          }

          ElMessage.success(addressForm.addressId ? '地址编辑成功' : '地址新增成功')
          return true
        } else {
          ElMessage.error('新增地址失败：后端未返回有效地址ID')
          console.error('新增地址返回异常：', newAddress)
          return false
        }
      } catch (error) {
        ElMessage.error('新增地址失败：' + (error.message || '网络异常'))
        console.error('新增地址异常详情：', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 设置默认地址（使用后端原生字段）
     */
    async setDefaultAddress(addressId, userId) {
      if (!addressId || !userId || isNaN(Number(userId))) {
        ElMessage.warning('地址ID和用户ID不能为空')
        return false
      }

      this.isLoading = true
      try {
        await setDefaultAddressApi(addressId, userId)
        // 重新加载列表，保证数据同步
        await this.fetchAddressList(userId)
        this.selectedAddress = this.addressList.find(addr => addr.addressId === addressId)
        ElMessage.success('默认地址设置成功')
        return true
      } catch (error) {
        console.error('设置默认地址异常：', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 删除地址（使用后端原生字段）
     */
    async deleteAddress(addressId, userId) {
      if (!addressId || !userId || isNaN(Number(userId))) {
        ElMessage.warning('地址ID和用户ID不能为空')
        return false
      }

      this.isLoading = true
      try {
        await deleteAddressApi(addressId, userId)
        // 重新加载列表
        await this.fetchAddressList(userId)
        if (this.selectedAddress?.addressId === addressId) {
          this.selectedAddress = this.defaultAddress
        }
        ElMessage.success('地址删除成功')
        return true
      } catch (error) {
        console.error('删除地址异常：', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 查询单条地址（直接返回后端字段）
     */
    async getAddressById(addressId, userId) {
      if (!addressId || !userId || isNaN(Number(userId))) {
        ElMessage.warning('地址ID和用户ID不能为空')
        return null
      }

      this.isLoading = true
      try {
        const address = await getAddressByIdApi(addressId, userId)
        return address || null // 直接返回后端数据，无映射
      } catch (error) {
        console.error('查询单条地址异常：', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    // 选中地址（使用后端addressId）
    selectAddress(addr) {
      if (!addr) return
      this.selectedAddress = addr
    },

    // 清空地址状态
    clearAddressState() {
      this.addressList = []
      this.selectedAddress = null
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user_address',
        storage: localStorage,
        paths: ['addressList', 'selectedAddress']
      }
    ]
  }
})