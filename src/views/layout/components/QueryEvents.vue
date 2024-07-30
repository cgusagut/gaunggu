<template>
  <div>
    <div v-if="elementBool" class="element">
      <div style="display: flex">
        <!-- 生成热力图和生成事件统计图的按钮 -->
        <el-button
          plain
          type="primary"
          style="margin-left: 10px"
          :round="true"
          @click="drawer = true"
          >生成热力图</el-button
        >
        <el-button
          plain
          @click="eventChartMap = true"
          type="success"
          :round="true"
          >生成事件统计图</el-button
        >
        <!-- 统计图弹出 -->
        <el-dialog
          v-model="eventChartMap"
          title="事件统计图"
          width="700"
          draggable
        >
          <hr
            style="border: none; height: 1px; background: #333; color: #fff"
          />
          <!-- 统计切换 -->
          <el-tabs
            v-model="activeName"
            type="card"
            class="demo-tabs"
            @tab-click="handleClick"
          >
            <el-tab-pane label="按月份统计" name="first">
              <div style="display: flex">
                <div
                  style="
                    margin-top: 8px;
                    color: red;
                    font-size: 20px;
                    font-weight: bold;
                  "
                >
                  交通事件({{ elementDate.length }}起)
                </div>
                <div style="margin-left: auto; margin-top: 8px">
                  <i
                    class="iconfont icon-wenzhang"
                    style="margin-right: 10px"
                  ></i>
                  <i
                    class="iconfont icon-youxuanzhuan"
                    style="margin-right: 10px"
                  ></i>
                  <i
                    class="iconfont icon-xiazai-copy"
                    style="margin-right: 10px"
                  ></i>
                </div>
              </div>
              <!-- 按月份统计图表 -->
              <div style="width: 100%; margin-top: 50px">
                <my-chart :monthCount="monthCount" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="按类型统计" name="second">
              <div style="display: flex">
                <div
                  style="
                    margin-top: 8px;
                    color: red;
                    font-size: 20px;
                    font-weight: bold;
                  "
                >
                  交通事件({{ elementDate.length }}起)
                </div>
                <div style="margin-left: auto; margin-top: 8px">
                  <i
                    class="iconfont icon-wenzhang"
                    style="margin-right: 10px"
                  ></i>
                  <i
                    class="iconfont icon-youxuanzhuan"
                    style="margin-right: 10px"
                  ></i>
                  <i
                    class="iconfont icon-xiazai-copy"
                    style="margin-right: 10px"
                  ></i>
                </div>
              </div>
              <!-- 按类型统计图表 -->
              <div style="margin-top: 20px">
                <my-cake :accidentCount="accidentCount" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>
        <!-- 热力图 -->
        <el-drawer
          @open="closeDrawMarker()"
          style="height: 250px"
          size="20%"
          v-model="drawer"
          title="热力图"
          :with-header="false"
        >
          <h2>设置热点图的参数:</h2>
          <div class="drawer-content">
            <h3>
              <label>热点半径(radius size):</label
              ><input
                type="range"
                id="radius"
                min="0"
                max="50"
                step="1"
                :value="radius"
                @input="handleRadiusChange"
              />
            </h3>
          </div>

          <div class="slider-container">
            <h3>
              <label>模糊尺寸(blur size):</label
              ><input
                type="range"
                id="blur"
                min="0"
                max="50"
                step="1"
                :value="blur"
                @input="handleBlurChange"
              />
            </h3>
          </div>
        </el-drawer>
        <!-- 下拉框 -->
        <el-button
          type="info"
          :round="true"
          style="margin-left: auto"
          @click="clonseElementList()"
        >
          <i class="iconfont icon-xiangxiajiantou"></i
        ></el-button>
        <!-- 取消事件框 -->
        <el-button
          type="info"
          :round="true"
          style="margin-left: 10px"
          @click="clonseElement()"
          >X</el-button
        >
      </div>
      <!-- element组件 -->
      <el-table
        v-if="elementListBool"
        :data="elementDate"
        height="300"
        style="width: 100%"
        :stripe="true"
        header-align="center"
        empty-text="你未框选到任何数据"
      >
        <el-table-column prop="0" label="事件编号" width="180" />
        <el-table-column prop="1" label="事件类型" width="100" />
        <el-table-column prop="2" label="事件等级" width="100" />
        <el-table-column prop="3" label="发生时间" width="150" />
        <el-table-column prop="4" label="发生地点" width="100" />
        <el-table-column prop="5" label="车牌号" width="100" />
        <el-table-column prop="6" label="驾驶员" width="100" />
        <el-table-column prop="7" label="处理状态" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, provide } from "vue";
import { Query } from "@/utils/mapgis-api/Query.js";
import { createDraw } from "@/utils/createDraw";
import img from "@/assets/坐标点.png";
import MyChart from "./components/MyChart.vue";
import MyCake from "./components/MyCake.vue";
let resArray = ref([]);
const randerArray = ref([]);
let $map = null;
let draw = null;
let source = null;
let GeoData = ref({});
const elementDate = ref([]); //element数据
const elementBool = ref(false);
const elementListBool = ref(true);
const monthCount = ref([]);
const accidentCount = ref([]);
const drawer = ref(false); //控制热力图
// 热力图的半径和渲染
const radius = ref(0);
const blur = ref(0);

let marker_source = new ol.source.Vector({
  features: [],
});
const style = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [0.5, 170],
    anchorOrigin: "top-right",
    anchorXUnits: "fraction",
    anchorYUnits: "pixels",
    offsetOrigin: "top-right",
    // zindex:10000,
    // offset:[0,10],
    //图标缩放比例
    scale: 0.25,
    //透明度
    opacity: 0.75,
    //图标的url
    src: img,
  }),
});
let marker_layer = new ol.layer.Vector({
  source: marker_source,
  style: style,
});
onMounted(() => {
  const { proxy } = getCurrentInstance();
  $map = proxy.$map;
  provide("$map", $map);
  // const docLayer = new Zondy.Map.Doc("", "guanggu", {});
  // $map.addLayer(docLayer);
  /* 点击事件 --mapgis的地图文档中的Point图层添加要素 */
  /* geometry */
  source = new ol.source.Vector({});
  let layer = new ol.layer.Vector({
    source,
  });
  $map.addLayer(layer);
  $map.addLayer(marker_layer);
  draw = createDraw({
    type: "Box",
    source,
  });
  const service = {
    name: "guanggu",
    layerId: 2,
  };
  /* 监听画笔 */
  draw.on("drawend", (evt) => {
    elementBool.value = true;
    // let position = getCoordinate(evt.feature);
    let geometry = evt.feature.getGeometry();
    /* 1、查询要素的查询结构 */
    var queryStruct = new Zondy.Service.QueryFeatureStruct();
    //是否包含几何图形信息
    queryStruct.IncludeGeometry = true;
    //是否包含属性信息
    queryStruct.IncludeAttribute = true;
    //是否包含图形显示参数
    queryStruct.IncludeWebGraphic = false;
    // let pointObj = new Zondy.Object.Point2D(position[0], position[1]);
    // pointObj.nearDis = 1; //必选参数--点的搜索半径
    var geomObj = new Zondy.Object.Polygon();
    geomObj.setByOL(geometry);
    /* 2、设置查询的规则 */
    var rule = new Zondy.Service.QueryFeatureRule({
      //是否将要素的可见性计算在内
      EnableDisplayCondition: false,
      //是否完全包含
      MustInside: false,
      //是否仅比较要素的外包矩形
      CompareRectOnly: false,
      //是否相交
      Intersect: true,
    });

    /* 3、设置查询参数 */
    source.clear();
    var queryParam = new Zondy.Service.QueryParameter({
      geometry: geomObj, //key-code
      resultFormat: "json",
      struct: queryStruct,
      rule: rule,
    });
    /* 4、调用查询服务 */
    var queryService = new Zondy.Service.QueryDocFeature(
      queryParam,
      service.name,
      service.layerId
    );
    queryParam.pageIndex = 0;
    queryParam.recordNumber = 100;
    //执行查询操作，querySuccess为查询回调函数
    queryService.query(querySuccess);
  });

  function querySuccess(data) {
    resArray = [];
    elementDate.value = [];
    marker_source.clear();
    // console.log(data, "查询获取的数据"); //mapgis的要素
    randerArray.value = data.SFEleArray;
    /*----c处理表格数据，拿到柱状图和饼图的数据-------*/
    //获取事故名称事件
    let accidentName = []; //获取到事故数组
    const baseWords = ["碰撞", "刮擦", "其他", "失火", "翻车", "碾压"];
    data.SFEleArray.map((item) => {
      accidentName.push(item.AttValue[1]);
    });
    // 使用 reduce 统计每个词语的出现次数
    const countObj = baseWords.reduce((obj, word) => {
      obj[word] = 0;
      return obj;
    }, {});
    // 遍历并计数，提取每个事件的数量
    accidentName.forEach((word) => {
      if (word in countObj) {
        countObj[word]++;
      }
    });
    accidentCount.value = Object.values(countObj);
    
    //获取月份事件
    let time = []; //日期数组
    data.SFEleArray.map((item) => {
      time.push(item.AttValue[3]);
    });
    let monthlyCounts = new Array(12).fill(0); // 初始化一个长度为12的数组，每个元素默认为0
    time.forEach((event) => {
      let monthIndex = parseInt(event.split(".")[1], 10) - 1; // 提取月份并转换为0-11的索引
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyCounts[monthIndex]++; // 对应月份计数加1
      }
    });
    monthCount.value = monthlyCounts;

    /*------渲染查询到的表格数据---------------*/
    //处理事故等级
    data.SFEleArray.map((item) => {
      switch (item.AttValue[2]) {
        case "1":
          item.AttValue[2] = "特大事故";
          break;
        case "2":
          item.AttValue[2] = "特殊事故";
          break;
        case "3":
          item.AttValue[2] = "普通事故";
          break;
        case "4":
          item.AttValue[2] = "轻微事故";
          break;
      }
      //处理事故结果
      switch (item.AttValue[7]) {
        case "0":
          item.AttValue[7] = "待处理";
          break;
        case "1":
          item.AttValue[7] = "处理中";
          break;
        case "2":
          item.AttValue[7] = "已归档";
          break;
      }
      //创建element的数据
      let obj = {};
      for (let i = 0; i < item.AttValue.length; i++) {
        obj[i] = item.AttValue[i]; // 这里假设值也是相同的，但你可以根据需要设置不同的值
      }
      elementDate.value.push(obj);
    });

    /*--------设置marker-------*/
    //将MapGIS要素JSON反序列化为ol.Feature类型数组
    var format = new Zondy.Format.PolygonJSON();
    resArray = format.read(data);
    if (resArray) {
      GeoData.value = new ol.format.GeoJSON().writeFeaturesObject(resArray);
    } else {
      return;
    }
    marker_source.addFeatures(resArray);
    marker_layer.setSource(marker_source);
  }
});
// 调用画笔执行
function activeDraw() {
  $map.addInteraction(draw);
}

/*---------------热力图实现-------------------*/
const service = {
  name: "guanggu",
  layerId: 2,
};
Query.queryByLayerId({
  service,
  success: queryAllSuccess,
});
let heatMapLayer=null
function queryAllSuccess(data) {
  GeoData.value = new ol.format.GeoJSON().writeFeaturesObject(data);
  heatMapLayer = new ol.layer.Heatmap({
              source: new ol.source.Vector({
                  features: new ol.format.GeoJSON().readFeatures(GeoData.value),
              }),
              blur: 0,
              radius: 0
          });
          $map.addLayer(heatMapLayer);
}
// 处理热点半径滑块变化
const handleRadiusChange = (event) => {
  heatMapLayer.setRadius(parseInt(event.target.value));
};

// 处理模糊尺寸滑块变化
const handleBlurChange = (event) => {
  heatMapLayer.setBlur(parseInt(event.target.value));
};
const closeDrawMarker = () => {
  source.clear(); //去掉下拉框
  marker_source.clear(); //去掉marker
};
/*------------element组件交互逻辑---------------*/
function clonseElement() {
  elementBool.value = false;
  $map.removeInteraction(draw);
  source.clear(); //去掉下拉框
  marker_source.clear(); //去掉marker
  heatMapLayer.setRadius(0);
  heatMapLayer.setBlur(0);
}

//隐藏搜索列表
function clonseElementList() {
  elementListBool.value = !elementListBool.value;
}
//统计图逻辑
const eventChartMap = ref(false);
const activeName = ref("first");
const handleClick = (tab, event) => {};
// 传递方法
defineExpose({ activeDraw });
</script>

<style scoped>
#btn {
  position: absolute;
  top: 30px;
  left: 70px;
  z-index: 999;
  height: 45px;
  width: 100px;
}
.element {
  width: 920px;
  padding: 10px;
  background-color: white;
  position: fixed;
  top: 50%;
  left: 25%;
  border-top: 5px solid rgb(45, 120, 211);
  /* 上边框宽度为3px，样式为实线，颜色为黑色 */
  padding-top: 10px;
  border-radius: 5px;
}
:deep(.el-overlay) {
  background-color: transparent;
}
.drawer-content {
  padding: 10px;
  color: #333;
  font-family: Arial, sans-serif;
}
h2 {
  margin-bottom: 16px;
  color: #4a90e2;
}
.slider-container {
  padding: 10px;
  color: #333;
  font-family: Arial, sans-serif;
  margin-bottom: 24px;
}
</style>
