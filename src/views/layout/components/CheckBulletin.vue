<!-- 查看公告 -->
<template>
  <div v-if="checkBullentinBool" class="element " >
    <div   class="header-container" >
        <h2  style="flex:1;text-align: center">查看公告
        </h2>
         <!-- 取消事件框 -->
         <el-button
          plain
          type="info"
          :round="true"
          style="margin-left:auto;"
          @click="closeElement()"
          >X</el-button
        >
    </div >
    <div style="margin-top:30px !important">
      <el-table
      :data="checkBullentinDate" height="250" stripe border style="width: 100%">
    <el-table-column prop="title" label="公告标题" width="250" />
    <el-table-column prop="content" label="公告内容" width="470" />
    <el-table-column prop="time" label="发布时间" width="180"/>
      <!-- 空数据提示插槽 -->
  <template #empty>
    <div class="no-data-placeholder">暂无公告</div>
  </template>
  </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useDocLayerStore } from "@/store/docLayer.js";
const checkBullentinBool=ref(false)
const $Store = useDocLayerStore();
const checkBullentinDate=ref([])
checkBullentinDate.value = $Store.noticeArray
watch($Store.noticeArray, (newVal) => {
    console.log(newVal)
    checkBullentinDate.value=newVal
}, {
  deep: true,
});
//点击然后弹窗
function clickCheckBullentin(){
  checkBullentinBool.value=true
}
//点击X关闭弹窗
function closeElement(){
  checkBullentinBool.value=false
}
defineExpose({ clickCheckBullentin });
</script>

<style scoped>
.element {
  width: 900px;
  padding: 10px;
  background-color: white;
  position: fixed;
  top: 200px;
  left: 400px;
  border-top: 5px solid rgb(45, 120, 211);
  /* 上边框宽度为3px，样式为实线，颜色为黑色 */
  padding-top: 10px;
  border-radius: 5px;
}
.header-container {
    display: flex; /* 启用Flex布局 */
    justify-content: space-between; /* 在两端对齐子元素，这里的space-between使得文本居左，按钮居右 */
    align-items: center; /* 垂直居中对齐子元素 */
}
</style>
