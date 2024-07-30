<!--路况信息-->
<template>
  <!-- v-loading: 是一个自定义指令，专门用于处理元素的加载遮罩显示逻辑。 -->
  <div class="wrapDialog" v-loading="registerLoading">
    <el-dialog class="pwd-dialog" v-model="visible" title="路况信息" width="1000" align-center>
      <el-form :model="form" ref="ruleFormRef" label-width="80">
        <div class="searchBox">
          <el-input type="text" v-model="form.eventType" placeholder="请输入事件类型"></el-input>
          <el-button type="primary" @click="searchEvent()">查询</el-button>
          <div class="roadInfoExport">
            <el-icon :size="18">
              <Grid/>
            </el-icon>
            <el-dropdown>
            <span class="el-dropdown-link">
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="roadInfoExport()">导出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

      </el-form>

      <table-view
          v-loading="pageData.loading"
          :tableData="pageData.dataList"
          :columnData="pageData.columnAll"
      >
       <!-- 对于表格中每个“操作”列的单元格，都会根据value渲染出编辑和删除按钮，并绑定了相应的点击事件处理器。 -->
        <template v-slot:operate="{ value }">
          <div class="operate">
            <template v-if="!value.row.status">
              <el-button type="success" @click="passBtn(value)">通过</el-button>
              <el-button type="warning" @click="delBtn(value)">忽略</el-button>
            </template>
            <span v-else>已审核</span>
          </div>
        </template>
      </table-view>

    </el-dialog>


  </div>
</template>

<script setup>
import {reactive, ref, computed} from "vue";
import {ElMessage} from 'element-plus'
import {useLoginStore} from "@/store/login.js";
import {useRouter} from "vue-router";
import TableView from "@/components/tableView.vue";
import * as XLSX from "xlsx";
//import { RefreshLeft} from '@/element-plus/icons-vue'

const router = useRouter();
const mainStore = useLoginStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

// console.log('mainStore.reportRoad111', mainStore.reportRoad)
// 用户把报告路况的信息放到仓库里面，定义一个响应式对象，获取仓库里面的数据
let list = reactive({
  data: mainStore.reportRoad
})

// console.log('list.data', list.data)
// 定义一个响应式对象   获取到的仓库的数据,然后渲染成数组元素
const pageData = reactive({
  loading: false,
  dataList: list.data,
  columnAll: [
    {
      label: "用户名",
      prop: "username",
      width: "100",
      align: "left",
    },
    {
      label: "事件类型",
      prop: "eventType",
      width: "100",
      align: "left",
    },
    {
      label: "事件地址",
      prop: "address",
      width: "120",
      align: "left",
    },
    {
      label: "附近建筑",
      prop: "constructIcon",
      width: "120",
      align: "left",
    },
    {
      label: "发生时间",
      prop: "time",
      width: "180",
      align: "left",
    },
    {
      label: "事件描述",
      prop: "describe",
      width: "180",
      align: "left",
    },
    {
      label: "操作",
      prop: "operate",
      width: "180",
      align: "left",
      slot: "operate"
    },

  ],
});
// console.log(pageData,"渲染后的值")
//遮罩层
let registerLoading = ref(false)
// 用户输入事件类型进行查询
let form = reactive({
  eventType: ''
});

let ruleFormRef = ref(null);


const emits = defineEmits(["update:modelValue"]);
const visible = computed({
  get: () => {
    return props.modelValue;
  },
  set: val => {
    emits("update:modelValue", val);
  },
});

//关闭
const cancel = () => {
  emits("update:modelValue");
}

//查询  如果有查询  用所有的列表数据来进行过滤  如果没有，获取所有列表
const searchEvent = () => {
  if (form.eventType) {
    pageData.dataList = list.data.filter((v) => v.eventType == form.eventType)
    // console.log('list.data', list.data)
  } else {
    pageData.dataList = mainStore.reportRoad
  }
}

//通过
const passBtn = (v) => {
  console.log(v)
  v.row.status = true
  // console.log(v.row)
  //let index = pageData.dataList.findIndex((item) => v.row.id == item.id)
  // 调用数组方法重新把数据添加到pageDate
  pageData.dataList.splice(v.$index, 1, v.row)
}

//忽略   删除数据
const delBtn = (v) => {
  let index = pageData.dataList.findIndex((item) => v.id == item.id)
  pageData.dataList.splice(index, 1)
}


//导出
const roadInfoExport = () => {

  // 假设这是你的表格数据
  let tableData = ref([]);
// JSON.stringify(pageData.dataList)变成字符串对象
  let dataPageList = JSON.parse(JSON.stringify(pageData.dataList))
  console.log(dataPageList)
  dataPageList.forEach((item) => {
    item["用户名"] = item.username//创建一个新的属性"用户名"，其值等于原对象的username属性。
    item["事件类型"] = item.eventType
    item["事件地址"] = item.address
    item["附近建筑"] = item.constructIcon
    item["发生时间"] = item.time
    item["事件描述"] = item.describe
  })

  // 对dataPageList数组进行映射处理（使用.map()方法）
  // 在删除不需要的属性后，通过return item返回这个被修改过的对象
  tableData.value = dataPageList.map((item) => {
    delete item.address
    delete item.constructIcon
    delete item.describe
    delete item.eventType
    delete item.sensitive
    delete item.status
    delete item.time
    delete item.username
    return item
  })

  const header = ['id', "用户名", "事件类型", "事件地址", "附近建筑", "发生时间", "事件描述"]

  // 将数据转换为Worksheet
  const ws = XLSX.utils.json_to_sheet(tableData.value, {header: header}); // 可以指定表头

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); // 添加工作表到工作簿

  // 导出Excel文件
  /* 注意：这里使用Blob和URL.createObjectURL的方式代替file-saver库，
           因为现代浏览器原生支持这种方式导出文件 */
  const wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});

  function s2ab(s) {
    // 将字符串转为ArrayBuffer
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  // 创建并下载文件
  const blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  if (link.download !== undefined) { // 防止IE旧版本和其他不兼容的情况
    link.href = url;
    link.download = new Date().getTime() + '路况信息表格数据.xlsx';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
</script>

<style lang="less" scoped>

.wrapDialog {

  .searchBox {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .roadInfoExport {
      display: flex;
      align-items: center;
      margin: 0 0 0 10px
    }

    :deep(.el-input) {
      width: 300px;
      margin-right: 10px;
    }

    :deep(.el-button) {
      border-radius: 5px !important;
    }
  }

  .title {
    color: white;
    font-size: 32px;
    text-align: center;
    margin-bottom: 30px;
  }

  :deep(.el-dialog__header) {
    border-bottom: 1px solid #000000;
  }

  :deep(.el-dialog) {
    border-radius: 5px;
  }

  :deep(.el-form) {
    padding: 16px 0 40px 0;
    display: flex;

    .el-form-item {
      width: 80%;

      .el-form-item__content {
        width: calc(100% - 70px);
      }

      .el-date-editor {
        width: 100%;
      }
    }

    .el-button {
      width: 150px;
      height: 35px;
      border-radius: 18px;
      font-weight: 600;
      font-size: 18px;
    }

    .btnWrap {
      display: flex;
    }
  }
}

</style>