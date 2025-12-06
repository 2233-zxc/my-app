//将api封装成接口函数
import requestInstance from '@/utils/request' // 引入封装的axios

export const getFreshApi = () =>{
    return requestInstance.get('/api/data/categories/fresh')
}
export const getFootApi = () =>{
    return requestInstance.get('/api/data/categories/food')
}