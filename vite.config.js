import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 配置elementPlus按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// 新增：导入图标解析器
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      dts: 'src/auto-imports.d.ts',
      imports: ['vue', 'vue-router'],
      resolvers: [
        // Element Plus API 自动导入（如 ElMessage）
        ElementPlusResolver({
          importStyle: 'sass',
          directives: true
        }),
        // 新增：图标自动导入解析器
        IconsResolver({
          prefix: 'Icon',
          enabledCollections: ['ep'] // ep 是 Element Plus 图标集
        })
      ]
    }),
    Components({
      dts: 'src/components.d.ts',
      resolvers: [
        // Element Plus 组件自动导入
        ElementPlusResolver({ 
          importStyle: "sass",
          exclude: /^ElIcon.*/ 
        }),
        // Element Plus 图标组件自动导入
        IconsResolver({
          prefix: 'Icon',
          enabledCollections: ['ep']
        })
      ],
    }),
    // 新增：unplugin-icons 插件（处理图标按需导入）
    Icons({
      autoInstall: true, // 自动安装缺失的图标集
      collections: ['ep']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          // 若没有自定义样式文件，直接注释这两行（避免编译报错）
          @use "@/styles/element/index.scss" as *;
          @use "@/styles/var.scss" as *;
          // 保留 message 样式导入，确保弹窗样式生效
          @use "element-plus/theme-chalk/src/message.scss" as *;
        `,
      }
    }
  }
})