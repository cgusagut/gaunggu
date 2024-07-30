<!-- 目录树 -->
<template>
  <div>
    <transition name="slide-button">
      <el-button
        type="primary"
        round
        @click="toggleButtonPosition"
        :class="{
          animate__animated: isAnimating,
          animate__slideInLeft: !isButtonRight,
          animate__slideOutRight: isButtonRight,
        }"
        :style="{
          left: isButtonRight ? '225px' : '-15px',
        }"
        >{{ isButtonRight ? "◀" : "▶" }}</el-button
      ><!-- @click="drawer = !drawer" -->
    </transition>
    <div class="layersBox">
      <el-drawer
        v-model="drawer"
        title="图层目录"
        direction="ltr"
        :modal="false"
        :show-close="false"
        size="250px"
      >
        <div class="layersContainer">
          <!--  <div><input checked type="checkbox" />point</div> -->
          <el-tree
            style="max-width: 600px"
            :data="data1"
            show-checkbox
            node-key="id"
            default-expand-all
            :default-checked-keys="[2]"
            :props="defaultProps"
            ref="tree"
            @check="handleCheckChange"
          /><!-- :default-expanded-keys="[1,2]" -->
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import { asyncGetDocInfo } from "@/utils/mapgis-api/index.js";
import { docLayer } from "@/plugins/Layers.js";
import "animate.css";

const isButtonRight = ref(false); // 控制按钮是否处于右侧
const isAnimating = ref(false); // 控制动画状态
const isFirstLoad = ref(true);

const drawer = ref(false);
const defaultProps = {
  children: "children",
  label: "label",
};

const checkedKeys = ref([]);
const tree = ref(null);
const checked = ref(true);
const data1 = ref([
  {
    id: 1,
    label: "地图文档",
    disabled: "true",
    children: [
      {
        id: 2,
        label: "光谷交通地图",
        disabled: "true",
        children: [],
      },
    ],
  },
]);
//加载路网矢量图
// const docLayer = new Zondy.Map.Doc("", "guanggu", {
//   // ip: "localhost",
//   // port: 6163
// });
const theTestList = ref([]);
//获取地图文档信息
let layersCatalog = ref([]);

async function toggleButtonPosition() {
  drawer.value = !drawer.value;//目录树的显示
  isAnimating.value = true; // 开始动画前先标记为正在动画中
  isButtonRight.value = !isButtonRight.value; // 切换按钮位置状态
  await nextTick(); // 等待Vue更新DOM
  isAnimating.value = false; // 动画结束后清除动画状态
  // 首次加载处理，如果是第一次加载（即 isFirstLoad.value 为 true），则调用 handleChecked() 函数进行一些初始化处理，处理完成后，
  // 将 isFirstLoad 设为 false，确保此段逻辑只在首次加载时执行一次。
  if (isFirstLoad.value) {
    handleChecked();
    isFirstLoad.value = false;
  }
}

const handleChecked = () => {
  // 这行代码的作用是更新树形结构中键为2的节点的子节点列表。
  // 替换原有键为2的节点下的所有子节点为 theTestList.value 中的数据
  tree.value.updateKeyChildren(2, theTestList.value);
  // 这行代码用于设置树形结构中应被选中的节点的键集合。它告诉树形组件，应该将键为3、4、5、6、7的节点设置为选中状态。
  tree.value.setCheckedKeys([3, 4, 5, 6, 7]);
};
async function renderMap() {
  // 来获取与"guanggu"相关的文档信息
  let data = await asyncGetDocInfo("guanggu");
  // 处理数据，获取每一个要素
  data.value.forEach((item) => {
    let { GeomType, Name, LayerIndex } = item;
    layersCatalog.value.push({
      type: GeomType,
      id: LayerIndex,
      name: Name,
    });
  });
  // 重新处理这些要素，把要素赋值给theTestList
  theTestList.value = layersCatalog.value.map((item) => {
    return {
      id: +item.id + 3,
      label: item.name,
      type: item.type,
    };
  });
}

const handleCheckChange = (checkedNodes, checkedKeys) => {
  // 切换复选框
  checked.value = !checked.value;
  // 调用mapgis图层进行设置要素的状态是否显示。
  docLayer.setLayerStatus(
    +checkedNodes.id - 3,
    checked.value ? "include" : "exclude"
  );
  // console.log(checkedNodes)
};
onMounted(async () => {
  renderMap();
});
</script>

<style scoped>
@import "animate.css";
:deep(.el-button) {
  position: fixed;
  top: 420px;
  left: 3000px;
  z-index: 10000;
}
:deep(.el-drawer) {
  position: fixed;

  align-content: center;
  margin: 200px 0;
}
:deep(.el-drawer.ltr) {
  height: 50%;
  border-bottom-right-radius: 15px;
  border-top-right-radius: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  border-top: 3px solid #409eff;
  border-bottom: 3px solid #409eff;
  border-right: 3px solid #409eff;
}
:deep(.el-tree) {
  background-color: rgba(255, 255, 255, 0);
}

/* 调整滑入动画时间 */
.animate__slideInLeft {
  /* --animate-duration: 10s; */
  transition: 0.3s ease;
}

/* 调整滑出动画时间 */
.animate__slideOutRight {
  /* --animate-duration: 10s; */
  transition: 0.3s ease;
}
</style>
