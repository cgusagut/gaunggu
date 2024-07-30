<!-- 发布公告 -->
<template>
  <div>
    <!-- <el-button plain @click="dialogTableVisible()" style="margin-right: 500px;">
  </el-button> -->
  <div v-if="drawBool">
    <el-dialog
    style="text-align: center"
     v-model="dialogTableVisibleBool" 
     title="发布公告的区域与电话" 
     width="800" @close="handleClose">
     <el-table :data="arrAllNameTel" stripe style="width: 100%" height="250">
        <el-table-column fixed prop="name" label="小区名字" width="400" />
        <el-table-column prop="tel" label="物业电话" width="400" />
      </el-table>
      <h3 style="margin:20px 0 0  -450px " >
        公告标题:
        <el-select
          v-model="selectedOptions"
          clearable
          placeholder="请输入标题"
          style="width: 240px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </h3>
      <h3 style="margin:20px 0 0  -700px " >公告信息</h3>
      <div style="margin: 20px">
        <el-input
          :rows="4"
          v-model="textarea1"
          style="width: 100%; height: 100px; overflow-y: hidden"
          type="textarea"
          placeholder="你好!xxx道路近期维修,时间2024年xx月xx日--2024年xx月xx日,请及时规划出行路线,避免对你的出行造成影响"
        />
      </div>
      
      <hr style="margin: 10px" />
      <div style="text-align: center">
        <el-button @click="closeDrawBool()" type="info" style="width: 100px"
          >取消</el-button
        >
        <el-button  @click="SendAffiche()" plain type="success" style="width: 100px"> 发送 </el-button>
      </div>
  </el-dialog>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { Query } from "@/utils/mapgis-api/Query.js";
import { createDraw } from "@/utils/createDraw";
import { setLineStyle, setAreaStyle } from "@/utils/index.js";
import { ElMessage } from 'element-plus' //必写
import {useDocLayerStore} from "@/store/docLayer.js"

let $map = null;
let geoBuffer = null;
const arrAllNameTel = ref([]);
const $Store = useDocLayerStore()
let drawBool = ref(false); //弹窗
const textarea1 = ref(""); //发布的内容
const selectedOptions = ref(""); //选中的值
const options = [
  { label: "关于维修事件的交通管制公告", value: "关于维修事件的交通管制公告" },
  { label: "关于碰撞事件的交通管制公告", value: "关于碰撞事件的交通管制公告" },
  { label: "关于刮擦事件的交通管制公告", value: "关于刮擦事件的交通管制公告" },
  { label: "关于其他事件的交通管制公告", value: "关于其他事件的交通管制公告" },
  { label: "关于失火事件的交通管制公告", value: "关于失火事件的交通管制公告" },
  { label: "关于翻车事件的交通管制公告", value: "关于翻车事件的交通管制公告" },
  { label: "关于碾压事件的交通管制公告", value: "关于碾压事件的交通管制公告" },
];
const afficheArray = ref([]); //发送的数据
const dialogTableVisibleBool = ref(false)
onMounted(() => {
  const { proxy } = getCurrentInstance();
  $map = proxy.$map;
  // provide("$map", $map);
  $map.addLayer(lineLayer); //交互式线
  // 取消双击放大图层
  $map.getInteractions().forEach((interaction) => {
    if (interaction instanceof ol.interaction.DoubleClickZoom) {
      $map.removeInteraction(interaction);
    }
  });
});
/* 设置一个画笔 */
/* 1、构建画布*/
// 线图层
let lineSource = new ol.source.Vector({});
let lineLayer = new ol.layer.Vector({
  source: lineSource,
  style: setLineStyle({}),
});
// console.log($map, '外面') //这里获取不到是因为没有执行任何逻辑
// 缓冲区图层
const bufferLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: [],
  }),
  style: setAreaStyle({ fill: "blue" }),
});

/* 2、创建 线 画笔 */
const lineDraw = createDraw({
  source: lineSource,
  type: "LineString",
});
/* 3、点击之后激活画笔 */
function activeLineDraw() {
  $map.addInteraction(lineDraw);
}
/* 4、监听画笔 */
lineDraw.on("drawend", (evt) => {
  drawBool.value = true; //弹窗
  dialogTableVisible()//监听画笔,调用弹窗
  close(); //取消选中的标题和输入的文本
  /* 【缓冲区分析】 */
  let geoPolygon = new ol.format.GeoJSON().writeFeatureObject(evt.feature); //OPenlayers的Feature => GeoJSON
  let { coordinates } = geoPolygon.geometry; //GeoJSON线的数据结构

  const line = turf.lineString(coordinates);
  geoBuffer = turf.buffer(line, 0.1); //缓冲区分析 得到GeoJSON数据(区要素)
  const olFeatures = new ol.format.GeoJSON().readFeatures(geoBuffer); //GeoJSON => OPenlayers的Feature
  bufferLayer.getSource().clear();
  bufferLayer.getSource().addFeatures(olFeatures); //添加数据到缓冲区图层

  /* 【图层叠加分析】 */
  // 获取居民的GeoJSON数据(mapgis数据 => OL)
  const service = { name: "guanggu", layerId: 0 };
  Query.queryByLayerId({
    service,
    success: (res) => {
      let geoRidPolygon = new ol.format.GeoJSON().writeFeaturesObject(res);
      geoRidPolygon.features.map((item) => {
        //遍历每个居民区的图层来做拓扑
        const result = turf.intersect(item, geoBuffer);
        if (result) {
          // 给拓扑出来的区域加上属性值 处理数据  拿到最终结果
          result.properties = item.properties.values_;
          // console.log(result.properties)
          const { name, tel } = result.properties;
          let obj = {};
          let propName = "name";
          let propTel = "tel";
          obj[propName] = name;
          obj[propTel] = tel;
          arrAllNameTel.value.push(obj); //最终数据
          // console.log(arrAllNameTel.value)
        }
      });
    },
  });
  /* 清除线画笔 */
  $map.removeInteraction(lineDraw);
  // 确保缓冲区图层在最上方
  $map.addLayer(bufferLayer);
});
/*---------关闭X的逻辑-----------*/
function handleClose(){
  lineSource.clear();//清除线
  $map.removeInteraction(lineDraw);
  $map.removeLayer(bufferLayer);
  arrAllNameTel.value.length=0
}
/*-------取消按钮的逻辑----------*/
function closeDrawBool() {
  lineSource.clear(); //清除线
  $map.removeInteraction(lineDraw);
  $map.removeLayer(bufferLayer);
  drawBool.value = false;

  arrAllNameTel.value.length = 0;
}
/*------------发送按钮的逻辑----------*/
const SendAffiche = () => {
  //弹窗
  ElMessage({
    message: '发送成功',
    type: 'success',
  })
  // 获取当前日期和时间
  let now = new Date();
  // 获取年份
  let year = now.getFullYear();
  // 获取月份（注意JavaScript中的月份是从0开始的，所以需要加1），并补0处理
  let month = ("0" + (now.getMonth() + 1)).slice(-2);
  // 获取日期，并补0处理
  let date = ("0" + now.getDate()).slice(-2);
  // 获取小时（24小时制），并补0处理
  let hours = ("0" + now.getHours()).slice(-2);
  // 获取分钟，并补0处理
  let minutes = ("0" + now.getMinutes()).slice(-2);
  // 构建完整的时间字符串，例如 "2023-04-01 15:30"
  let fullTime = `${year}-${month}-${date} ${hours}:${minutes}`;
  let obj = {
    title: selectedOptions.value,
    content: textarea1.value,
    time: fullTime,
  };
  afficheArray.value.push(obj);
  $Store.pushNoticeArray(obj)
  // console.log(afficheArray.value);
  lineSource.clear();
  $map.removeInteraction(lineDraw);
  $map.removeLayer(bufferLayer);
  drawBool.value = false;

  arrAllNameTel.value.length = 0; //小区名字电话清空
};

function close() {
  if (afficheArray.value.length) {
    selectedOptions.value = "请输入标题";
    textarea1.value = "";
  }
}
function dialogTableVisible(){
  dialogTableVisibleBool.value=true
}
defineExpose({ activeLineDraw });
</script>

<style scoped>
.element {
  width: 700px;
  padding: 10px;
  background-color: white;
  position: fixed;
  top: 200px;
  left: 600px;
  border-top: 5px solid rgb(45, 120, 211);
  /* 上边框宽度为3px，样式为实线，颜色为黑色 */
  padding-top: 10px;
  border-radius: 5px;
}
</style>
