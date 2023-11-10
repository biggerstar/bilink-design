import {resolve} from 'node:path'
import vue from '@vitejs/plugin-vue'
import {defineViteRunConfig, viteRunLogPlugin} from 'vite-run'
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer'
import vueJsx from '@vitejs/plugin-vue-jsx';
import Components from 'unplugin-vue-components/vite';
import {AntDesignVueResolver, ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineViteRunConfig(() => {
  return {
    packages: [
      './'
    ],
    targets: {
      'bilink-design': {
        dev: ['10000'],
        build: [
          ['build']
        ],
        buildGit: [
          ['build', 'page']   // 编译部署到git的产物
        ],
        preview: ['p10000'],   // 部署到git page 在本地无法预览
        size: [
          ['build', 'bundleAnalyzer']
        ]
      }
    },
    plugins: {
      bundleAnalyzer: [
        bundleAnalyzer({})
      ]
    },
    server: {
      10000: {
        port: 10000,
        host: true
      }
    },
    build: {
      build: {}
    },
    preview: {
      p10000: {
        port: 10000,
        host: true
      }
    },
    base: {
      page: '/bilink-design/'
    },
    baseConfig() {
      return {
        plugins: [
          vue(),
          vueJsx(),
          viteRunLogPlugin({
            build: {
              viteLog: {
                transforming: true
              },
            },
            server: {
              viteLog: {
                transforming: true
              },
            }
          }),
          Components({
            resolvers: [
              AntDesignVueResolver({
                importStyle: false, // css in js
              }),
              ElementPlusResolver()
            ],
          }),
          AutoImport({
            resolvers: [ElementPlusResolver()],
          }),
        ],
        resolve: {
          extensions: ['.vue', '.css', '.js', '.ts'],
          alias: {
            '@': resolve(__dirname, 'src'),
          }
        }
      }
    }
  }
})
