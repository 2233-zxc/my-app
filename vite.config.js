import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 配置elementPlus按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      // 修复1：指定自动导入的文件路径，确保全局可用
      dts: 'src/auto-imports.d.ts',
      imports: ['vue', 'vue-router'],
      resolvers: [
        // 修复2：完整配置Element Plus解析器，包含样式
        ElementPlusResolver({
          importStyle: 'sass', // 启用scss样式
          directives: true // 导入Element Plus指令（如Loading）
        })
      ]
    }),
    Components({
      // 修复3：指定组件声明文件路径
      dts: 'src/components.d.ts',
      resolvers: [
        // 配置elementPlus采用sass样式配色系统
        ElementPlusResolver({ 
          importStyle: "sass",
          // 修复4：确保所有组件都能被按需导入（包括MessageBox/Message）
          exclude: /^ElIcon.*/ 
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 修复5：确保样式文件路径正确，若没有自定义样式可注释
        additionalData: `
          // 若没有自定义样式文件，注释以下两行，避免报错
          // @use "@/styles/element/index.scss" as *;
          // @use "@/styles/var.scss" as *;
          // 手动导入Element Plus的基础样式（关键：解决弹窗样式缺失）
          @use "element-plus/theme-chalk/src/message-box.scss" as *;
          @use "element-plus/theme-chalk/src/message.scss" as *;
        `,
      }
    }
  }
})