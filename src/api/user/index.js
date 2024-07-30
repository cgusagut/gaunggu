import request from '@/api/axios.js';
import qs from 'qs';

//用户列表
const userListApi = (params)=>{
    return request({
        url: '/api/user',
        method: 'get',
        params,
        //paramsSerializer: params => qs.stringify(params, { indices: false }), // 防止qs添加索引
    })
}

//删除用户
const userDeleteApi = (data)=>{
    return request({
        url: '/api/delete',
        method: 'post',
        data,
    })
}


//更新修改
const userUpdateApi = (data)=>{
    return request({
        url: '/api/update',
        method: 'post',
        data,
    })
}


export {
    userListApi,
    userDeleteApi,
    userUpdateApi
}
