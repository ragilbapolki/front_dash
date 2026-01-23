import {
  setSidebarStatus
} from '../storage'

import ctx from '../context'

const state = ctx.sidebar

export default {
  close({
    withoutAnimation
  }) {
    state.opened = false
    state.withoutAnimation = withoutAnimation
    setSidebarStatus(0)
  },
  toggle() {
    state.opened = !state.opened
    state.withoutAnimation = false
    setSidebarStatus(state.opened ? 1 : 0)
  },
}
