<template>
  <div>
    <OpenMap />
    <TopMenu />
  </div>
</template>
<script setup>
import {onMounted} from "vue";
import OpenMap from "@/views/layout/components/OpenMap.vue";
import TopMenu from "@/views/layout/components/TopMenu.vue";
// import useStore from "@/store";
// import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";

// const route = useRoute();
// console.log(route, "test");

onMounted(()=>{
  // console.log(0)
})
</script>
<style scoped lang="less">
.nav {
  z-index: 999;
}
// .right {
//   //flex: 1;
//   height: 100%;
//   width: calc(100% - 180px);
//   background: #f4f4f4;
// }

// .router {
//   padding: 20px;
// }
// .flex {
//   width: 100%;
//   height: 100%;
//   :deep(> .el-menu) {
//     height: 100vh;
//     overflow: hidden;
//     width: 180px;
//   }
// }
</style>
