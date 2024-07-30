<!-- 工具箱 -->
<template>
  <div>
    <!-- <button id="area" class="toolbox" @click="activeAreaDraw()">
      测量面积
    </button>
    <button id="line" class="toolbox" @click="activeLineDraw()">
      测量长度
    </button>
    <button id="clear" class="toolbox" @click="closeDraw()">
      清空测量工具
    </button> -->
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, watch, nextTick } from "vue";
import { createDraw } from "@/utils/createDraw.js";
import { setAreaStyle, setLineStyle, setPntStyle } from "@/utils/index.js";
let $map = null;
let lineDrawer = null;
let areaDrawer = null;
let sketch = null;
let measureTooltipElement = ref(null);
const coordinate = ref([]);
let measureTooltip = null;
let geoMetry = null;
let marker_source = new ol.source.Vector({
  features: [],
});
// 创建一个新的矢量图层(ol.layer.Vector)，该图层用于显示标记(markers)或者说是点数据
let marker_layer = new ol.layer.Vector({
  source: marker_source,
  style: setAreaStyle({}),
});
onMounted(() => {
  const { proxy } = getCurrentInstance();
  $map = proxy.$map;
  // console.log($map, "工具箱");
  // 这一行代码获取地图($map)上当前所有激活的交互对象集合
  $map.getInteractions().forEach(function (interaction) {
    // 这行代码检查当前迭代到的交互是否是双击缩放交互的实例。
    if (interaction instanceof ol.interaction.DoubleClickZoom) {
      // 如果当前迭代的交互确实是双击缩放交互，则使用$map.removeInteraction(interaction)方法将其从地图中移除。这意味着用户将不能再通过双击地图来缩放视图。
      $map.removeInteraction(interaction);
    }
  });
  $map.addLayer(marker_layer);
  areaDrawer = createDraw({
    marker_source,
    type: "Polygon",
  });
  lineDrawer = createDraw({
    type: "LineString",
    marker_source,
  });

  //绘制开始时触发的事件
  lineDrawer.on("drawstart", function (evt) {
    createMeasureTooltip();
    const tooltip = document.querySelector(".ol-tooltip");
    tooltip.style =
      "background-color:lightseagreen;opacity:0.65;border-radius:8px;color:white;padding:5px 10px;font-weight:700;";
    sketch = evt.feature;
    //提示框的坐标
    let tooltipCoord = evt.coordinate;
    //定义一个事件监听，监听几何要素的change事件
    sketch.getGeometry().on("change", function (evt) {
      //获取绘制的几何对象
      geoMetry = evt.target;
      let lineArray = [];
      geoMetry.flatCoordinates.forEach((item, index) => {
        if (index % 2 == 0) {
          lineArray.push([item, geoMetry.flatCoordinates[index + 1]]);
        }
      });
      //定义一个输出对象，用于记录长度
      var output;
      //输出多线段的长度
      output = formatLength(lineArray);
      //获取多线段的最后一个点的坐标
      tooltipCoord = geoMetry.getLastCoordinate();
      //设置测量提示框的内标签为最终输出结果
      measureTooltipElement.value.innerHTML = output;
      measureTooltipElement.value.className = "ol-tooltip ol-tooltip-static";
      //设置测量提示框的位置坐标
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  areaDrawer.on("drawstart", function (evt) {
    createMeasureTooltip();
    const tooltip = document.querySelector(".ol-tooltip");
    tooltip.style =
      "background-color:lightseagreen;opacity:0.65;border-radius:8px;color:white;padding:5px 10px;font-weight:700;";
    sketch = evt.feature;
    // console.log(sketch,"绘制面积")
    console.log( sketch.getGeometry())
    //提示框的坐标
    let tooltipCoord = evt.coordinate;
    //定义一个事件监听，监听几何要素的change事件
    // .getGeometry()方法。这个方法的作用是从要素中提取其几何信息
    sketch.getGeometry().on("change", function (evt) {
      // evt事件对象
      //获取绘制的几何对象
      geoMetry = evt.target;
      let areaArray = [[]];
      // console.log( geoMetry.flatCoordinates,"绘制的坐标")
      geoMetry.flatCoordinates.forEach((item, index) => {
        if (index % 2 == 0) {
          //item x坐标    geoMetry.flatCoordinates[index + 1] y坐标
          areaArray[0].push([item, geoMetry.flatCoordinates[index + 1]]);
        }
      });
      //定义一个输出对象，用于记录面积
      var areaOutput;
      //输出多线段的长度
      if (areaArray[0].length > 3) {
        // 获取面积
        const { output } = formatArea(areaArray);
        areaOutput = output;
      }

      if (areaArray[0].length > 3) {
        const { centroid } = formatArea(areaArray);
        // 获取质心
        tooltipCoord = centroid.geometry.coordinates;
        // console.log(tooltipCoord, "新的")
      } else {
        tooltipCoord = geoMetry.getLastCoordinate();
        // console.log(tooltipCoord, "旧的")
      }

      //   设置测量提示框的内标签为最终输出结果
      // 刚开绘制是areaOutput没有值，提示"请绘制感兴趣区计算面积"，有值后提示面积
      measureTooltipElement.value.innerHTML = areaOutput
        ? areaOutput
        : "请绘制感兴趣区计算面积";
      measureTooltipElement.value.className = "ol-tooltip ol-tooltip-static";
      //设置测量提示框的位置坐标
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  lineDrawer.on("drawend", (evt) => {
    marker_source.addFeature(evt.feature);
    $map.removeInteraction(lineDrawer);
  });
  areaDrawer.on("drawend", (evt) => {
    marker_source.addFeature(evt.feature);
    $map.removeInteraction(areaDrawer);
  });
});

//创建一个新的测距提示
const createMeasureTooltip = () => {
  //创建帮助提示要素的div
  measureTooltipElement.value = document.createElement("div");
  //设置帮助提示要素的样式
  measureTooltipElement.value.className = "ol-tooltip ol-tooltip-measure";
  //创建一个帮助提示的覆盖标注
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement.value,
    offset: [25, -15],
    positioning: "bottom-center",
  });
  //将帮助提示的覆盖标注添加到地图中
  $map.addOverlay(measureTooltip);
  //   await nextTick();
};

// 测量距离
const formatLength = (lineArray) => {
  var line = turf.lineString(lineArray);
  //计算平面距离
  var length = turf.length(line, { units: "meters" });
  //定义输出变量
  var output;
  //如果长度大于1000，则使用km单位，否则使用m单位
  if (length > 1000) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }
  return output;
};
const formatArea = (areaArray) => {
  // 创建了一个多边形（Polygon）地理对象
  var polygon = turf.polygon(areaArray);
  //计算平面面积
  var area = turf.area(polygon);
  //定义输出变量
  var output;
  //如果面积大于，则使用km单位，否则使用m单位
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " " + "km²";
  } else {
    output = Math.round(area * 100) / 100 + " " + "m²";
  }
  // 计算了刚刚创建的多边形的质心（Centroid）
  var centroid = turf.centroid(polygon);
  return { output, centroid };
};

const activeLineDraw = () => {
  deactivateDraw();
  $map.addInteraction(lineDrawer);
};
const activeAreaDraw = () => {
  deactivateDraw();
  $map.addInteraction(areaDrawer);
};
const deactivateDraw = () => {
  if ($map) {
    $map.removeInteraction(lineDrawer);
    $map.removeInteraction(areaDrawer);
  }
};
const closeDraw = () => {
  //如果已经存在帮助提示框则移除
  for (let i = 0; i < 999; i++) {
    const tooltip = document.querySelector(".ol-tooltip");
    if (tooltip) {
      tooltip.parentNode.parentNode.removeChild(tooltip.parentNode);
    }
  }
  if (lineDrawer) {
    $map.removeInteraction(lineDrawer);
  }
  if (areaDrawer) {
    $map.removeInteraction(areaDrawer);
  }
  for (let i = 0; i < 999; i++) {
    marker_source.clear();
  }
  $map.removeLayer(marker_layer);
  $map.addLayer(marker_layer);
};
const exportImg = () => {
  $map.once("postcompose", function (event) {
    const canvas = event.context.canvas;
    // console.log(canvas);
    canvas.toBlob(function (blob) {
      // console.log(blob);
      saveAs(blob, "map.png");
    });
  });
  $map.renderSync();
};

defineExpose({ activeLineDraw, activeAreaDraw, closeDraw,exportImg });
</script>

<style scoped>
#area {
  position: absolute;
  top: 150px;
  left: 200px;
}
#line {
  position: absolute;
  top: 150px;
  left: 350px;
}
#clear {
  position: absolute;
  top: 150px;
  left: 500px;
}
.toolbox {
  width: 130px;
  height: 50px;
  cursor: pointer;
  z-index: 1000;
}
:deep(.ol-tooltip) {
  background-color: lightseagreen !important;
  opacity: 0.65 !important;
  border-radius: 8px !important;
  color: white !important;
  padding: 5px 10px !important;
  font-weight: 700 !important;
}
:deep(.ol-tooltip-static) {
  background-color: lightseagreen;
  opacity: 0.65;
  border-radius: 8px;
  color: white;
  padding: 5px 10px;
  font-weight: 700;
}
</style>
