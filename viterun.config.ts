import {resolve} from 'node:path'
import vue from '@vitejs/plugin-vue'
import {defineViteRunConfig, viteRunLogPlugin} from 'vite-run'
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer'
import Components from 'unplugin-vue-components/vite';
import {AntDesignVueResolver, ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from 'tailwindcss';

export default defineViteRunConfig(() => {
  return {
    packages: [
      'packages/*'
    ],
    targets: {
      'frontend': {
        dev: [
          ['10000', 'frontend_plugins', 'tailwindcss']
        ],
        build: [
          ['frontend_build', 'frontend_plugins', 'tailwindcss']
        ],
        buildGit: [
          ['frontend_build', 'frontend_plugins', 'tailwindcss', 'page']   // 编译部署到git的产物,在本地无法预览
        ],
        preview: ['p10000'],
        size: [
          ['frontend_build', 'frontend_plugins', 'tailwindcss', 'bundleAnalyzer']
        ]
      },
      'backend': {
        dev: [
          ['backend_build']
        ],
        build: [
          ['backend_build']
        ],
      }
    },
    plugins: {
      bundleAnalyzer: [
        bundleAnalyzer({})
      ],
      frontend_plugins: [
        vue(),
        viteRunLogPlugin({
          build: {
            viteLog: {
              transforming: true
            },
          },
          server: {
            viteLog: {
              transforming: false
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
      ]
    },
    server: {
      10000: {
        port: 10000,
        host: true
      }
    },
    build: {
      frontend_build: (options) => {
        return {
          rollupOptions: {
            input: `${options.packagePath}/index.html`
          }
        }
      },
      backend_build: (options) => {
        return {
          lib: {
            entry: `${options.packagePath}/bin/www`,
            name: 'design-backend',
            format: ['cjs'],
          },
          watch: true,
          rollupOptions: {
            external: ['@type/*']
          }
        }
      },
    },
    preview: {
      p10000: {
        port: 10000,
        host: true
      }
    },
    css: {
      tailwindcss: {
        postcss: {
          plugins: [tailwindcss],
        }
      }
    },
    base: {
      page: '/bilink-design/'
    },
    baseConfig(options) {
      return {
        resolve: {
          extensions: ['.vue', '.css', '.js', '.ts', 'mjs'],
          alias: {
            '@': resolve(__dirname, `${options.packagePath}/src`),
          }
        },
      }
    }
  }
})
