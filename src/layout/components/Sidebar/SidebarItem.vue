<template>
  <div v-if="!item.hidden && hasPermission">
    <template v-if="!alwaysShow && theOnlyOneChild && !theOnlyOneChild.children">
      <app-link :to="resolvePath(theOnlyOneChild.path)" v-if="theOnlyOneChild.meta">
        <el-menu-item :index="resolvePath(theOnlyOneChild.path)" class="submenu-title-noDropdown">
          <template v-if="theOnlyOneChild.meta.icon">
            <svg-icon
              :icon="theOnlyOneChild.meta.icon"
              v-if="typeof theOnlyOneChild.meta.icon === 'string'"
            />
            <el-icon class="el-menu-icon" v-else>
              <component :is="theOnlyOneChild.meta.icon" />
            </el-icon>
          </template>
          <template #title v-if="theOnlyOneChild.meta.title">
            <span>{{ theOnlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu
      :index="resolvePath(item.path)"
      popper-append-to-body
      ref="subMenu"
      v-else-if="filteredChildren.length > 0"
    >
      <template #title>
        <template v-if="item.meta.icon">
          <svg-icon :icon="item.meta.icon" v-if="typeof item.meta.icon === 'string'" />
          <el-icon class="el-menu-icon" v-else>
            <component :is="item.meta.icon" />
          </el-icon>
        </template>
        <template v-if="item.meta.title">
          <span>{{ item.meta.title }}</span>
        </template>
      </template>

      <sidebar-item
        v-for="child in filteredChildren"
        :key="child.path"
        :base-path="resolvePath(child.path)"
        :is-nest="true"
        :item="child"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import path from 'path-browserify-esm'
import { inject, ref, onMounted, computed } from 'vue'
import { isExternal } from '@/utils/validate'
import { ctx } from '@/store'
import AppLink from './Link.vue'

const context = inject('context')

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    default: '',
  },
})

const subMenu = ref(null)

onMounted(() => {
  // fixBugIniOS()
})

const userRole = computed(() => {
  return ctx.userInfo?.role || 'guest'
})

const MENU_PERMISSIONS = {
  '/admin': ['admin'],                    // Dashboard - admin only
  '/admin/dashboard': ['admin'],          // Dashboard - admin only
  '/admin/categories': ['admin'],         // Categories - admin only
  '/admin/divisi': ['admin'],            // Division - admin only
  '/admin/users': ['admin'],             // Users - admin only
  '/admin/articles': ['admin', 'editor'], // Articles - admin & editor
  '/about': ['admin', 'editor'],         // About - semua
  '/example': ['admin'],                 // Example - admin only
}

//  Check permission berdasarkan path
const checkMenuPermission = (menuPath) => {
  const allowedRoles = MENU_PERMISSIONS[menuPath]
  if (!allowedRoles) {
    return true
  }

  // Check if user role is in allowed roles
  const hasAccess = allowedRoles.includes(userRole.value)

  return hasAccess
}

//  Check if current item has permission
const hasPermission = computed(() => {
  return checkMenuPermission(props.item.path)
})

//  Filter children based on role permissions
const filteredChildren = computed(() => {
  if (!props.item.children) return []

  return props.item.children.filter(child => {
    // Skip hidden children
    if (child.hidden || child.meta?.hidden) return false

    // Check permission for child
    const childPath = path.join(props.item.path, child.path)
    return checkMenuPermission(childPath)
  })
})

/** 是否始终显示根菜单 */
const alwaysShow = props.item.meta?.alwaysShow

/** 显示的子菜单 - WITH ROLE FILTER */
const showingChildren = computed(() => {
  return filteredChildren.value
})

/** 唯一的子菜单项 */
const theOnlyOneChild = computed(() => {
  const number = showingChildren.value.length
  switch (true) {
    case number > 1:
      return null
    case number === 1:
      return showingChildren.value[0]
    default:
      return { ...props.item, path: '' }
  }
})

const resolvePath = (routePath) => {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return path.join(props.basePath, routePath)
}

const fixBugIniOS = () => {
  if (subMenu.value) {
    const handleMouseleave = subMenu.value.handleMouseleave
    subMenu.value.handleMouseleave = (e) => {
      if (context.device === 'mobile') {
        return
      }
      handleMouseleave(e)
    }
  }
}
</script>
