<template>
  <div :class="{'has-logo':showLogo}">
    <logo :collapse="isCollapse" v-if="showLogo" />
    <el-scrollbar :height="showLogo ?  'calc(100% - 50px)' : '100%'">
      <el-menu
        :active-text-color="variables.menuActiveText"
        :background-color="variables.menuBg"
        :collapse="isCollapse"
        :collapse-transition="false"
        :default-active="activeMenu"
        :text-color="variables.menuText"
        :unique-opened="false"
        mode="vertical"
        router
      >
        <sidebar-item
          v-for="route in visibleRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'

import { sctx, ctx as globalCtx } from '@/store'
import variables from '@/styles/variables.module.scss'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'

const ctx = inject('context')
const route = useRoute()

const showLogo = sctx.sidebarLogo

const isCollapse = computed(() => {
    return !ctx.sidebar.opened
})

// Ambil routes yang visible (tidak hidden)
const visibleRoutes = computed(() => {
  console.log('🔍 Sidebar reading ctx.accessibleRoutes:', globalCtx.accessibleRoutes)

  if (!globalCtx.accessibleRoutes || !Array.isArray(globalCtx.accessibleRoutes)) {
    console.warn('⚠️ ctx.accessibleRoutes tidak tersedia atau bukan array')
    return []
  }

  // Filter routes yang tidak hidden
  const routes = globalCtx.accessibleRoutes.filter(route => !route.hidden)
  console.log(' Visible menu routes:', routes.length, routes)
  return routes
})

const activeMenu = computed(() => {
    const { meta, path } = route
    if (meta.activeMenu) {
        return meta.activeMenu
    }
    return path
})
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
