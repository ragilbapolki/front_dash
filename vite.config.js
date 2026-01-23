import {
  fileURLToPath,
  URL
} from 'node:url'

import {
  defineConfig,
  loadEnv
} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// ElementPlus components
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// ElementPlus svg icon
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
// SvgSpritemap
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'
// markdown
import mdPlugin from 'vite-plugin-markdown'

export default defineConfig(({
  mode
}) => {
  const env = loadEnv(mode, process.cwd())

  const config = {
    base: env.VITE_BASE_URL,
    plugins: [
      mdPlugin.plugin({
        mode: [mdPlugin.Mode.VUE]
      }),
      // svg 雪碧图
      VitePluginSvgSpritemap('./src/icons/svg/*.svg', {
        // injectSvgOnDev: true,
      }),
      vue(),
      vueDevTools(),
      AutoImport({
        resolvers: [
          // 自动导入 element plus 相关函数 如ElMessage
          ElementPlusResolver(),
          // Auto import icon components
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon'
          })
        ],
      }),
      Components({
        resolvers: [
          // 自动导入 element plus 组件
          ElementPlusResolver(),
          // 自动注册图标组件@iconify-json/ep
          IconsResolver({
            // prefix: 'i', // 默认：'i' 使用： {prefix}-{collection}-{icon}
            enabledCollections: [
              'ep'
            ],
          }),
        ],
      }),
      Icons({
        autoInstall: true, // 自动安装了 enabledCollections 指定的图标 如@iconify-json/ep
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // Server configuration with proxy to fix CORS
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, '/api') // Optional: jika perlu rewrite path
        },
        '/storage': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/sanctum': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // Build configuration
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            'vue-vendor': ['vue', 'vue-router'],
          }
        }
      }
    }
  }

  return config
})
