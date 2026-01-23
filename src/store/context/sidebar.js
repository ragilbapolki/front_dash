import {
  getSidebarStatus
} from '../storage'

export default {
  opened: getSidebarStatus(),
  withoutAnimation: false
}
