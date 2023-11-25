<template>
  <!--  --------------------header---------------------  -->
  <div class="header not-user-select min-w-[240px]" v-if="pageConfig">
    <div class="header-left">
      <HeaderLeft></HeaderLeft>
    </div>
    <div class="header-right">
      <HeaderRight></HeaderRight>
    </div>
  </div>
  <div class="work-area not-user-select">
    <!--  --------------------aside---------------------  -->
    <div class="aside">
      <div class="w-full flex-col justify-between">
        <div class="tool-tags h-full" v-if="pageConfig">
          <div v-for="(item,index) in pageConfig.asideTag" :key="index" @click="showTagPage(item.comp)">
            <div class="tag" :class="{activeTag:activeTagName && item.comp && activeTagName === item.comp }">
              <i class="iconfont icon" :class="item.icon"> </i>
              <div class="tag-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
        <a
          :href="githubUrl"
          target="_blank"
          class="absolute bottom-[10px] left-[20px] cursor-pointer text-blue-800 hover:text-blue-500">
          <div class="iconfont icon-github text-[1.2rem]"></div>
          <div class="font-bold text-[0.6rem]">github</div>
        </a>
      </div>
      <div class="widgets-panel relative" :style="{width: activeTagName ? '312px': '0'}">
        <div class="aside-close-btn flex-col justify-center" v-show="activeTagName" @click="showTagPage()">
          <img draggable="false" src="https://cdn.dancf.com/fe-assets/20221227/c1af0eecfff91f6a33bb285bebe2036b.svg"
               alt="">
        </div>
        <div class=" w-full h-full overflow-hidden">
          <div v-if="currentAsideTagComp.comp" style="width: 312px" class="w-full h-full ">
            <keep-alive :max="10">
              <div class="fill-box">
                <component :is="currentAsideTagComp.comp"
                           :config="currentActiveAsideTagConfig"
                           :key="currentAsideTagComp.name"></component>
              </div>
            </keep-alive>
          </div>
        </div>
      </div>
    </div>

    <!--  --------------------main---------------------  -->
    <div id="main" class="main" ref="mainRef">
      <DesignCanvas v-if="showDesignCanvas && editorStore.currentTemplate">
        <component
          v-show="editorStore.currentTemplate && widgetsMap[widgetConfig.type]"
          v-for="(widgetConfig,index) in editorStore.getCurrentTemplateLayout().elements"
          :is="widgetsMap[widgetConfig.type]"
          :config="widgetConfig"
          :key="`${index}${widgetConfig.uuid}`"
        >
        </component>
      </DesignCanvas>
      <div v-else-if="showTemplateId" class="flex justify-center items-center w-full h-full">
        <div class="text-[1.5rem] font-bold">
          <div v-if="showNotFoundTemplate" class="text-[1.6rem] font-bold">
            <span>哦吼, </span>
            <span>该资源跑到火星上去了哦</span>
            <hr class="hr-line"/>
            <p
              @click="showTagPage('template')"
              class="text-[1.2rem] cursor-pointer text-[#0984e3] hover:text-[#2154F4]"
              style="letter-spacing: 2px">
              触摸我去看看其他模板吧
            </p>
            <div
              @click="editorStore.initCanvas()"
              class="text-[1.1rem] text-gray-400 hover:text-gray-600 cursor-pointer mt-[10px]">
              创建空白画板
            </div>
          </div>
          <a-spin v-else :spinning="!showDesignCanvas" size="large"></a-spin>
        </div>
      </div>
      <div v-else class="flex justify-center items-center w-full h-full">
        <div class="text-[1.6rem] font-bold">
          <div @click="showTagPage('template')" class=" text-[#0984e3] hover:text-[#2154F4] cursor-pointer">
            <span class="iconfont icon-zuojiantou text-[1.2rem]"></span>
            开始设计
          </div>
          <hr class="hr-line">
          <div
            @click="editorStore.initCanvas()"
            class="text-[1.1rem] text-gray-400 hover:text-gray-600 cursor-pointer">
            创建空白画板
          </div>
        </div>
      </div>
      <div id="main-bottom">
        <ScaleControl
          v-if=" editorStore.currentTemplate && showDesignCanvas"
          class="scale-control z-[500]"
          selector="#main"
        />
      </div>
    </div>

    <div class="widgets-detail">
      <div v-if="curDetailComp && editorStore.currentTemplate && showDesignCanvas">
        <div v-if="showGroupControl">
          <div
            class="btn-group w-[232px] mt-[40px] mb-[20px] m-auto font-black text-[0.9rem] cursor-pointer not-user-select">
            <WGroupControl/>
          </div>
          <hr class="hr-line"/>
        </div>

        <component :is="curDetailComp"></component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Component} from 'vue'
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from "vue";
import mitt from "mitt";
import {defaultMoveableOptions, MoveableManager} from '@/common/moveable/moveable'
import DesignCanvas from "@/components/design-canvas/DesignCanvas.vue";
import {editorStore} from "@/store/editor";
import ScaleControl from "@/components/scale-control/ScaleControl.vue";
import {asideTagMap, githubUrl, widgetsDetailMap, widgetsMap} from "@/config/widgets-map";
import {apiGetFonts} from "@/api/getFonts";
import {apiGetPageConfig} from "@/api/getPageConfig";
import {getWidgetsName} from "@/utils/method";
import {defaultSelectOptions, SelectoManager} from "@/common/selecto/selecto";
import {WIDGETS_NAMES} from "@/constant";
import {apiGetDetail} from "@/api/getDetail";
import {DragWidgetManager} from "@/common/drag-widget/drag-widget";
import HeaderRight from "@/components/header/header-right/HeaderRight.vue";
import HeaderLeft from "@/components/header/header-left/HeaderLeft.vue";

const pageConfig = ref()
const mainRef = ref<HTMLElement>()
const activeTagName = shallowRef<string>()
const curDetailComp = shallowRef()  // 当前编辑区域点击小组件时对应的小组件配置页
const currentAsideTagComp = shallowRef<{ name: string | void, comp: Component | void }>({name: void 0, comp: void 0})   // 当前左侧标签展开页使用的组件
const currentActiveAsideTagConfig = shallowRef()   // 当前左侧标签展开页使用的配置
const showGroupControl = ref(false)
const showDesignCanvas = ref(false)
const showNotFoundTemplate = ref(false)
const showTemplateId = ref()
const currentUsingWidgetConfigList = ref([])
editorStore.bus = mitt()

setTimeout(() => {
  // showTagPage('material')
  // showTagPage('text')
  // showTagPage('images')
  // showTagPage('template')
  // showTagPage('my-design')
  // showTagPage('add-panel')
}, 200)

/** 显示标签页对应的资源页,若有传入名称则打开对应页面，如果传入空字符串或者没传入将关闭展开的左侧页面  */
function showTagPage(name: '' | void | 'template' | 'text' | 'images' | 'material' | 'my-design' | 'add-panel' = "") {
  activeTagName.value = activeTagName.value !== name ? name : void 0
  currentAsideTagComp.value.comp = name ? asideTagMap[activeTagName.value] : void 0
  currentAsideTagComp.value.name = activeTagName.value
  pageConfig.value
  && pageConfig.value.asideTag
  && (currentActiveAsideTagConfig.value = pageConfig.value.asideTag.find(item => item.comp === name))
  setTimeout(() => editorStore.lineGuides && editorStore.lineGuides.updateGuidesStyle(), 217)
}

function getCurDetailComp(widgetsName: string | void = 'default') {
  return widgetsDetailMap[widgetsName] || widgetsDetailMap['default']
}

function listenMouseDownEvent(ev: MouseEvent) {
  if (ev.buttons === 2 && editorStore.selectoManager.selected.length) return   // 点右键且选择多个时不进行跳组件详情
  if (!editorStore.moveableManager) return
  const widgetEl = editorStore.moveableManager.getMinAreaWidgetForMousePoint(ev.pageX, ev.pageY)
  let widgetName
  curDetailComp.value = null
  if (widgetEl) {
    widgetName = getWidgetsName(<any>widgetEl)
    showGroupControl.value = !!editorStore.moveableManager.currentGroupElement
  } else {
    showGroupControl.value = false
  }
  const detailComp = getCurDetailComp(widgetName)
  nextTick(() => {
    curDetailComp.value = detailComp
  })
}


/**
 * 载入工程配置成功后调用
 * */
function loadEditorTemplate(templateData: { id?: string, data: Record<any, any> }) {
  editorStore.loadEditorProject(templateData.data)
  curDetailComp.value = getCurDetailComp()
  showDesignCanvas.value = false
  const currenLayout = editorStore.getCurrentTemplateLayout()
  if (!currenLayout) return
  currentUsingWidgetConfigList.value = currenLayout.elements
  if (templateData.id) {
    showTemplateId.value = templateData.id
    const urlInfo = new URL(window.location.href);
    urlInfo.searchParams.set('id', templateData.id);
    history.replaceState(history.state, '', urlInfo.href)
  }

  setTimeout(() => {
    showDesignCanvas.value = true
    if (!editorStore.moveableManager) {
      editorStore.moveableManager = <any>new MoveableManager()
      editorStore.moveableManager.mount(mainRef.value, defaultMoveableOptions)
    }
    if (!editorStore.selectoManager) {
      editorStore.selectoManager = <any>new SelectoManager()
      editorStore.selectoManager.mount(mainRef.value, defaultSelectOptions)
      editorStore.selectoManager.selecto.on("selectEnd", () => {
        const selectoManager = editorStore.selectoManager
        if (selectoManager && selectoManager.selected.length > 1) {
          curDetailComp.value = getCurDetailComp(WIDGETS_NAMES.W_SELECTED_GROUP)  // 如果进行组件多选，则右侧弹出组件组配置页
          showGroupControl.value = true
        }
      })
    }
    if (!editorStore.dragWidgetManager) {
      editorStore.dragWidgetManager = new DragWidgetManager()
      editorStore.dragWidgetManager.start()
      editorStore.dragWidgetManager.bus.on("drop", (material) => {
        editorStore.addMaterial(<any>material)
        editorStore.moveableManager.moveable.target = []
        editorStore.selectoManager.selected = []
      })
      // showTagPage('text')
    }
  }, 100)
}

onMounted(async () => {
  if (mainRef.value) {
    editorStore.mainTarget = mainRef.value
    mainRef.value!.addEventListener('mousedown', listenMouseDownEvent)
  }
  createListenEventBus()
  apiGetFonts().then(res => res.code === 200 && (editorStore.allFont = res.data))
  apiGetPageConfig().then(res => {
    if (res.code !== 200) return
    pageConfig.value = editorStore.pageConfig = res.data
  })
  const searchParams = new URLSearchParams(location.search)
  const curUrlSpecifyId = searchParams.get('id')
  if (curUrlSpecifyId) {
    showTemplateId.value = curUrlSpecifyId
    apiGetDetail({id: curUrlSpecifyId}).then(res => {
      if (res.code !== 200) return showNotFoundTemplate.value = true
      editorStore.bus.emit('loadTemplate', {
        id: curUrlSpecifyId,
        data: res.data
      })
    }).catch(() => showNotFoundTemplate.value = true)
  } else setTimeout(() => showTagPage('template'), 1000)
})

function createListenEventBus() {
  editorStore.bus.on('loadTemplate', (template) => {
    loadEditorTemplate(template)
    // console.log(template)
  })
}

onUnmounted(() => {
  editorStore.moveableManager && editorStore.moveableManager.destroy()
  editorStore.lineGuides && editorStore.lineGuides.destroy()
  if (mainRef.value) {
    mainRef.value!.removeEventListener('mousedown', listenMouseDownEvent)
  }
  editorStore.bus.all.clear()
  editorStore.bus = null
})

</script>

<style scoped lang="scss">
$header-height: 60px;
$tool-tags-width: 72px;

.header {
  display: flex;
  width: 100%;
  height: $header-height;
  justify-content: space-between;
  padding: 0 1%;
  align-items: center;
  font-weight: bolder;
  font-size: 1.2rem;
  border-bottom: rgba(227, 226, 226, 0.71) solid 1px;
}

.activeTag {
  background-color: #E8EAEC;
  color: black;
  border-radius: 10px;

  .tag-name {
    font-weight: 900 !important;
  }
}

.work-area {
  width: 100%;
  height: calc(100% - $header-height);
  display: flex;

  .aside {
    position: relative;
    z-index: 302;
    display: flex;
    justify-content: space-between;
    user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    border-right: #d9d8d8 solid 1px;

    .tool-tags {
      display: flex;
      flex-direction: column;
      min-width: 56px;
      min-height: 66px;
      width: $tool-tags-width;
      border-right: var(--color-gray-300) solid 1px;

      .tag {
        margin: 4.8px 8px;
        padding: 7px 2px;

        &:hover {
          background-color: var(--color-gray-100);
          border-radius: 10px;
        }

        .icon {
          font-size: 1.2rem;
        }

        div {
          font-size: 0.95rem;
          transform: scale(0.8);
          color: #676c73;
          font-weight: 400;
        }

        width: auto;
        text-align: center;
        cursor: pointer;
      }

      .github {

      }

    }

    .widgets-panel {
      transition: all 200ms;
      width: calc(312px);
      height: auto;

      .aside-close-btn {
        width: 12px;
        height: 80px;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(calc(100% - 3px), -50%);
        z-index: 301;
        cursor: pointer;
      }
    }
  }

  .main {
    position: relative;
    flex: 1;
    overflow: hidden;
    background-color: #F6F7F9;
    width: 100%;
    height: 100%;
  }

  .widgets-detail {
    min-width: 260px;
    flex-basis: 260px;
    border-left: #d9d8d8 solid 1px;
  }
}

#main-bottom {
  width: 100%;
  height: auto;
  position: absolute;
  bottom: 20px;
  left: 0;
  display: flex;
}

.scale-control {
  margin-left: auto;
  margin-right: 15px;
}
</style>
