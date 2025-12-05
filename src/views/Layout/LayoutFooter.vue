<template>
    <footer class="footer">
        <div class="footer-box wrapper">
            <div class="footer-title">
                <div class="footer-item">
                    <img src="@/assets/价格亲民.png" alt="">
                    <span>价格亲民</span>
                </div>
                <div class="footer-item">
                    <img src="@/assets/物流快捷.png" alt="">
                    <span>物流快捷</span>
                </div>
                <div class="footer-item">
                    <img src="@/assets/品质新鲜.png" alt="">
                    <span>品质新鲜</span>
                </div>
                <div class="footer-item">
                    <img src="@/assets/售后无忧.png" alt="">
                    <span>售后无忧</span>
                </div>
            </div>
            <div class="footer-content">
                <div class="footer-content-item">
                    <h4>购物指南</h4>
                    <ul>
                        <li><a href="#">购物流程</a></li>
                        <li><a href="#">支付方式</a></li>
                        <li><a href="#">售后规则</a></li>
                        <li></li>
                    </ul>
                </div>
                <div class="footer-content-item">
                    <h4>配送方式</h4>
                    <ul>
                        <li><a href="#">配送运费</a></li>
                        <li><a href="#">配送范围</a></li>
                        <li><a href="#">配送时间</a></li>
                    </ul>
                </div>
                <div class="footer-content-item">
                    <h4>关于我们</h4>
                    <ul>
                        <li><a href="#">平台规则</a></li>
                        <li><a href="#">联系我们</a></li>
                        <li><a href="#">问题反馈</a></li>
                    </ul>
                </div>
                <div class="footer-content-item">
                    <h4>售后服务</h4>
                    <ul>
                        <li><a href="#">售后政策</a></li>
                        <li><a href="#">退款说明</a></li>
                        <li><a href="#">取消订单</a></li>
                    </ul>
                </div>
                <div class="footer-content-item">
                    <h4>服务热线</h4>
                    <ul>
                        <li><a href="#">在线客服<i class="iconfont icon-customer-service"></i></a></li>
                        <li><a href="#">客服电话 400-0000-000</a></li>
                        <li><a href="#">工作时间 周一至周日 8:00-18:00</a></li>
                    </ul>
                </div>
                <div class="footer-content-app">
                    <div class="content-item-left">
                        <img src="@/assets/微信公众号.png" alt="">
                        <p>微信公众号</p>
                    </div>
                    <div class="content-item-right">
                        <img src="@/assets/APP二维码.png" alt="">
                        <p>APP二维码</p>
                    </div>
                </div>
            </div>
            <div class="footer-end">
                <ul>
                    <li><a href="#">关于我们</a></li>
                    <li><a href="#">帮助中心</a></li>
                    <li><a href="#">售后服务</a></li>
                    <li><a href="#">配送与验收</a></li>
                    <li><a href="#">商务合作</a></li>
                    <li><a href="#">搜索推荐</a></li>
                    <li><a href="#">友情链接</a></li>
                </ul>
                <p>CopyRight&copy;小兔鲜</p>
            </div>
        </div>
    </footer>
</template>
<script>

</script>
<style scoped>
.footer{
    background-color: #F5F5F5;
}
.footer-box{
    height: 400px;
}
.footer-title{
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: space-between;
}
.footer-item{
    height: 100%;
    display: flex;
    align-items: center;
}
.footer-content{
    height: 200px;
    display: flex;
    justify-content: space-between;
}
.footer-content-item a{
 color: #333;
}
.footer-content-app{
    width: 240px;
    height: 100%;
    display: flex;
    text-align: center;
}
.footer-end{
    width: 100%;
    height: 50px;
    text-align: center;
}
.footer-end ul{
    display: flex;
    justify-content: center;
}
.footer-end a{
    color: #333;
}
.footer-end li{
    border-right: 1px solid #999;
    padding-right: 10px;
    padding-left: 10px;
}
.footer-end li:last-child{
    border: none;
}
</style>