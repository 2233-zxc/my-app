//将api封装成接口函数
import requestInstance from '@/utils/request' // 引入封装的axios

export function getCategoryApi(){
  return requestInstance.get('/api/data/headers')
}
