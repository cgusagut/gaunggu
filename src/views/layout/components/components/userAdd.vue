<!--用户信息-->
<template>
  <el-dialog class="pwd-dialog" v-model="visible" title="新增用户" width="530" align-center>
    <div class="wrap" v-loading="loading">
      <el-form :model="form" :rules="rules" ref="ruleFormRef" label-width="80">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input show-password type="password" v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item prop="type" label="用户类型">
          <el-select v-model="form.type" placeholder="请选择用户类型">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="btnWrap">
            <el-button @click="onRegister(ruleFormRef)" type="primary">确认</el-button>
            <el-button @click="cancel()">取消</el-button>
          </div>
        </el-form-item>
      </el-form>

    </div>
  </el-dialog>

</template>

<script setup>
import {userListApi} from "@/api/user/index.js";
import TableView from "@/components/tableView.vue";
import {computed, reactive, ref} from "vue";
import PaginationView from "@/components/paginationView.vue";
import {CirclePlusFilled} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus';
import {registerApi} from "@/api/login/index.js";


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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});


const options = [
  {value: 'common', label: '普通用户'},
  {value: 'traffic', label: '交通部门',},
  {value: 'admin', label: '管理员',},
]

let loading = ref(false)
let form = reactive({ //表单
  username: '',
  password: '',
  type:''
});
let ruleFormRef = ref(null); //表单ref
let rules = reactive({ //表单校验
  username: [{required: true, trigger: "blur", validator: validatorUserame}],
  password: [{required: true, trigger: "change", validator: validatorPassWord}],
  type: [{ required: true, message: "请选择用户类型", trigger: "change" }],
});

const emits = defineEmits(["update:modelValue","userAddResult"]);
const visible = computed({
  get: () => {
    return props.modelValue;
  },
  set: val => {
    emits("update:modelValue", val);
  },
});


//确认
const onRegister = () => {
  loading.value = true
  registerApi(form).then((res) => {
    if (res.code === 200) {
      ElMessage.success('登录成功')
      emits("userAddResult", res);
    }
  }).finally(() => {
    emits("update:modelValue");
    loading.value = false
  })
}
//关闭
const cancel = () => {
  emits("update:modelValue");
}

</script>

<style scoped lang="less">
:deep(.el-dialog__header) {
  border: 1px solid #000000;
}

.wrap {
  padding: 16px 0 0 0;
  .userAdd {
    margin: 0 0 16px 0;
  }
}
</style>