import { useIntersectionObserver } from "@vueuse/core";
//定义懒加载组件(懒加载组件对视图是实时监听的,需要在第一次发送图片资源请求时停止监听,防止内存浪费)
export const lazyPlugin = {
    install(app){
        //懒加载指令逻辑
        //1.图片懒加载指令
        app.directive('img-lazy', {
            mounted(el,binding){
                //el:指定绑定的那个元素 img
                //binding:binding.value  指令等于后面绑定的表达式的值 图片url
                // console.log(el,binding.value);
                
                //引入useIntersectionObserver里的stop方法实现停止对视图的监听
                const {stop} = useIntersectionObserver(
                    el,
                    ([{isIntersecting}]) => {
                        //如果图片进入可视窗口,打印isIntersecting,如何进入isIntersecting为true,未进入则未false
                        // console.log(isIntersecting)
                        if(isIntersecting){
                            //如果图片进入可视窗口,发送图片资源请求
                            el.src = binding.value
                            stop()
                        }
                    }
                )
            }
        })
    }
}