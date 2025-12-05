//将api封装成接口函数
import requestInstance from '@/utils/request' // 引入封装的axios


export const getBannerApi = () =>{
    return requestInstance.get('/api/data/home/banner')
}

//新鲜好物接口
export const  getGoodsApi= () =>{
  return requestInstance.get('/api/data/home/goods')
}

//人气推荐接口
export const getRenqiApi = () =>{
    return requestInstance.get('/api/data/home/renqi')
}

//热门品牌接口
export const getHotApi = () =>{
    return requestInstance.get('/api/data/home/hot')
}

export const getFreshApi = () =>{
    return requestInstance.get('/api/data/home/fresh')
}

//最新专题
export const getNewApi = () =>{
    return requestInstance.get('/api/data/home/new')
}