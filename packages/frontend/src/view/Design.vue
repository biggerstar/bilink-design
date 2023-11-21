<template>
  <!--  --------------------header---------------------  -->
  <div class="header min-w-[240px]">
    <div class="header-left" v-if="pageConfig">{{ pageConfig.brand }}</div>
    <div class="header-right">
      <el-button-group>
        <el-button color="#2154F4" class="w-8/12" size="large" type="primary" @click="saveProject">保存</el-button>
        <a-popover trigger="click" placement="bottomRight">
          <template #content>
            <div class="w-full h-[45px] font-bold text-[1.04rem] p-1">更多操作</div>
            <div style="width: 360px; height: 400px" class="not-user-select">
              <div class="w-full h-auto flex flex-wrap justify-evenly">
                <div
                  class="w-14 h-14 rounded-lg cursor-pointer"
                  v-for="(item,index) in moreOperationList"
                  :key="index + item.text">
                  <ContentBox>
                    <div class="iconfont" :class="item.icon"></div>
                  </ContentBox>
                  <div class="text-center mt-1">{{ item.text }}</div>
                </div>
              </div>
            </div>
          </template>
          <el-button color="#2154F4" class="iconfont icon-androidgengduo w-1/6" size="large" type="primary"></el-button>
        </a-popover>
      </el-button-group>
    </div>
  </div>
  <div class="work-area">
    <!--  --------------------aside---------------------  -->
    <div class="aside">
      <div class="tool-tags h-full" v-if="pageConfig">
        <div v-for="(item,index) in pageConfig.asideTag" :key="index" @click="showTagPage(item.comp)">
          <div class="tag" :class="{activeTag:activeTagName && item.comp && activeTagName === item.comp }">
            <i class="iconfont icon" :class="item.icon"> </i>
            <div class="tag-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="widgets-panel relative" :style="{width: activeTagName ? '312px': '0'}">
        <div class="aside-close-btn flex-col justify-center" v-show="activeTagName" @click="showTagPage()">
          <img draggable="false" src="https://cdn.dancf.com/fe-assets/20221227/c1af0eecfff91f6a33bb285bebe2036b.svg"
               alt="">
        </div>
        <div class=" w-full h-full overflow-hidden">
          <div style="width: 312px" class="w-full h-full ">
            <keep-alive>
              <component :is="currentAsideTagComp" :config="currentActiveAsideTagConfig"></component>
            </keep-alive>
          </div>
        </div>
      </div>
    </div>

    <!--  --------------------main---------------------  -->
    <div id="main" class="main" ref="mainRef">
      <DesignCanvas v-if="currentTemplateLayoutInfo">
        <component
          v-show="currentTemplateLayoutInfo && widgetsMap[widgetConfig.type]"
          v-for="(widgetConfig,index) in editorStore.getCurrentTemplateLayout().elements"
          :is="widgetsMap[widgetConfig.type]"
          :config="widgetConfig"
          :key="`${index}${widgetConfig.uuid}`"
        >
        </component>
      </DesignCanvas>
      <div id="main-bottom">
        <ScaleControl
          v-if="currentTemplateLayoutInfo"
          class="scale-control z-[500]"
          selector="#main"
        />
      </div>
    </div>

    <div class="widgets-detail">
      <div v-if="curDetailComp && editorStore.currentTemplate">
        <component :is="curDetailComp"></component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, shallowRef} from "vue";
import {defaultMoveableOptions, MoveableManager} from '@/common/moveable/moveable'
import DesignCanvas from "@/components/design-canvas/DesignCanvas.vue";
import {editorStore} from "@/store/editor";
import ScaleControl from "@/components/scale-control/ScaleControl.vue";
import {asideTagMap, widgetsDetailMap, widgetsMap} from "@/config/widgets-map";
import {notification} from 'ant-design-vue';
import {apiGetProjectInfo} from "@/api/getProjectInfo";
import {apiGetFonts} from "@/api/getFonts";
import {apiGetPageConfig} from "@/api/getPageConfig";
import ContentBox from '@/components/content-box/ContentBox.vue'
import {getWidgetsName, parseWidget4DomChain, parseWidgetsInfo4DomChain} from "@/utils/method";
import {CurrentTemplate} from "@type/layout";
import {defaultSelectOptions, SelectoManager} from "@/common/selecto/selecto";
import {WIDGETS_NAMES} from "@/constant";
import {getElement4EventTarget} from "@/utils/tool";

const pageConfig = ref()
const mainRef = ref<HTMLElement>()
const activeTagName = shallowRef<string>()
const curDetailComp = shallowRef()  // 当前编辑区域点击小组件时对应的小组件配置页
const currentTemplateLayoutInfo = ref<CurrentTemplate>()   // 当前使用的工程文件
const currentAsideTagComp = shallowRef()   // 当前左侧标签展开页使用的组件
const currentActiveAsideTagConfig = shallowRef()   // 当前左侧标签展开页使用的配置
const moreOperationList = ref()

setTimeout(() => {
  // showTagPage('material')
  // showTagPage('text')
  // showTagPage('images')
  // showTagPage('template')
}, 200)

/** 显示标签页对应的资源页,若有传入名称则打开对应页面，如果传入空字符串或者没传入将关闭展开的左侧页面  */
function showTagPage(name = '') {
  activeTagName.value = activeTagName.value !== name ? name : void 0
  currentAsideTagComp.value = name ? asideTagMap[activeTagName.value] : void 0
  pageConfig.value
  && pageConfig.value.asideTag
  && (currentActiveAsideTagConfig.value = pageConfig.value.asideTag.find(item => item.comp === name))
  setTimeout(() => editorStore.lineGuides && editorStore.lineGuides.updateGuidesStyle(), 217)
}

function getCurDetailComp(widgetsName: string | void = 'default') {
  return widgetsDetailMap[widgetsName] || widgetsDetailMap['default']
}

function listenMouseDownEvent(ev) {
  const widgetsInfo = parseWidgetsInfo4DomChain(<any>parseWidget4DomChain(getElement4EventTarget(ev)))
  let widgetName
  if (widgetsInfo) {
    widgetName = widgetsInfo.isGroup ? WIDGETS_NAMES.W_GROUP : getWidgetsName(<any>widgetsInfo.rootWidgetElement)
    console.log(widgetName)
  }
  const detailComp = getCurDetailComp(widgetName)
  curDetailComp.value = null
  nextTick(() => curDetailComp.value = detailComp)
}

function listenMouseupEvent() {
  const selectoManager = editorStore.selectoManager
  if (selectoManager && selectoManager.selected.length) {
    if (selectoManager.selected.length > 1) curDetailComp.value = getCurDetailComp(WIDGETS_NAMES.W_GROUP)  // 如果进行组件多选，则右侧弹出组件组配置页
  }
}

/**
 * 载入工程配置成功后调用
 * */
function loadEditorProjectSuccess() {
  currentTemplateLayoutInfo.value = editorStore.currentTemplate
  curDetailComp.value = getCurDetailComp()
  moreOperationList.value = editorStore.pageConfig.header.moreOperation
  setTimeout(() => {
    editorStore.moveableManager = <any>new MoveableManager()
    editorStore.moveableManager.mount(mainRef.value, defaultMoveableOptions)
    editorStore.selectoManager = <any>new SelectoManager()
    editorStore.selectoManager.mount(mainRef.value, defaultSelectOptions)
  }, 100)
}

onMounted(async () => {
  if (mainRef.value) {
    mainRef.value!.addEventListener('mousedown', listenMouseDownEvent)
    mainRef.value!.addEventListener('mouseup', listenMouseupEvent)
  }
  apiGetPageConfig().then(res => res.code === 200 && (pageConfig.value = editorStore.pageConfig = res.data))
  const getProjectInfo = apiGetProjectInfo().then(res => res.code === 200 && editorStore.loadEditorProject(res.data) || loadEditorProjectSuccess())
  const getAllFonts = apiGetFonts().then(res => res.code === 200 && (editorStore.allFont = res.data))
  // Promise.all([getProjectInfo, getAllFonts]).then(() => {
  //   const fontId = editorStore.currentTemplate?.canvas?.fontId
  //   if (!fontId || !mainRef.value) return
  //   editorStore.setFontFamily(<any>mainRef.value, fontId)
  // })
})

/*-----------------------------------header start-------------------------------------*/
const openNotification = () => {
  notification.open({
    message: '保存成功',
    description: '🎉🎉 您的项目已经保存成功啦!',
    duration: 1.5,
  });
};

function saveProject() {  /* 保存当前工程 */
  sessionStorage.setItem('layout', JSON.stringify(editorStore.currentTemplate))
  openNotification()
}

onUnmounted(() => {
  editorStore.moveableManager && editorStore.moveableManager.destroy()
  editorStore.lineGuides && editorStore.lineGuides.destroy()
  if (mainRef.value) {
    mainRef.value!.removeEventListener('mousedown', listenMouseDownEvent)
    mainRef.value!.removeEventListener('mouseup', listenMouseupEvent)
  }
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
