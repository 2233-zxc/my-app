import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useCounterStore = defineStore('counter', () => {
  //定义数据(state)
  const count = ref(0)

  //定义修改数据的方法(action 同步+异步)
  const increment = () =>{
    count.value++
  }

  //getter定义
  const doubleCount = computed(() => count.value)

  //定义异步action
  const list = ref([])
  const getList = async()=>{
    const res = await axios.get(API_URL)
    list.value = res.data.data.channels
  }

  //以对象的方式return供组件使用
  return { count, doubleCount, increment, list, getList}
})
