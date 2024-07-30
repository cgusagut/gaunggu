import {defineStore} from 'pinia'
import {loginApi, logoutApi} from '@/api/login'
import {ElMessage} from 'element-plus'
import { ref,reactive } from 'vue'
import { useRouter } from "vue-router";


export const useLoginStore = defineStore('login', ()=>{
    const router = useRouter();

    
    let userInfo = ref({}) //当前登录用户信息
    let reportRoad =ref( [{
        username:"admin",
        eventType:'失火',
        address:"雄楚大道",
        constructIcon:"某某大厦",
        time:"2024/05/20 19:10:20",
        describe:'碰撞',

    }]) //报告路况
    // 登录
    const onUseLogin = (data)=> {
        return new Promise((resolve, reject) => {
            loginApi(data).then(res => {
                userInfo.value = data
                if (res.code !== 200) {
                    ElMessage.error(res.msg);
                    reject();
                }else {
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    localStorage.setItem('token', res.token);
                    resolve(res.data);
                }

            })
        })
    }

    //退出
    const logout = (data) => {
        return new Promise((resolve,reject)=>{
            logoutApi(data).then(res=>{
                if (res.code !== 200) {
                    ElMessage(res.message);
                    reject();
                }else {
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    resolve(res.data);
                    router.push("/login")
                }
            })
        })
    }


    return {
        userInfo,
        onUseLogin,
        logout,
        reportRoad
    }

})

