<!--报告路况-->
<template>
  <div class="wrapDialog" v-loading="registerLoading">
    <el-dialog class="pwd-dialog" v-model="visible" title="报告路况" width="530" align-center>
      <el-form :model="form" :rules="rules" ref="ruleFormRef" label-width="80">
        <el-form-item prop="eventType" label="事件类型">
          <el-select v-model="form.eventType" placeholder="请选择事件类型">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="address" label="事件地址">
          <el-input type="text" v-model="form.address" placeholder="请输入事件地址"></el-input>
        </el-form-item>
        <el-form-item prop="constructIcon" label="建筑标识">
          <el-input type="text" v-model="form.constructIcon" placeholder="请输入建筑标识"></el-input>
        </el-form-item>
        <el-form-item prop="time" label="发生时间">
          <el-date-picker value-format="YYYY/MM/DD HH:mm:ss" format="YYYY/MM/DD HH:mm:ss" v-model="form.time"
                          type="datetime" placeholder="请选择发生时间"/>
        </el-form-item>
        <el-form-item prop="describe" label="事件描述">
          <el-input type="text" v-model="form.describe" placeholder="请输入事件描述"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="btnWrap">
            <el-button @click="submitForm (ruleFormRef)" type="primary">确认</el-button>
            <el-button @click="cancel()">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref, computed} from "vue";
import {ElMessage} from 'element-plus'
import {useLoginStore} from "@/store/login.js";
import {useRouter} from "vue-router";

// const router = useRouter();
const mainStore = useLoginStore();

// console.log('userInfo', mainStore.userInfo)
//console.log('userInfo',mainStore.userInfo)
// 作用是从浏览器的本地存储（localStorage）中获取一个名为"userInfo"的项目
let userInfo = JSON.parse(localStorage.getItem("userInfo"))

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const options = [
  {value: '碰撞', label: '碰撞',},
  {value: '刮擦', label: '刮擦',},
  {value: '其他', label: '其他',},
  {value: '失火', label: '失火',},
  {value: '碾压', label: '碾压',},
  {value: '翻车', label: '翻车',},
]

let registerLoading = ref(false)

let form = reactive({
  username:userInfo.username,
  id: '',
  eventType: '',
  eventLevel: '',
  eventTime: '',
  eventCarId: '',
  eventPeople: '',
  eventStatus: '',
});

let ruleFormRef = ref(null);
let rules = reactive({
  eventType: [{required: true, message: '请选择时间类型', trigger: 'change'}],
  address: [{required: true, message: '请输入地址', trigger: 'change'}],
  time: [{required: true, message: '请选择时间', trigger: 'change'}],
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

//关闭
const cancel = () => {
  emits("update:modelValue");
}

//提交
const submitForm = async () => {
  // 它调用了从表单引用(ruleFormRef.value.validate)获得的validate方法来触发表单的验证过程。
  await ruleFormRef.value.validate(valid => {
    if (valid) {
      // console.log('form---->', form)
      mainStore.reportRoad.push(form)
      ElMessage.success("提交成功！")
      // 用于重置表单、关闭弹窗或是执行表单提交后的清理工作。
      cancel()
    } else {
      ElMessage.warning("表单校验未通过！")
    }
  });
};
</script>

<style lang="less" scoped>

.wrapDialog {
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
    //background: #048ba3;
    border-radius: 5px;
  }

  :deep(.el-form) {
    padding: 40px 0 40px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

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