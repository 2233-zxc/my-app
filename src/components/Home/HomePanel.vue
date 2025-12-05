<!-- 可复用组件使用prpos实现父组件向子组件传递(通过属性传递),使用插槽实现传递div模板 -->
<template>
    <div class="panel wrapper">
        <div class="panel-title">
            <div class="title-left">
                <h3>{{ title }}</h3>
                <p>{{ subTitle }}</p>
            </div>
            <div class="title-right">
                <a href="#">查看全部</a>
                <span class="iconfont icon-arrow-right-bold"></span>
            </div>
        </div>
        <!-- 主体内容 -->
        <slot></slot>
    </div>
</template>
<script setup>
//定义Prpos
defineProps({
    //主标题
    title:{
        type:String
    },
    //副标题
    subTitle:{
        type:String
    }
})

</script>
<style scoped>
.panel{
    height: 470px;
    margin-bottom: 20px;
}
.panel-title{
    height: 42px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}
.title-left{
    display: flex;
    align-items: center;
}
.title-left h3{
    margin: 0;
    font-size: 30px;
    color: #333333;
}
.title-left p{
    margin-bottom: 0;
    margin-left: 20px;
    color: #A1A1A1;
}
.title-right a{
    color: #A1A1A1;
}
</style>