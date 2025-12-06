<template>
    <main>
        <HomeBannerCategory/>
        <HomeGoods/>
        <HomeRenqi/>
        <HomeHot/>
        <HomeFresh/>
        <HomeNew/>
    </main>
</template>
<script setup>
import HomeBannerCategory from '@/components/Home/HomeBannerCategory.vue';
import HomeFresh from '@/components/Home/HomeFresh.vue';
import HomeGoods from '@/components/Home/HomeGoods.vue';
import HomeHot from '@/components/Home/HomeHot.vue';
import HomeNew from '@/components/Home/HomeNew.vue';
import HomeRenqi from '@/components/Home/HomeRenqi.vue';
</script>