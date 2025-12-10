import requestInstance from '@/utils/request'

// 1. 新增收货地址
export const addAddressApi = (address) => {
  return requestInstance.post('/user/address/add', address)
}

// 2. 根据地址ID查询单条地址（带用户归属校验）
export const getAddressByIdApi = (addressId, userId) => {
  return requestInstance.get(`/user/address/${addressId}`, {
    params: { userId }
  })
}

// 3. 查询用户所有有效地址
export const listUserAddressesApi = (userId) => {
  return requestInstance.get(`/user/address/list/${userId}`)
}

// 4. 设置默认地址（带用户归属校验）
export const setDefaultAddressApi = (addressId, userId) => {
  return requestInstance.put(`/user/address/setDefault/${addressId}`, {}, {
    params: { userId }
  })
}

// 5. 删除地址（逻辑删除，带用户归属校验）
export const deleteAddressApi = (addressId, userId) => {
  return requestInstance.delete(`/user/address/delete/${addressId}`, {
    params: { userId }
  })
}