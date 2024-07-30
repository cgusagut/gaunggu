<template>
  <div>
    <div class="searchInput">
      <el-input
        v-model="searchEvnetType"
        style="max-width: 600px"
        placeholder="搜索事件类型"
        class="input-with-select"
        @keyup.enter="searchComplete()"
      >
        <template #append>
          <!-- <div class="el-input-group__append el-input-group__prepend"> -->
          <i class="iconfont icon-sousuo" @click="searchComplete()"></i>
          <!-- </div> -->
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, onMounted } from "vue";
import { docLayer } from "@/plugins/Layers.js";
import { Query } from "@/utils/mapgis-api/Query.js";
import img from "@/assets/坐标点.png";
const searchEvnetType = ref(""); //搜索框vmodel
let $map = null;
const allEventCity = ref([]);
const afterFilterFeatures = ref([]);
let search_source = new ol.source.Vector({
  features: [],
});
const style = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 170],
    anchorOrigin: "top-right",
    anchorXUnits: "fraction",
    anchorYUnits: "pixels",
    offsetOrigin: "top-right",
    scale: 0.25,
    opacity: 0.75,
    src: img,
  }),
});
let search_layer = new ol.layer.Vector({
  source: search_source,
  style: style,
});
onMounted(() => {
  const { proxy } = getCurrentInstance();
  $map = proxy.$map;
  const service = {
    name: "guanggu",
    layerId: 2,
  };
  Query.queryByLayerId({
    service,
    success: querySuccess,
  });
  function querySuccess(data) {
    // console.log(data, "search");
    allEventCity.value = data;
  }
});
watch(searchEvnetType, (newVal) => {
  afterFilterFeatures.value = allEventCity.value.filter((item) => {
    if (newVal === item.values_.values_.事件类型) {
      return item;
    }
  });
});
const searchComplete = () => {
  for (let i = 0; i < 999; i++) {
    search_source.clear();
  }
  $map.removeLayer(search_layer);
  if (afterFilterFeatures.value.length) {
    search_source.clear();
    $map.addLayer(search_layer);
    search_source.addFeatures(afterFilterFeatures.value);
  } else {
    $map.removeLayer(search_layer);
  }
};
</script>

<style lang="less" scoped>
.searchInput {
  :deep(.el-input-group__append:hover) {
    cursor: pointer;
    background-color: #ffffffb8;
  }
  :deep(.el-input-group__append) {
    padding: 0;
    width: 80px;
    text-align: center;
    margin-right: 120px;
  }
  :deep(i) {
    display: block;
    width: 100%;
  }
}
</style>
