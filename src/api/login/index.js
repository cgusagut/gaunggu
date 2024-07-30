import request from '@/api/axios.js';

//登录
const loginApi = (data)=>{
    return request({
        url: '/api/login',
        method: 'post',
        data
    })
}

//注册
const registerApi = (data)=>{
    return request({
        url: '/api/register',
        method: 'post',
        data
    })
}

//退出
const logoutApi = (data)=>{
    return request({
        url: '/api/logout',
        method: 'post',
        data
    })
}

export {
    loginApi,
    logoutApi,
    registerApi
}
