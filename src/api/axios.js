import axios from 'axios'
const request = (url, options) => {
    // 创建 axios 实例
    const service = axios.create({
        baseURL: import.meta.env.VITE_BASE_URL, // api base_url
        timeout: 6000 // 请求超时时间
    });
    // 请求拦截
    service.interceptors.request.use(config => {
        // 这里可设置请求头等信息
        if (options && options.body) {
            config.data = options.body;
        }

        // 如果 token 存在，在每个 HTTP header 都加上 token
        // Bearer 是 JWT 的认证头部信息
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });


    // 返回拦截
    service.interceptors.response.use(response => {
        // 这里可进行返回数据的格式化等操作
        return response.data;
    });
    return service(url, options);
}

export default request;