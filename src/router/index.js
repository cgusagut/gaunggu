import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "layout",
    component: () => import("@/views/layout/index.vue"),
    // redirect: "/index",
    meta: { title: "光谷智慧交通系统" },
    /* 暂时不考虑增加新的子路由页面，先在本路由页面中添加组件 */
    // children: [
    //   {
    //     path: "index",
    //     name: "首页",
    //     component: () => import("@/views/index/index.vue"),
    //   },
    // ],
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
  // 滚动行为，切换页面就置顶
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});


router.beforeEach(async (to,from,next)=>{
    var auth =localStorage.getItem('token');
    if(to.path=="/login" || to.path == '/register'){
        if(auth){
            //router.push("/index")
            next({path:'/index'})
        }else{
            next()
        }
    }else{
        if(auth){
            next();
        }else{
            //router.push("/login")
            next({path:'/login'})
        }
    }
});


export default router;
