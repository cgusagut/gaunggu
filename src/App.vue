<template>
  <div class="wrap">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import router from "./router";

onMounted(() => {
  updatePageTitle();
});

watch(
  () => router.currentRoute.value,
  () => {
    updatePageTitle();
  }
);

function updatePageTitle() {
  const currentRoute = router.currentRoute.value;
  document.title = currentRoute.meta.title || "光谷智慧交通系统";
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.wrap {
  width: 100%;
  height: 100%;
}
</style>
