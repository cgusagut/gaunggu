<!--事件更新-->
<template>
  <div class="add-event">
    <!-- <div id="eventAdd"> -->
    <!-- <div class="eventHead">
        <span>事件更新</span>
        <span @click="cancel()">X</span>
      </div> -->
    <el-dialog v-model="dialogFormVisible" title="事件更新" align="center">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="*事件编号">
          <el-input
            v-model="form.id"
            placeholder="SJ+xxxx年xx月xx日000n(第n起事件)"
          />
        </el-form-item>
        <el-form-item label="*事件类型">
          <el-select v-model="form.eventType" placeholder="请选择事件类型">
            <el-option label="碰撞" value="碰撞" />
            <el-option label="刮擦" value="刮擦" />
            <el-option label="碾压" value="碾压" />
            <el-option label="翻车" value="翻车" />
            <el-option label="失火" value="失火" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="*事件等级">
          <el-select v-model="form.eventLevel" placeholder="请选择事件等级">
            <el-option label="轻微事故" value="1" />
            <el-option label="一般事故" value="2" />
            <el-option label="重大事故" value="3" />
            <el-option label="严重事故" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间" class="datetime-picker">
          <el-col class="block">
            <el-date-picker
              v-model="form.eventDate"
              type="datetime"
              placeholder="请选择事件发生时间"
              style="width: 100%"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="发生地点">
          <el-input v-model="form.eventLocation" />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="form.carNumber" />
        </el-form-item>
        <el-form-item label="驾驶员">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="*处理状态">
          <el-select v-model="form.status" placeholder="请选择处理状态">
            <el-option label="待处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="已处理" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
      <!-- </div> --></el-dialog
    >
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, inject, reactive, ref } from "vue";
import { setAreaStyle, setPntStyle } from "@/utils/index.js";
import { Point } from "@/utils/mapgis-api/Point.js";
import { docLayer } from "@/plugins/Layers.js";
import { Query } from "@/utils/mapgis-api/Query.js";
const dialogFormVisible = ref(false);
const eventForm = ref({
  id: "",
  region: "",
  level: "",
  location: "",
  carnumber: "",
  name: "",
  status: "",
  date1: "",
});
let form = reactive({
  id: null,
  eventType: "",
  eventLevel: "",
  eventDate: "",
  eventLocation: "",
  carNumber: "",
  name: "",
  status: "",
});

let ruleFormRef = ref(null);
let rules = reactive({
  eventType: [{ required: true, message: "请选择时间类型", trigger: "change" }],
  address: [{ required: true, message: "请输入地址", trigger: "change" }],
  time: [{ required: true, message: "请选择时间", trigger: "change" }],
});
const style = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 8,
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255,0.1)",
      opacity: 0.1,
    }),
  }),
});
//加载事件图层
let eventSource = new ol.source.Vector({}); //定义资源
let eventLayer = new ol.layer.Vector({
  //定义图层
  id: "eventLayerId",
  source: eventSource,
  style: style,
  // zIndex: 999,
});
const isVideoLayerShow = ref(false);
eventLayer.setVisible(isVideoLayerShow.value);
const changeEventUpdateLayer = () => {
  isVideoLayerShow.value = !isVideoLayerShow.value;
  eventLayer.setVisible(isVideoLayerShow.value);
  queryByLayerId({ service, onSuccess });
};

const service = {
  //mapgis服务
  name: "guanggu",
  layerId: 2,
};

const queryByLayerId = ({ service, success }) => {
  //通过图层id查询要素
  //1、初始化查询结构对象，设置查询结构包含几何信息
  var queryStruct = new Zondy.Service.QueryFeatureStruct();
  //是否包含几何图形信息
  queryStruct.IncludeGeometry = true;
  //是否包含属性信息
  queryStruct.IncludeAttribute = true;
  //是否包含图形显示参数
  queryStruct.IncludeWebGraphic = false;
  //2、指定查询规则
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
  //3、实例化查询参数对象
  var queryParam = new Zondy.Service.QueryParameter({
    resultFormat: "json",
    struct: queryStruct,
    rule: rule,
  });
  /* 默认只能获取20条 */
  //设置查询分页号
  queryParam.pageIndex = 0;
  //设置查询要素数目
  queryParam.recordNumber = 100;
  var queryService = new Zondy.Service.QueryDocFeature(
    queryParam,
    service.name,
    service.layerId
  );
  //执行查询操作，querySuccess为查询回调函数
  queryService.query(onSuccess(success));
};

const features = ref([]);
const onSuccess = (success) => {
  return function (data) {
    eventLayer.getSource().clear()
    var format = new Zondy.Format.PolygonJSON();
    //将MapGIS要素JSON反序列化为ol.Feature类型数组
    features.value = format.read(data);
    //success(features);
    eventLayer.getSource().addFeatures(features.value);
    // console.log("features事件", features.value);
  };
};

var attr;
var currentFeature;
var fid;
var position;
onMounted(() => {
  const { proxy } = getCurrentInstance();
  let $map = proxy.$map;
  // eventLayer.getSource().clear()
  queryByLayerId({ service, onSuccess }); //查询所有事件要素，要素添加到资源

  $map.addLayer(eventLayer); //图层添加到地图上

  //鼠标点击事件  获取当前位置
  $map.on("click", function (e) {
    // 获取当前点击的点是否存在要素, 并返回

    

    currentFeature = $map.forEachFeatureAtPixel(
      e.pixel,
      function (currentFeature, layer) {
        if (layer === eventLayer) {
          console.log(currentFeature, "currentFeature");
          return currentFeature;
        }
        return false;
      }
    );
    // position = e.coordinate;
    // console.log(position, "position");
    
    if (currentFeature) {
      position = currentFeature.values_.geometry.flatCoordinates
      console.log("currentFeature", currentFeature);
      form.mpLayer = currentFeature.values_.values_.mpLayer;
      form.id = currentFeature.values_.values_.事件编号;
      form.eventType = currentFeature.values_.values_.事件类型;
      form.eventLevel = currentFeature.values_.values_.事件等级;
      form.eventDate = currentFeature.values_.values_.发生时间;
      form.eventLocation = currentFeature.values_.values_.发生地点;
      form.carNumber = currentFeature.values_.values_.车牌号;
      form.name = currentFeature.values_.values_.驾驶员;
      form.status = currentFeature.values_.values_.处理状态;
      docLayer.refresh();
      // document.querySelector("#eventUpdate").style.display = "block";
      dialogFormVisible.value = true;
      e.stopPropagation();
    }
  });
});

//提交
const onSubmit = () => {
  features.value.forEach((item) => {
    if (item == currentFeature) {
      fid = item.id_;
      console.log("fid", fid);
    }
  });

  /* 只更新属性 */
  attr = [
    { name: "事件编号", type: "string", value: form.id },
    { name: "mpLayer", type: "string", value: form.mpLayer },
    { name: "事件类型", type: "string", value: form.eventType },
    { name: "事件等级", type: "number", value: Number(form.eventLevel) },
    { name: "发生时间", type: "string", value: form.eventDate },
    { name: "发生地点", type: "string", value: form.eventLocation },
    { name: "车牌号", type: "string", value: form.carNumber },
    { name: "驾驶员", type: "string", value: form.name },
    { name: "处理状态", type: "number", value: Number(form.status) },
  ];

  Point.update({
    position,
    attr,
    fid,
    service,
    docLayer,
  });

  queryByLayerId({ service, onSuccess });
  for (let i = 0; i < 100; i++) {
    docLayer.refresh();
  }

  // cancel(); //关闭弹窗
  dialogFormVisible.value = false;
};

//取消
// const cancel = () => {
//   document.querySelector("#eventUpdate").style.display = "none";
// };

defineExpose({ changeEventUpdateLayer });
</script>

<style lang="less" scoped>
.datetime-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}
.datetime-picker .block {
  padding: 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}
</style>
