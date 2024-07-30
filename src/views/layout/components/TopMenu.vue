<template>
  <div class="nav">
    <el-menu
      :default-active="activeIndex2"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      @select="handleSelect"
    >
      <el-menu-item index="">
        <template #title
          ><img
            src="@/assets/wired-lineal-1068-international-music.gif"
            style="width: 50px; height: 50px"
          />&nbsp;&nbsp;
          <span style="font-size: 23px; font-family: 'YouYuan'"
            >光谷智慧交通系统</span
          >
        </template>
      </el-menu-item>
      <el-menu-item index="1" @click="currentRoad()">实时路况</el-menu-item>
      <el-menu-item index="2" @click="reportRoadHandle()"
        >报告路况</el-menu-item
      >
      <el-menu-item
        index="3"
        @click="openVideoPopup()"
        v-if="userInfo.type == 'common' ? false : true"
        >视频监控</el-menu-item
      >
      <el-menu-item
        index="4"
        @click="addFeaturesClick()"
        v-if="userInfo.type == 'common' ? false : true"
        >事件添加</el-menu-item
      >
      <el-menu-item
        index="5"
        @click="eventQueryClick()"
        v-if="userInfo.type == 'common' ? false : true"
        >事件查询</el-menu-item
      >
      <el-menu-item
        index="6"
        @click="eventUpdateClick()"
        v-if="userInfo.type == 'common' ? false : true"
        >事件更新</el-menu-item
      >
      <el-sub-menu index="7">
        <template #title>公告信息</template>
        <el-menu-item index="7-1" @click="viewBulletin()"
          >查看公告</el-menu-item
        >
        <el-menu-item
          index="7-2"
          @click="MessageToBroadcast()"
          v-if="userInfo.type == 'common' ? false : true"
          >发布公告</el-menu-item
        >
        <!-- <el-menu-item index="7-3">item three</el-menu-item> -->
      </el-sub-menu>
      <el-menu-item index="8" @click="roadInfoHandle()" v-if="userInfo.type=='common'?false:true">路况信息</el-menu-item>
      <el-sub-menu index="9">
        <template #title>工具箱</template>
        <el-menu-item index="9-1" @click="toolBoxTurf()">测量面积</el-menu-item>
        <el-menu-item index="9-2" @click="toolLineTurf()"
          >测量距离</el-menu-item
        >
        <el-menu-item index="9-3" @click="toolClose()">关闭测量</el-menu-item>
        <el-menu-item index="9-4" @click="exportMapImg()"
          >导出地图</el-menu-item
        >
      </el-sub-menu>
      <el-menu-item index="10" @click="userInfoHandle()" v-if="userInfo.type=='admin'?true:false">用户信息</el-menu-item>
    </el-menu>
    <search-input></search-input>
    <div class="loginOut">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          {{ userInfo.username }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="loginOut()">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!--    <popup></popup>-->
    <report-road
      v-if="reportRoadVisible"
      v-model="reportRoadVisible"
    ></report-road>
    <road-info v-if="roadInfoVisible" v-model="roadInfoVisible"></road-info>
    <video-popup ref="popupVideo"></video-popup>
    <query-events ref="eventsQuery"></query-events>
    <event-add ref="eventAdd"></event-add>
    <user-info v-if="userInfoVisible" v-model="userInfoVisible"></user-info>
    <tool-box ref="toolBoxPro"></tool-box>
    <layer-catalog v-if="userInfo.type=='common'?false:true"></layer-catalog>
    <event-update ref="stratUpdateEvent"></event-update>
    <notice-info ref="noticeInfoTurf"></notice-info>
    <check-bulletin ref="entertip"></check-bulletin>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, onMounted, provide } from "vue";
import { roadConditionsHooks } from "../../hooks/roadConditionsHooks.js";
import { toolLineHooks } from "@/views/hooks/toolLineHooks.js";
import { ArrowDown } from "@element-plus/icons-vue";
import { useLoginStore } from "@/store/login.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { toolBoxHooks } from "@/views/hooks/toolBoxHooks.js";
import ReportRoad from "@/views/layout/components/reportRoad.vue";
import RoadInfo from "@/views/layout/components/roadInfo.vue";
// import Popup from "@/views/layout/components/popup.vue";
import QueryEvents from "@/views/layout/components/QueryEvents.vue";
import UserInfo from "@/views/layout/components/userInfo.vue";
import VideoPopup from "@/views/layout/components/VideoPopup.vue";
import LayerCatalog from "@/views/layout/components/LayerCatalog.vue";
import EventUpdate from "@/views/layout/components/eventUpdate.vue";
import ToolBox from "@/views/layout/components/ToolBox.vue";
import NoticeInfo from "@/views/layout/components/NoticeInfo.vue";
import CheckBulletin from "@/views/layout/components/CheckBulletin.vue";
import EventAdd from "@/views/layout/components/EventAdd.vue";
import SearchInput from "@/views/layout/components/SearchInput.vue";
const router = useRouter();
const mainStore = useLoginStore();

const userInfoVisible = ref(false);
const reportRoadVisible = ref(false);
const roadInfoVisible = ref(false);
const eventAdd = ref(null); //事件添加
const popupVideo = ref(null); //视频监控
const eventsQuery = ref(null); //查询事件
const toolBoxPro = ref(null);
const noticeInfoTurf = ref(null); //发布公告
const entertip = ref(null); //查看公告
const stratUpdateEvent = ref(null); //事件更新

const activeIndex2 = ref("1");
const handleSelect = (key, keyPath) => {
  // console.log(key, keyPath);
};
let memu = ref([]);

let $map = null;

onMounted(() => {
  const { proxy } = getCurrentInstance(); //key-code
  $map = proxy.$map;
});

let userInfo = JSON.parse(localStorage.getItem("userInfo")); //用户信息

//实时路况
let status = true;
const currentRoad = () => {
  const { showRoad, layerRoad } = roadConditionsHooks($map);
  if (status == true) {
    showRoad();
  } else {
    let arr = $map.getLayers().getArray();
    console.log(arr,"所有的图层")
    arr.forEach((item) => {
      if (item.values_.id == "highRoadLayers") {
        $map.removeLayer(item);
      }
    });
    $map.getLayers().remove(layerRoad);
  }
  status = !status;
};

//用户信息
const userInfoHandle = () => {
  userInfoVisible.value = true;
};

//报告路况
const reportRoadHandle = () => {
  reportRoadVisible.value = true;
};
//视频监控
const openVideoPopup = () => {
  if (popupVideo.value.changeVideoLayer) {
    popupVideo.value.changeVideoLayer();
  }
};
//事件查询
const eventQueryClick = () => {
  if (eventsQuery.value.activeDraw) {
    eventsQuery.value.activeDraw();
  }
};
//事件更新
const eventUpdateClick = () => {
  if (stratUpdateEvent.value.changeEventUpdateLayer) {
    stratUpdateEvent.value.changeEventUpdateLayer();
  }
};
//事件添加
const addFeaturesClick = () => {
  if (eventAdd.value.addEventClick) {
    eventAdd.value.addEventClick();
  }
};
//查看公告
const viewBulletin = () => {
  if (entertip.value.clickCheckBullentin) {
    entertip.value.clickCheckBullentin();
  }
};
//发布公告
const MessageToBroadcast = () => {
  if (noticeInfoTurf.value.activeLineDraw) {
    noticeInfoTurf.value.activeLineDraw();
  }
};

//路况信息
const roadInfoHandle = () => {
  roadInfoVisible.value = true;
};

//工具箱 测量面积
// const toolBoxTurf = () => {
//   const { activeBoxDraw } = toolBoxHooks($map);
//   const { toolDrawLine } = toolLineHooks($map);

//   //移除测量距离画笔
//   toolDrawLine.setActive(false);
//   $map.removeInteraction(toolDrawLine);

//   activeBoxDraw();
// };
//工具箱重做 测量面积
const toolBoxTurf = () => {
  if (toolBoxPro.value.activeAreaDraw) {
    toolBoxPro.value.activeAreaDraw();
  }
};

//测量线段长度
// const toolLineTurf = () => {
//   const { activeLineDraw } = toolLineHooks($map);
//   const { toolDrawBox } = toolBoxHooks($map);

//   //移除测量面积画笔
//   toolDrawBox.setActive(false);
//   $map.removeInteraction(toolDrawBox);
//   activeLineDraw();
// };
const toolLineTurf = () => {
  if (toolBoxPro.value.activeLineDraw) {
    toolBoxPro.value.activeLineDraw();
  }
};

//关闭测量
// const toolClose = () => {
//   let arr = $map.getLayers().getArray();
//   console.log("arr", arr);

//   arr.forEach((item) => {
//     if (
//       item.values_.id == "markBoxLayerId" ||
//       item.values_.id == "toolBoxDrawId" ||
//       item.values_.id == "markLineLayerId" ||
//       item.values_.id == "drawlineLayerId"
//     ) {
//       $map.removeLayer(item);
//     }
//   });
//   const { toolDrawBoxLayer, markBoxLayer, sourceBox } = toolBoxHooks($map);
//   sourceBox.clear();
//   const { toolDrawLineLayer, markLineLayer, sourceLine } = toolLineHooks($map);
//   sourceLine.clear();
//   $map
//     .getLayers()
//     .remove(toolDrawBoxLayer, markBoxLayer, toolDrawLineLayer, markLineLayer);
// };
//关闭测量
//关闭测量
const toolClose = () => {
  if (toolBoxPro.value.closeDraw) {
    toolBoxPro.value.closeDraw();
  }
};

//导出地图
const exportMapImg = () => {
  if (toolBoxPro.value.exportImg) {
    toolBoxPro.value.exportImg();
  }
};

//退出登录
const loginOut = () => {
  console.log("退出")
  mainStore.logout(userInfo).then((res) => {
    ElMessage.success("退出成功");
    router.push("/login");
  });
};
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.nav {
  display: flex;
  position: fixed;
  z-index: 10000;
  width: 100vw;
  background: #545c64;
  align-items: center;
}

:deep(.el-menu) {
  border: none !important;
  width: calc(100% - 100px);
}

.loginOut {
  position: fixed;
  right: 10px;
  z-index: 999999;
  :deep(.el-dropdown) {
    .el-dropdown-link {
      border: none !important;
      color: #ffffff;
    }
  }
}
</style>
