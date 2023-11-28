<template>
  <div id="design-canvas" ref="designCanvas" v-hotkey="hotkeyMap" v-contextmenu:contextmenu class="not-user-select">
    <div id="editor-shell-wrap">
      <div id="editor-area-box" ref="editorAreaBox">
        <!-- 取巧使用遮罩覆盖溢出元素 box-shadow 上颜色等于中间镂空两个部分就能分割开 -->
        <div class="editor-area-mask"></div>
        <!-- 背景图单独分一层而不是直接操控到画布上 -->
        <div id="editor-area-bg" ref="editorAreaBG"></div>
        <div id="editor-area" ref="editorArea">
          <slot></slot>
          <a-watermark :content="'bi.link'" style="height: 100%; width: 100%;z-index: -1">
          </a-watermark>
        </div>
      </div>
    </div>
  </div>
  <Contextmenu ref="contextmenu">
    <div class="rounded-lg overflow-hidden not-user-select">
      <ContextmenuItem
        class="contextmenu-item iconfont"
        :class="item.icon"
        v-show="item.isShow"
        :disabled="item.isDisable"
        v-for="(item,index) in contextmenuList"
        @click="item.handler"
        :key="`${index}menu`">
        <span class="menu-text">{{ item.text }}</span>
        <span v-if="Array.isArray(item.hotKey) && item.hotKey.length">
          <a-tag style="transform: scale(0.9);margin-right: auto; color: #7f8792">
            {{ item.hotKey[0] }}
          </a-tag>
        </span>
      </ContextmenuItem>
    </div>
  </Contextmenu>
</template>

<script setup lang="ts">
//@ts-ignore
import {Contextmenu, ContextmenuItem, directive} from "v-contextmenu";
import {onMounted, onUnmounted, ref} from 'vue'
import {editorStore} from "@/store/editor";
import "v-contextmenu/dist/themes/default.css";
import {isFunction, isString} from "is-what";
import {getWidgetOptionsFromElement, isWidget} from "@/utils/method";
import {HotkeyDirective} from 'v-hotkey3'
import type {LayoutWidget} from "@type/layout";

const vContextmenu = directive // 使用指令
const vHotkey = HotkeyDirective({})

const designCanvas = ref()
const editorArea = ref()
const editorAreaBG = ref()
const editorAreaBox = ref()
const hotkeyMap = ref({})

const contextmenuData: {
  text: string;
  icon: string;
  isShow?: boolean;
  isDisable?: boolean;
  hotKey?: string[];
  handler?: Function;
  show?: Function;
  disable?: Function;
}[] = [
  {
    text: '全选',
    icon: 'icon-RestoreWindow',
    isShow: true,
    hotKey: ['ctrl+a', 'command+a'],
    handler: () => {
      const allWidget: HTMLElement[] = Array.from(editorStore.editorAreaTarget.children).filter(isWidget) as any
      editorStore.selectoManager.doSelect(allWidget)
    }
  },
  {
    text: '合并组',
    icon: 'icon-sucai',
    isShow: false,
    show: () => editorStore.selectoManager.selected.length > 1,
    handler: () => editorStore.mergeGroup()
  },
  {
    text: '拆分组',
    icon: 'icon-lianjieduankai',
    isShow: false,
    hotKey: ['ctrl+g', 'command+g'],
    show: () => editorStore.moveableManager.currentGroupElement && !editorStore.isSeparating,
    handler: () => editorStore.separationGroup()
  },
  {
    text: '组内移动',
    icon: 'icon-icon-gongzuoliuchengtongji-xianxing',
    isShow: false,
    show: () => editorStore.moveableManager.currentGroupElement && !editorStore.isSeparating,
    handler: () => editorStore.allowInGroupMovement = true
  },
  {
    text: '复制',
    icon: 'icon-fuzhi',
    isShow: true,
    hotKey: ['ctrl+c', 'command+c'],
    disable: () => editorStore.moveableManager.currentWidgets.length,
    handler() {
      const currentWidgets = editorStore.moveableManager.currentWidgets
      editorStore.currentClipboard = currentWidgets.map((widget: HTMLElement) => getWidgetOptionsFromElement(widget, true))
    }
  },
  {
    text: '剪切',
    icon: 'icon-jianqie2',
    isShow: true,
    hotKey: ['ctrl+x', 'command+x'],
    disable: () => editorStore.moveableManager.currentWidgets.length,
    handler() {
      const currentWidgets = editorStore.moveableManager.currentWidgets
      editorStore.currentClipboard = currentWidgets.map((widget: HTMLElement) => {
        editorStore.removeWidget(widget)
        return getWidgetOptionsFromElement(widget, true)
      })

    }
  },
  {
    text: '粘贴',
    icon: 'icon-paste',
    isShow: true,
    isDisable: false,
    hotKey: ['ctrl+v', 'command+v'],
    disable: () => editorStore.currentClipboard.length,
    handler() {
      editorStore.currentClipboard.forEach((widgetOptions: LayoutWidget) => {
        editorStore.addMaterialToGroup(widgetOptions, null, {autoPosition: true})
      })
    }
  },
  {
    text: '删除',
    icon: 'icon-shanchu-',
    isShow: true,
    hotKey: ['delete'],
    disable: () => editorStore.moveableManager.currentWidgets.length,
    handler() {
      const currentWidgets = editorStore.moveableManager.currentWidgets
      currentWidgets.forEach((widget: HTMLElement) => editorStore.removeWidget(widget))
    }
  },
]
const contextmenuList = ref(contextmenuData)

function createHotkeyMap() {
  const keyMap = {}
  contextmenuData.forEach((item: object) => {
    if (Array.isArray(item.hotKey)) {
      item.hotKey.forEach(key => isFunction(item.handler) && (keyMap[key] = item.handler))
    } else if (isString(item.hotKey)) keyMap[item.hotKey] = item.handler
  })
  return keyMap
}

onMounted(() => {
  editorStore.designCanvasTarget = designCanvas.value
  editorStore.editorAreaBoxTarget = editorAreaBox.value
  editorStore.editorAreaTarget = editorArea.value
  editorStore.editorAreaBgTarget = editorAreaBG.value
  const templateConfig = editorStore.getCurrentTemplateLayout()
  editorStore.displayLineGuides(true)
  editorStore.updateCanvasStyle(templateConfig)
  editorStore.updateCanvasScale()
  hotkeyMap.value = createHotkeyMap()
})

async function listenContextmenu(ev) {
  ev.buttons === 2 && contextmenuList.value.forEach((menuInfo: any) => {
    isFunction(menuInfo.show) && (menuInfo.isShow = menuInfo.show())
    isFunction(menuInfo.disable) && (menuInfo.isDisable = !menuInfo.disable())
  })
}

const preventContextmenu = (ev) => ev.preventDefault()
let designCanvasEl
onMounted(async () => {
  designCanvas.value.addEventListener("mousedown", listenContextmenu)
  designCanvas.value.addEventListener("contextmenu", preventContextmenu)
  designCanvasEl = designCanvas.value
})

onUnmounted(() => {
  designCanvasEl.removeEventListener("mousedown", listenContextmenu)
  designCanvasEl.removeEventListener("contextmenu", preventContextmenu)
})

</script>

<style scoped lang="scss">
#design-canvas {
  position: relative;
  width: 100%;
  height: 99.5%;
  overflow: auto;
}

#editor-shell-wrap {
  margin: auto;
  padding: var(--canvas-padding);
  width: calc(var(--canvas-width) * var(--canvas-scale) + var(--canvas-padding) * 2);
  height: calc(var(--canvas-height) * var(--canvas-scale) + var(--canvas-padding) * 2);
}

#editor-area-box {
  position: relative;
  background-color: #FFFFFF;
  width: calc(var(--canvas-width) * var(--canvas-scale));
  height: calc(var(--canvas-height) * var(--canvas-scale));
  //overflow: hidden;
}

.editor-area-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 0 10000px #F6F7F9;
  -webkit-box-shadow: 0 0 0 10000px #F6F7F9;
  -moz-box-shadow: 0 0 0 10000px #F6F7F9;
  z-index: 20;
  background-color: transparent;
  pointer-events: none;
}

#editor-area {
  position: relative;
  background-color: transparent;
  width: var(--canvas-width);
  height: var(--canvas-height);
  transform-origin: left top;
  transform: scale(var(--canvas-scale));
  background-repeat: no-repeat;
  background-size: cover;
}

#editor-area-bg {
  position: absolute;
  left: 0;
  top: 0;
  background-color: transparent;
  width: var(--canvas-width);
  height: var(--canvas-height);
  transform-origin: left top;
  transform: scale(var(--canvas-scale));
  background-repeat: no-repeat;
  background-size: cover;
}

.contextmenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 200px;
  height: 40px;
  text-align: start;
  font-weight: 400;
  font-size: 1rem;
  background-color: #FFFFFF;

  &::before {
    margin-left: 5px;
  }

  .menu-text {
    margin-right: auto;
    margin-left: 15px;
  }
}

.contextmenu-item:hover {
  color: black;
  background-color: var(--color-gray-200);
}

</style>
