<!-- 事件添加 -->
<template>
  <div class="add-event">
    <el-dialog v-model="dialogFormVisible" title="添加事件" align="center">
      <el-form :model="eventform" label-width="auto" style="max-width: 600px">
        <el-form-item label="*事件编号">
          <el-input
            v-model="eventform.id"
            placeholder="SJ+xxxx年xx月xx日000n(第n起事件)"
          />
        </el-form-item>
        <el-form-item label="*事件类型">
          <el-select v-model="eventform.region" placeholder="请选择事件类型">
            <el-option label="碰撞" value="碰撞" />
            <el-option label="刮擦" value="刮擦" />
            <el-option label="碾压" value="碾压" />
            <el-option label="翻车" value="翻车" />
            <el-option label="失火" value="失火" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="*事件等级">
          <el-select v-model="eventform.level" placeholder="请选择事件等级">
            <el-option label="轻微事故" value="1" />
            <el-option label="一般事故" value="2" />
            <el-option label="重大事故" value="3" />
            <el-option label="严重事故" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间" class="datetime-picker">
          <el-col class="block">
            <el-date-picker
              v-model="eventform.date1"
              type="datetime"
              placeholder="请选择事件发生时间"
              style="width: 100%"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="发生地点">
          <el-input v-model="eventform.location" />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="eventform.carnumber" />
        </el-form-item>
        <el-form-item label="驾驶员">
          <el-input v-model="eventform.name" />
        </el-form-item>
        <el-form-item label="*处理状态">
          <el-select v-model="eventform.status" placeholder="请选择处理状态">
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
    </el-dialog>
  </div>
</template>

<script setup>
import { app } from "@/main.js";
import { onMounted, getCurrentInstance, ref, defineExpose } from "vue";
import { addPoint } from "@/utils/mapgis-api/addPoint.js";
import { docLayer } from "@/plugins/Layers.js";
let position = [];
let $map = null;
//let docLayer = null;
let source = null;

const dialogFormVisible = ref(false);
const eventform = ref({
  id: "",
  region: "",
  level: "",
  location: "",
  carnumber: "",
  name: "",
  status: "",
  date1: "",
});

/* const onSubmit = () => {
  console.log("成功提交!");
}; */
onMounted(() => {
  const { proxy } = getCurrentInstance(); //key-code
  // console.log(proxy, "proxy");
  $map = proxy.$map;
  // console.log($map, "$map");
  // 初始化一个空的矢量数据源，创建一个基于该数据源的矢量图层，然后将这个图层添加到地图上
  source = new ol.source.Vector({});
  let layer = new ol.layer.Vector({
    source,
  });
  $map.addLayer(layer);
});
//定义
//传递到父组件调用
const addEventClick = () => {
  // console.log($map, "$map---p");
  // 清空列表
  eventform.value = {
    id: "",
    region: "",
    level: "",
    location: "",
    carnumber: "",
    name: "",
    status: "",
    date1: "",
  };
  //只触发一次  提取出点击的坐标并赋值给position
  $map.once("click", (evt) => {
    position = evt.coordinate;
    // console.log(position, "position");
    dialogFormVisible.value = true;
  });
};
// 提交
const onSubmit = () => {
  // console.log("成功提交!");
  // console.log(position, "position-eventadd");
  dialogFormVisible.value = false;
  // console.log(eventform.value, "eventform.value");
  let attr = [];
  if (
    eventform.value.id ||
    eventform.value.region ||
    Number(eventform.value.level) ||
    Number(eventform.value.status)
  ) {
    attr = [
      { name: "事件编号", type: "string", value: eventform.value.id },
      { name: "事件类型", type: "string", value: eventform.value.region },
      {
        name: "事件等级",
        type: "number",
        value: Number(eventform.value.level),
      },
      { name: "发生时间", type: "string", value: eventform.value.date1 },
      { name: "发生地点", type: "string", value: eventform.value.location },
      { name: "车牌号", type: "string", value: eventform.value.carnumber },
      { name: "驾驶员", type: "string", value: eventform.value.name },
      {
        name: "处理状态",
        type: "number",
        value: Number(eventform.value.status),
      },
    ];
  } else {
    alert("请填写必要信息！");
    return;
  }
//获取所有事件信息
  let service = {
    name: "guanggu",
    layerId: 2,
  };
  // 把点添加到地图
  addPoint({
    position,
    attr,
    service,
    docLayer: docLayer,
  });
  // console.log("成功提交!");
};
//console.log(attr, "attr");
// 传递方法
defineExpose({ addEventClick });
</script>

<style scoped>
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
