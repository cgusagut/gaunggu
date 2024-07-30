<template>
  <div>
    <div id="popup" class="ol-popup">
      <div id="popup-content" class="ol-popup-content" v-html="popupContent"></div>
    </div>
  </div>
</template>

<script setup>
import { app } from "@/main.js";
import { onMounted, getCurrentInstance, ref,nextTick } from "vue";
import video from "@/assets/video/1022084796-1-30080.mp4";
import { Query } from "@/utils/mapgis-api/Query.js";
// import video from '@/assets/video/1022084796-1-30080.mp4'
let $map = null;
let popup = null;
let closeBtn = null;
const popupContent = ref("");
const GeoData = ref({});
const videoList = ref([]);
const isVideoLayerShow = ref(false);
const style = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 8,
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255,0.1)",
      opacity: 0.1,
    }),
  }),
});
// console.log(style);
let marker_source = new ol.source.Vector({
  features: [],
});
let marker_layer = new ol.layer.Vector({
  source: marker_source,
  style: style,
});
marker_layer.setVisible(isVideoLayerShow.value);
const changeVideoLayer = () => {
  isVideoLayerShow.value = !isVideoLayerShow.value;
  marker_layer.setVisible(isVideoLayerShow.value);
  if (!isVideoLayerShow.value) {
    // marker_layer.setVisible(false);
    popup.setPosition(undefined);
    // $("#popup-closer").blur();
  }
};
onMounted(() => {
  const { proxy } = getCurrentInstance(); //key-code
  //console.log(proxy, "proxy");
  $map = proxy.$map;
  //查询点
  let service = {
    name: "guanggu",
    layerId: 3,
  };
  Query.queryByLayerId({
    service,
    // where,
    success: (resArray) => {
      // console.log(resArray, "res-query");
      GeoData.value = new ol.format.GeoJSON().writeFeaturesObject(resArray);
      // console.log(GeoData.value, "GeoData.value");
      /* source.addFeatures(resArray); */
      marker_source.addFeatures(resArray);
      marker_layer.setSource(marker_source);
    },
  });
  let container = document.getElementById("popup");
  // var content = document.getElementById("popup-content");
  // var closer = document.getElementById("popup-closer");
  popup = new ol.Overlay({
    //要转换成overlay的HTML元素
    element: container,
    //当前窗口可见
    autoPan: true,
    //Popup放置的位置
    positioning: "bottom-center",
    //是否应该停止事件传播到地图窗口
    stopEvent: true,
    autoPanAnimation: {
      //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度
      duration: 250,
    },
  });
  $map.addOverlay(popup);
  $map.addLayer(marker_layer);
  /* 3、对地图监听,点击到对应要素popup弹窗显示 */
  //为map添加鼠标移动事件监听,当鼠标移动到元素上的时候会显示手型
  $map.on("pointermove", function (e) {
    var pixel = $map.getEventPixel(e.originalEvent);
    var hit = $map.hasFeatureAtPixel(pixel);
    $map.getTargetElement().style.cursor = hit ? "pointer" : "";
  });
  $map.on("click", function (e) {
  
        // 获取当前点击的点是否存在要素, 并返回
    const feature = $map.forEachFeatureAtPixel(
      e.pixel,
      function (feature, layer) {
        if (layer === marker_layer) {
          let a = feature.values_.values_;
          if (a) {
            const template = `
                <div class="videoinfo"> <p> 摄像头:<span>${a.编号}</span></p> <a href="#" id="popup-closer" @click="closePopup()" ref="closeBtn" class="ol-popup-closer"></a></div>
                <div class="tableBox">
                <table>
                    <tr>
                        <td>位置:</td>
                        <td>${a.位置}</td>
                    </tr>
                    <tr><td colspan="2"><video src='${video}' autoplay muted></video></td></tr>
                </table></div>
                `;
            popupContent.value = template;
            nextTick(() => {
              document
                .getElementById("popup-closer")
                .addEventListener("click", closePopup);
            });
            let position = e.coordinate;
            popup.setPosition(position);
            $map.getView().animate({
              center: position,
              zoom: 14,
              duration: 1000,
            });
          }
          e.stopPropagation()
          return true;
        }
        return false;
      }
    );
    if (!feature) {
      popup.setPosition(undefined);
    }
  });
});
const closePopup = ()=>{
  // console.log("closePopup")
  popup.setPosition(undefined);
}
defineExpose({ changeVideoLayer });
</script>

<style scoped>
.ol-popup {
  position: absolute;
  background-color: white;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  /*   padding: 10px 15px 15px 15px; */
  border-radius: 5px;
  border: 1px solid #cccccc;
  bottom: 13px;
  left: -155px;
  z-index: 100;
  width: auto;
  text-align: center;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 50%;
  transform: translateX(-50%);
}
:deep(#popup-content .videoinfo .ol-popup-closer) {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 10px;
}

:deep(#popup-content .videoinfo .ol-popup-closer:after) {
  content: "✖";
}
#popup-content {
  position: relative;
  font-size: 14px;
  font-family: "微软雅黑";
  text-align: left;
  width: 310px;
  height: 280px;
}

:deep(#popup-content .videoinfo) {
  justify-content: space-around;
  text-align: left;
  font-size: 15px;
  color: #fff;
  background-color: #3a99ff;
  /*  padding: 10px; */
  padding: 5px 15px;
  border-radius: 5px 5px 0 0;
  height: 30px;
  line-height: 30px;
  font-weight: bold;
}
:deep(video) {
  width: 100% !important;
  height: 100% !important;
}
:deep(#popup-content .tableBox) {
  margin: 10px;
  display: flex;
  justify-content: center;
}
:deep(#popup-content table, td, tr) {
  /*   border: 2px solid #eee; */
  margin: 0px;
  padding: 0px;
  border-collapse: collapse;
  line-height: 20px;
}
:deep(#popup-content table td) {
  padding: 10px;
  border: 1px solid #aaa7a7;
}
#popup-content .markerInfo {
  font-weight: bold;
}
</style>
