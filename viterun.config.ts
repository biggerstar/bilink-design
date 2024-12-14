import path, {resolve} from 'node:path'
import vue from '@vitejs/plugin-vue'
import {defineViteRunConfig, viteRunLogPlugin} from 'vite-run'
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer'
import Components from 'unplugin-vue-components/vite';
import {AntDesignVueResolver, ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from 'tailwindcss';
import process from "node:process";
import {config as dotenvConfig} from "dotenv";
import {viteCertsPlugin} from "@biggerstar/localhost-certs";
import {VitePluginNode} from "vite-plugin-node";
import importToCDN, {autoComplete} from 'vite-plugin-cdn-import'
import * as fs from "fs";

dotenvConfig({path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)})

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
        release: [
          ['frontend_build', 'frontend_plugins', 'tailwindcss']
        ],
        preview: [
          ['p10001']
        ],
        size: [
          ['frontend_build', 'frontend_plugins', 'tailwindcss', 'bundleAnalyzer']
        ]
      },
      'backend': {
        build: [
          ['backend_build', 'vitePluginNode']
        ],
      }
    },
    plugins: {
      bundleAnalyzer: [
        bundleAnalyzer({})
      ],
      frontend_plugins: [
        vue(),
        viteCertsPlugin(),
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
      ],
      vitePluginNode: [
        VitePluginNode({
          adapter: 'express',
          appPath: 'bin/www.ts',
        })
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
            input: `${options.packagePath}/index.html`,
            output: {
              sourcemap:false,
              manualChunks(id) {
                if (id.includes("node_modules")) {
                  return id.toString().split("node_modules/.pnpm/")[1].split("/")[0].toString();
                }
              }
            }
          }
        }
      },
      backend_build: (options) => {
        return {
          minify: false,
          rollupOptions: {
            input: `${options.packagePath}/bin/www.ts`,
            output: {
              entryFileNames: 'server.js',
              format: 'cjs',
            },
            external: [
              '@type/*',
              '@biggerstar/localhost-certs',
              'fs',
              'path',
              'process',
              'https',
              'http',
              'url',
              'dotenv',
              'express',
              'cors',
              'sequelize',
              'cookie-parser',
              'http-errors',
            ]
          }
        }
      },
      sourcemap: {
        sourcemap: true,
      }
    },
    preview: {
      p10001: {
        port: 10001,
        host: true,
        strictPort: true
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
      page: process.env.GIT_RELEASE_PAGE_SUB_PATH
    },
    baseConfig: (options) => {
      return {
        define: {
          __API_BASE_URL__: JSON.stringify(process.env.API_BASE_URL)
        },
        plugins: [
          importToCDN({
            modules: [
              // {
              //   name: 'axios',
              //   var: 'axios',
              //   path: `https://cdn.bootcdn.net/ajax/libs/axios/1.5.0/axios.min.js`,
              // },
              // {
              //   name: 'vue',
              //   var: 'Vue',
              //   path: `https://cdn.bootcdn.net/ajax/libs/vue/3.3.4/vue.global.prod.min.js`,
              // },
              // {
              //   name: 'vue-router',
              //   var: 'VueRouter',
              //   path: `https://cdn.bootcdn.net/ajax/libs/vue-router/4.2.4/vue-router.global.prod.min.js`,
              // },
            ],
          }),
        ],
        resolve: {
          extensions: ['.vue', '.css', '.js', '.ts', '.mjs'],
          alias: {
            '@': resolve(__dirname, `${options.packagePath}/src`),
          }
        },
      }
    }
  }
})
