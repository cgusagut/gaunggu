<!--用户信息-->
<template>
  <el-dialog class="user-dialog" v-model="visible" title="用户信息" width="830" align-center>
    <div class="wrapUser" v-loading="loading">
      <div class="userAdd">
        <el-button type="primary" :icon="CirclePlusFilled" @click="addUserHandler()">新增</el-button>
        <div class="userSearch">
          <el-input v-model="form.username" style="max-width: 300px" placeholder="请输入用户名"
                    class="input-with-select">
            <template #append>
              <el-button icon="Search" @click="userSearchBtn()"/>
            </template>
          </el-input>

          <div class="userType">
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
                  <el-dropdown-item @click="userSearchBtn('common')">普通用户</el-dropdown-item>
                  <el-dropdown-item @click="userSearchBtn('traffic')">交管部门</el-dropdown-item>
                  <el-dropdown-item @click="userSearchBtn('admin')">管理员</el-dropdown-item>
                  <el-dropdown-item @click="userSearchExport()">导出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

        </div>


      </div>
      <table-view
          v-loading="pageData.loading"
          :tableData="pageData.dataPageList"
          :columnData="pageData.columnAll"
      >
        <template v-slot:operate="{ value }">
          <div class="operate">
            <!-- <el-button type="success" @click="updateHandler(value)">修改</el-button> -->
            <el-button type="warning" @click="userDelete(value)">删除</el-button>
            <template v-if="value.row.isOnline === false">
              <el-button type="warning" @click="userUnonline(value)" >下线</el-button>
            </template>
          </div>
        </template>
      </table-view>

      <div class="pagination">
        <PaginationView :isShowPgBtnBg="page.isShowPgBtnBg"
                        :total="page.total"
                        :pageSize="page.pageSize"
                        :current-page="page.currentPage"
                        @sizeChange="sizeChange"
                        @currentChange="currentChange">
        </PaginationView>
      </div>
      <user-add v-if="userAddVisible" v-model="userAddVisible" @userAddResult="userAddResult"></user-add>
    </div>
  </el-dialog>

</template>

<script setup>
import {userListApi, userDeleteApi, userUpdateApi} from "@/api/user/index.js";
import TableView from "@/components/tableView.vue";
import {computed, reactive, ref} from "vue";
import PaginationView from "@/components/paginationView.vue";
import {CirclePlusFilled} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus';
import UserAdd from "@/views/layout/components/components/userAdd.vue";
// 如果你需要使用整个库的功能，可以按需导入各个工具或类
import * as XLSX from 'xlsx';
// 或者如果你只是需要特定的部分，比如直接使用json转换为worksheet的功能

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

let userAddVisible = ref(false)
let loading = ref(false)

const form = reactive({
  username: '',
  type: ''
})

const page = reactive({
  //分页
  isShowPgBtnBg: true,
  total: 100, //列表总数
  pageSize: 5, //每页条数
  currentPage: 1, //当前页码
})

const pageData = reactive({
  loading: false,
  dataList: [], //全部数据
  dataPageList: [], //当前页数据
  columnAll: [ //表格列
    {
      label: "用户名",
      prop: "username",
      width: "200",
      align: "left",
    },
    {
      label: "用户类型",
      prop: "type",
      width: "200",
      align: "left",
      formatter: data => {
        return data === 'common' ? "普通用户" : data === "traffic" ? '交通部门' : "管理员";
      },
    },
    {
      label: "登录状态",
      prop: "isOnline",
      width: "150",
      align: "left",
      formatter: data => {
        return data == true ? "下线" : "登录";
      },
    },
    {
      label: "操作",
      prop: "operate",
      align: "left",
      slot: "operate"
    },
  ],
});

const emits = defineEmits(["update:modelValue"]);
const visible = computed({
  get: () => {
    return props.modelValue;
  },
  set: val => {
    emits("update:modelValue", val);
  },
});

//新增用户
const addUserHandler = () => {
  userAddVisible.value = true
}

// 当前页条数
const sizeChange = (val) => {
  page.pageSize = val;
  let sliceStart = page.pageSize * (page.currentPage - 1)
  let currentPageData = pageData.dataList.slice(sliceStart, page.pageSize)
  pageData.dataPageList = currentPageData
}

// 下一页
const currentChange = (val) => {
  //debugger
  page.currentPage = val;
  let sliceStart = page.pageSize * (page.currentPage - 1)
  let currentPageData = pageData.dataList.slice(sliceStart, page.pageSize * page.currentPage)
  pageData.dataPageList = currentPageData
}

//关闭
const cancel = () => {
  emits("update:modelValue");
}

const getUserCommon = async (params) => {
  return new Promise((resolve, reject) => {
    userListApi(params).then(res => {
      if (res.code === 200) {
        resolve(res.result)
      } else {
        ElMessage.warning(res.msg)
        reject(res.msg)
      }
    })
  }).catch(err => {
    reject(err)
  })
}

const getAllUser = async () => {
  loading.value = true
  let res = await Promise.all([
    await getUserCommon({type: 'common'}),
    await getUserCommon({type: 'traffic'}),
    await getUserCommon({type: 'admin'}),
  ])
  pageData.dataList = res.flat()
  page.total = pageData.dataList.length

  let sliceStart = page.pageSize * (page.currentPage - 1)
  let currentPageData = pageData.dataList.slice(sliceStart, page.pageSize)
  pageData.dataPageList = currentPageData

  loading.value = false
}
getAllUser()

//删除用户
const userDelete = async (v) => {
  pageData.dataPageList.splice(v.$index, 1)
  let data = {
    type: v.row.type,
    username: v.row.username
  }
  let res = await userDeleteApi(data)
  if (res.code === 200) {
    ElMessage.success(res.msg)
    getAllUser()
  } else {
    ElMessage.error(res.msg)
  }
}

const userUnonline = (v) => {
  let row = v.row
  row.isOnline = true
  pageData.dataPageList.splice(v.$index, 1,row)
  // console.log('pageData.dataPageList',pageData.dataPageList)
}

//更新用户
const updateHandler = async (v) => {
  // console.log(v)
  // let params = {
  //   "id": 32954677,
  //   "username": "adminddddd2",
  //   "password": "Zhu240787+=",
  //   "type": "common",
  //   "isOnline": true
  // }
  // let res = await userUpdateApi(params)
  // console.log('updateHandler', res)
}

//搜索
const userSearchBtn = (v) => {
  

  if (v) {
    let res = pageData.dataList.filter((i) => i.type === v)
    page.total = res.length
    pageData.dataPageList = res
  } else {
    let res = pageData.dataList.filter((i) => i.username.includes(form.username))
    page.total = res.length
    pageData.dataPageList = res
  }

}

//导出
const userSearchExport = () => {

  // 假设这是你的表格数据
  let tableData = ref([]);

  let dataPageList = JSON.parse(JSON.stringify(pageData.dataPageList))
  dataPageList.forEach((item) => {
    item.type = item.type === 'common' ? "普通用户" : item.type === "traffic" ? '交通部门' : "管理员";
    item.isOnline = item.isOnline === true ? "登录" : "下线";
    item.用户名 = item.username
    item.密码 = item.password
    item.用户类型 = item.type
    item.登录状态 = item.isOnline
  })


  tableData.value = dataPageList.map((item) => {
    delete item.isOnline
    delete item.password
    delete item.sensitive
    delete item.type
    delete item.username
    return item
  })

  const header = ['id', "用户名", "密码", "用户类型", "登录状态"]

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
    link.download = new Date().getTime() + '用户信息表格数据.xlsx';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

//用户添加成功后
const userAddResult = (v) => {
  // console.log('emit', v)
  if (v.code === 200) {
    getAllUser()
  }
}


</script>

<style lang="less">

.user-dialog {
  .el-dialog__header {
    border-bottom: 1px solid #000000;
  }

  .wrapUser {
    width: 100%;
    padding: 16px 0 0 0;

    .userAdd {
      width: 100%;
      display: flex;
      flex-direction: row;
      margin: 0 0 16px 0;

      .userSearch {
        display: flex;
        width: calc(100% - 90px);
        justify-content: right;
        align-items: center;
      }

      .userType {
        width: 60px;
        display: flex;
        justify-content: right;
        align-items: center;
      }
    }
  }
}

</style>