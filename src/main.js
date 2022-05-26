import Vue from 'vue'
// CSS重置的现代替代方案
import 'normalize.css/normalize.css'
// 引入element ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 全局的scss
import '@/styles/index.scss'

import App from './App'
// vuex
import store from './store'
// 路由
import router from './router'
// 引入icon
import '@/icons'
// 路由的守卫，控制页面权限的
import '@/permission'

// 注册element ui
Vue.use(ElementUI)

// 生产环境删除vue的一些警告、提示
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
