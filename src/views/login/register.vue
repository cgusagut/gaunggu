<!-- 用户注册弹窗 -->
<template>
  <div class="wrapDialog" v-loading="registerLoading">
    <el-dialog class="pwd-dialog" v-model="visible" title="用户注册" width="530" align-center>
      <el-form :model="form" :rules="rules" ref="ruleFormRef" label-width="70">
        <el-form-item prop="userName" label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="passWord" label="密码">
          <el-input show-password type="password" v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="passWord" label="确认密码">
          <el-input show-password type="password" v-model="form.confirmpassword" placeholder="请输入确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="btnWrap">
            <el-button @click="onRegister(ruleFormRef)" type="primary">注册</el-button>
            <el-button @click="cancel()">取消</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref,computed} from "vue";
import {registerApi} from "@/api/login/index.js";
import {ElMessage} from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

let registerLoading = ref(false)

let form = reactive({
  username: '',
  password: '',
  confirmpassword:'',
  type: 'admin'
});

const validatorUserame = (rule, value, callback) => {
  const userameReg = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;
  if (value === "") {
    callback(new Error("请输入用户名"));
  } else if (value.length < 4) {
    callback(new Error("用户名长度最少 4 位"));
  } else {
    if (userameReg.test(value)) {
      callback();
    } else {
      callback(new Error("用户名格式不正确"));
    }
  }
};

const validatorPassWord = (rule, value, callback) => {
  const passWordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+=])[A-Za-z\d~`!@#$%^&*()_\-+=]{8,16}$/;
  if (value === "") {
    callback(new Error("请输入密码"));
  } else if (value.length < 8) {
    callback(new Error("密码长度最少 8 位且包含大小写字母、符号"));
  } else {
    if (passWordReg.test(value)) {
      callback();
    } else {
      callback(new Error("密码格式错误，请重新输入"));
    }
  }
};

const validatorConfirmPassWord = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入新密码"));
  } else if (value !== form.password) {
    callback(new Error("两次密码不一致，请检查"));
  } else {
    callback();
  }
};

let ruleFormRef = ref(null);
let rules = reactive({
  username: [{ required: true, trigger: "blur", validator: validatorUserame }],
  password: [{ required: true, trigger: ["blur", "change"], validator: validatorPassWord }],
  confirmpassword: [{ required: true, trigger: "blur", validator: validatorConfirmPassWord }],
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

//注册
const onRegister = () => {
  registerLoading.value = true
  registerApi(form).then((res)=>{
    if(res.code === 200){
      ElMessage.success('注册成功')
    }
  }).finally(()=>{
    emits("update:modelValue");
    registerLoading.value = false
  })
}
</script>

<style lang="less" scoped>

.wrapDialog{
  .title {
    color: white;
    font-size: 32px;
    text-align: center;
    margin-bottom: 30px;
  }

  :deep(.el-dialog__header){
    text-align: center;
    font-weight:bold ;
    span{
      font-size: 25px;
      line-height: 40px;
      color: black;
    }
  }
  :deep(.el-dialog){
    background: whitesmoke;
    border-radius: 5px;
  }

  :deep(.el-form) {
    padding: 40px 0 40px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .el-input {
      width: 300px;
    }

    .el-button {
      width: 150px;
      height: 42px;
      border-radius: 18px;
      font-weight: 600;
      font-size: 18px;
    }
    .btnWrap{
      display: flex;
    }
  }
}

</style>