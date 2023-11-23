<template>
  <div id="design-canvas" ref="designCanvas" v-contextmenu:contextmenu class="not-user-select">
    <div id="editor-shell-wrap">
      <div id="editor-area-box" ref="editorAreaBox">
        <div class="editor-area-mask"></div>
        <!-- 取巧使用遮罩覆盖溢出元素 box-shadow 上颜色等于中间镂空两个部分就能分割开 -->
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
        :disabled="item['isDisable']"
        v-for="(item,index) in contextmenuList"
        @click="item.handler"
        :key="`${index}menu`">
        <span>{{ item.text }}</span>
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
import {isFunction} from "is-what";
import {getWidgetOptionsFromElement, isWidget} from "@/utils/method";

const vContextmenu = directive // 使用指令

const designCanvas = ref()
const editorArea = ref()
const editorAreaBox = ref()

const contextmenuList = ref([
  {
    text: '合并组',
    icon: 'icon-sucai',
    show: () => {
      return editorStore.selectoManager.selected.length > 1
    },
    isShow: false,
    handler: () => editorStore.mergeGroup()
  },
  {
    text: '拆分组',
    icon: 'icon-lianjieduankai',
    show: () => editorStore.moveableManager.currentGroupElement,
    isShow: false,
    handler: () => editorStore.separationGroup()
  },
  {
    text: '组内移动',
    isShow: false,
    icon: 'icon-icon-gongzuoliuchengtongji-xianxing',
    show: () => editorStore.moveableManager.currentGroupElement,
    handler: () => editorStore.allowInGroupMovement = true
  },
  {
    text: '复制',
    icon: 'icon-fuzhi',
    isShow: true,
    handler() {
      const widgetEl = editorStore.moveableManager.currentWidget
      if (widgetEl && isWidget(widgetEl)) editorStore.currentClipboard = getWidgetOptionsFromElement(widgetEl, true)
    }
  },
  {
    text: '剪切',
    isShow: true,
    icon: 'icon-jianqie2',
    disable: () => editorStore.moveableManager.currentWidget,
    handler() {
      const widgetEl = editorStore.moveableManager.currentWidget
      if (widgetEl && isWidget(widgetEl)) {
        editorStore.currentClipboard = getWidgetOptionsFromElement(widgetEl, true)
        editorStore.removeWidget(widgetEl)
      }
    }
  },
  {
    text: '粘贴',
    isShow: true,
    isDisable: false,
    disable: () => editorStore.currentClipboard,
    icon: 'icon-paste',
    handler() {
      editorStore.currentClipboard && editorStore.addMaterialToGroup(editorStore.currentClipboard)
    }
  },
])

onMounted(() => {
  editorStore.designCanvasTarget = designCanvas.value
  editorStore.editorAreaBoxTarget = editorAreaBox.value
  editorStore.editorAreaTarget = editorArea.value
  const templateConfig = editorStore.getCurrentTemplateLayout()
  editorStore.displayLineGuides(true)
  editorStore.updateCanvasStyle(templateConfig)
  editorStore.updateCanvasScale()
})

function listenContextmenu(ev) {
  ev.buttons === 2 && contextmenuList.value.forEach((menuInfo: any) => {
    isFunction(menuInfo.show) && (menuInfo.isShow = menuInfo.show())
    isFunction(menuInfo.disable) && (menuInfo.isDisable = !menuInfo.disable())
  })
}

const preventContextmenu = (ev) => ev.preventDefault()

onMounted(async () => {
  designCanvas.value.addEventListener("mousedown", listenContextmenu)
  designCanvas.value.addEventListener("contextmenu", preventContextmenu)
})

onUnmounted(() => {
  designCanvas.value.removeEventListener("mousedown", listenContextmenu)
  designCanvas.value.removeEventListener("contextmenu", preventContextmenu)
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

.contextmenu-item {
  display: flex;
  align-items: center;
  width: 200px;
  height: 40px;
  text-align: start;
  font-weight: 400;
  font-size: 1rem;
  background-color: #FFFFFF;

  &::before {
    margin-left: 8px;
  }

  span {
    margin-left: 10px;
  }
}

.contextmenu-item:hover {
  color: black;
  background-color: var(--color-gray-200);
}

</style>
