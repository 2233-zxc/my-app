import requestInstance from '@/utils/request'

// 获取头部导航（全量一级分类）
export const getCategoryApi = () => {
  return requestInstance.get('/api/data/headers')
}