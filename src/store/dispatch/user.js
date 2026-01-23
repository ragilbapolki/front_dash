import {
  getToken,
  setToken,
  removeToken
} from '../storage'
import {
  resetRouter
} from '@/router'

import ctx from '../context'

const state = ctx.userInfo

export default {
  getToken,
  setToken,
  removeToken,

  removeInfo() {
    removeToken() // must remove  token  first
    resetRouter() // 防止后退上一页跳到需要登录的页面
    Object.keys(state).forEach(key => delete state[key]);

  },

  saveInfo(data) {
    Object.assign(state, data)
  },

}
