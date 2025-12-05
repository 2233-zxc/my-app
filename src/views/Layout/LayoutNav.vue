<template>
    <nav class="nav-top">
        <ul class="nav-item wrapper">
            <li><a href="#">登录</a></li>
            <li><a href="#">免费注册</a></li>
            <li><a href="#">我的订单</a></li>
            <li><a href="#">会员中心</a></li>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">在线客服</a></li>
            <li><a href="#"><i class="iconfont icon-mobile-phone">手机版本</i></a></li>
        </ul>
    </nav>
</template>
<script>

</script>
<style scoped>
.nav-top{
    width: 100%;
    height: 55px;
    background-color: #333;
    margin-bottom: 20px;
}
.nav-item{
    height: 100%;
    color: #FFFFFF;
    display: flex;
    justify-content: flex-end;
    align-items: center;

}
.nav-item li{
    border-right: 1px solid #999;
    padding-right: 20px;
    padding-left: 20px;
}
.nav-item li:last-child{
    border-right: 0;
    padding-right: 0;
}
.nav-item a{
    color: #FFF;
}
.nav-item li:first-child a{
    color: #5EB69C;
}
</style>