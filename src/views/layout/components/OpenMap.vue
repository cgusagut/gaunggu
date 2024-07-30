<!-- 地图底图 -->
<template>
  <div>
    <div id="map"></div>
    <div id="mouse"></div>
    <div class="toggle">
      <img
        @click="toggleMap(item.name)"
        v-for="item in imgList"
        :key="item.name"
        :src="item.src"
      />
    </div>
  </div>
</template>
<script setup>
import { app } from "@/main.js";
import {onMounted, getCurrentInstance, ref, provide} from "vue";
import { imgLayergroup, vecLayergroup,docLayer } from "@/plugins/Layers.js";
import image from "@/assets/img/image.png";
import vector from "@/assets/img/vector.png";
import { getLayerByTitle } from "@/utils/index.js";


let $map = null;
//加载路网矢量图
// const docLayer = new Zondy.Map.Doc("", "guanggu", {
//   // ip: "localhost",
//   // port: 6163
// });
onMounted(() => {
  // console.log(2222)
  const map = new ol.Map({
    target: "map",
    layers: [imgLayergroup, vecLayergroup, docLayer],
    view: new ol.View({
      center: [114.38, 30.47],
      zoom: 13,
      projection: "EPSG:4326",
    }),
  });
  app.config.globalProperties.$map = map;

  const { proxy } = getCurrentInstance(); //key-code
  $map = proxy.$map;
  provide('$map', $map);
  // 导航控件
  // const navControl = new ol.control.ZoomToExtent({
  //   extent: [1000, 30, 140, 3000],
  // });
  // $map.addControl(navControl);
//zoomslider控件
  const zoomslider = new ol.control.ZoomSlider();
  $map.addControl(zoomslider);

  //添加鹰眼
  const overviewMapControl = new ol.control.OverviewMap({
    /* 鹰眼控件样式 */
    className: "ol-overviewmap ol-custom-overviewmap",
    layers: [vecLayergroup],
    /* 鹰眼控件展开时功能按钮上的标识(网页的JS的字符编码) */
    collapseLabel: "\u00BB",
    /* 鹰眼控件折叠时功能按钮上的标识(网页的JS的字符编码) */
    label: "\u00AB",
    /* 初始为展开显示方式 */
    collapsed: false,
    view: new ol.View({
      projection: "EPSG:4326",
      minZoom: 8,
      maxZoom: 18,
    }),
  });
  // 往$map上添加控件
  $map.addControl(overviewMapControl);
  //添加鼠标位置,先在头部定义dom   id="mouse"
  $map.on("pointermove", (evt) => {
    let mouse = document.getElementById("mouse");
    mouse.innerHTML = evt.coordinate.map((item) => item.toFixed(2));
  });
});

const imgList = ref([]);
imgList.value = [
  {
    name: "vector",
    src: vector,
  },
  {
    name: "image",
    src: image,
  },
];
const toggleMap = (name) => {
  // let image = getLayerByTitle({
  //   title: "image",
  //   map: $map,
  // });
  // let vector = getLayerByTitle({
  //   title: "vector",
  //   map: $map,
  // });
  if (name == "vector") {
    // setVisible方法用于控制图层的可见性
    imgLayergroup.setVisible(false);
    vecLayergroup.setVisible(true);
  } else {
    imgLayergroup.setVisible(true);
    vecLayergroup.setVisible(false);
  }
};
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
#mouse {
  position: fixed;
  bottom: 20px;
  z-index: 100;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 40px;
  background-color: #652e8080;
  text-align: center;
  line-height: 40px;
  color: #fff;
  border-radius: 5px;
}
/* .ol-zoomslider {
  top: 7.5em !important;
  background-color: #652e8099 !important;
} */
::v-deep .ol-zoomslider {
  top: 8em !important;
  background-color: #652e8099 !important;
}

.ol-zoomslider .ol-control :hover {
  background-color: #652e8070 !important;
  cursor: pointer;
}
.toggle img {
  width: 100px;
  height: 100px;
  border: 1px solid #333;
  margin: 5px;
  border-radius: 10px;
}
.toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
.toggle img:hover {
  cursor: pointer;
  border-color: #ff2d51;
  border-width: 2px;
}
.ol-overviewmap .ol-overviewmap-map {
  border: 1px solid #7b98bc;
  height: 100px;
  margin: 2px;
  width: 100px;
}
</style>
