<!-- 登陆界面实现 -->
<template>
  <div>
    <div class="main">
      <div class="mainCont">
        <div class="loginLeft"></div>
        <div class="loginView">
          <div class="title">欢迎登录</div>
          <div class="loginType">
            <p
              :class="[userType === 'common' ? 'userType' : '']"
              @click="userTypeHandler('common')"
            >
              普通用户
            </p>
            <p
              :class="[userType === 'traffic' ? 'userType' : '']"
              @click="userTypeHandler('traffic')"
            >
              交管部门
            </p>
            <p
              :class="[userType === 'admin' ? 'userType' : '']"
              @click="userTypeHandler('admin')"
            >
              管理员
            </p>
          </div>
          <el-form
            :model="form"
            :rules="rules"
            ref="ruleFormRef"
            label-width="70"
          >
            <el-form-item prop="userName" label="用户名">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
              ></el-input>
            </el-form-item>
            <el-form-item prop="passWord" label="密码">
              <el-input
                show-password
                type="password"
                v-model="form.password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>

            <div class="btnWrap">
              <el-button @click="onLogin(ruleFormRef)" type="primary"
                >登录</el-button
              >
              <el-button @click="registerBtn()">注册</el-button>
            </div>
          </el-form>
        </div>
        <register v-model="registerVisible"></register>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore } from "../../store/login.js";
import { ElMessage } from "element-plus";
import Register from "@/views/login/register.vue";

const router = useRouter();
const mainStore = useLoginStore();
let form = reactive({
  username: "",
  password: "",
  type: "common",
});
let ruleFormRef = ref(null);

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请填写登录用户名"));
  } else {
    callback();
  }
};
const validatePassword = (rule, value, callback) => {
  if (value.length == 0) {
    callback(new Error("密码不能为空"));
  } else {
    callback();
  }
};
let rules = reactive({
  username: [{ required: true, trigger: "blur", validator: validateUsername }],
  password: [
    {
      required: true,
      trigger: ["change", "blur"],
      validator: validatePassword,
    },
  ],
});

let userType = ref("common");
const registerVisible = ref(false);

//注册
const registerBtn = () => {
  registerVisible.value = true;
};

//登录
const onLogin = (formEL) => {
  if (!formEL) return;
  formEL.validate((valid, e) => {
    if (valid) {
      mainStore.onUseLogin(form).then((res) => {
        ElMessage.success("登录成功");
        router.push("/");
      });
    } else {
      console.log(e);
    }
  });
};

//切换用户类型
const userTypeHandler = (v) => {
  userType.value = v;
  form.type = v;
};
</script>

<style scoped lang="less">
.main::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(10px); /* Adjust blur radius as needed */
  z-index: -1;
}
.main {
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-size: 100% 100%;
  position: relative;
  // background: url("../../assets/img/bg.jpg") no-repeat center top;
  background: url("@/assets/朦胧.jpg") rgba(0, 0, 0, 0.1) no-repeat center top;
  // filter: blur(10px);
  background-size: cover;
  position: relative;
  overflow: hidden;

  .mainCont {
    width: 50%;
    display: flex;
    justify-content: space-between;
    background: whitesmoke;
    border-radius: 5px;
    position: relative;
    z-index: 1;
  }

  .loginLeft {
    width: 40%;
    height: 500px;
    background: url("../../assets/立交.jpg") no-repeat center top;
    background-size: cover;
    border-radius: 5px 0 0 5px;
  }

  .loginView {
    width: 65%;
    height: 100%;
    box-sizing: border-box;
    padding: 15px;
    border-radius: 10px;
    left: 50%;
    top: 50%;

    .title {
      color: black;
      font-size: 32px;
      text-align: center;
      padding: 35px 0 50px 0;
    }
  }
}

.loginType {
  margin: 0 auto 40px auto;
  display: flex;
  width: 77%;
  padding: 0 0 20px 0;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #213547;

  p {
    flex: 1;
    text-align: center;
    cursor: pointer;
    color: black;
  }

  .userType {
    position: relative;

    &:after {
      content: "";
      display: inline-block;
      width: 100%;
      height: 2px;
      background: #d6e6ff;
      position: absolute;
      bottom: -21px;
      left: 0;
    }
  }
}

:deep(.el-form) {
  width: 77%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto 0 auto;

  label {
    color: black;
  }

  .el-form-item {
    width: 100%;
  }

  .el-input {
    width: calc(100 - 70px);
  }

  .el-button {
    width: 150px;
    height: 42px;
    border-radius: 18px;
    font-weight: 600;
    font-size: 18px;
  }

  .btnWrap {
    padding: 30px 0 0 25px;
    display: flex;
  }
}
</style>
