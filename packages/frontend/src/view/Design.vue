<template>
  <div class="header">
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
                  <ContentBox @click="item.handler">
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
    <div class="aside">
      <div class="tool-tags" v-if="pageConfig">
        <div v-for="(item,index) in pageConfig.asideTag" :key="index" @click="gotoTag(index)">
          <div class="tag" :class="{activeTag: activeTagIndex === index }">
            <i class="iconfont icon" :class="item.icon"> </i>
            <div>{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="widgets-panel" v-show="activeTagIndex >= 0"></div>
    </div>
    <div id="main" class="main" ref="mainRef">
      <DesignCanvas
        v-if="currentProjectInfo && currentProjectInfo.canvas"
        :config="currentProjectInfo.canvas"
      >
        <component
          class="widget-box-selection"
          v-if="currentProjectInfo" :is="widgetsMap[item.type]"
          v-for="item in currentProjectInfo.items"
          :config="item">
        </component>
      </DesignCanvas>
      <div id="main-bottom">
        <ScaleControl
          v-if="currentProjectInfo && currentProjectInfo.canvas"
          class="scale-control"
          selector="#main"
        />
      </div>
    </div>

    <div class="widgets-detail">
      <div v-if="curDetailComp">
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
import {widgetsDetailMap, widgetsMap} from "@/config/widgets-map";
import {apiGetProjectInfo} from "@/api/getProjectInfo";
import {apiGetAllFonts} from "@/api/getFontData";
import {apiGetWidgetsDetailConfig} from "@/api/getWidgetsDetailConfig";
import {apiGetPageConfig} from "@/api/getPageConfig";
import ContentBox from '@/components/content-box/ContentBox.vue'
import {notification} from 'ant-design-vue';
import {getWidgetsName} from "@/utils/method";

const pageConfig = ref()
const mainRef = ref<HTMLElement>()
const activeTagIndex = ref<number>(-1)
const curDetailComp = shallowRef()
const currentProjectInfo = ref()
let moveableManager: MoveableManager

const moreOperationList = [
  {
    text: '下载',
    icon: 'icon-xiazaidaoru',
    handler: () => {
      // do something
      // console.log('click')
    },
  },
  {
    text: '分享',
    icon: 'icon-fenxiang',
    handler: () => {
      // do something
    },
  },
  {
    text: '敬请期待',
    icon: 'icon-jingqingqidai',
    handler: () => {
      // do something
    },
  },
]

// console.log(editorStore)
function gotoTag(index) {
  // console.log(item)
  activeTagIndex.value = activeTagIndex.value === index ? -1 : index
}

function getCurDetailComp(widgetsName: string | void = 'default') {
  return widgetsDetailMap[widgetsName] || widgetsDetailMap['default']
}

function listenClickWidgetsTarget() {
  let widgetName
  const widgetEl = editorStore.moveableManager.currentWidget
  if (widgetEl) widgetName = getWidgetsName(widgetEl)
  const detailComp = getCurDetailComp(widgetName)
  curDetailComp.value = null
  nextTick(() => curDetailComp.value = detailComp)
}

/**
 * 载入工程配置成功后调用
 * */
function loadEditorProjectSuccess() {
  currentProjectInfo.value = editorStore.currentProject
  curDetailComp.value = getCurDetailComp()
  if (editorStore.currentProject.canvas.guideline) setTimeout(() => editorStore.displayLineGuides(true), 100)
  setTimeout(() => {
    editorStore.moveableManager = <any>new MoveableManager()
    editorStore.moveableManager.mount(mainRef.value, defaultMoveableOptions)
  }, 100)
}


onMounted(async () => {
  if (mainRef.value) {

    mainRef.value!.addEventListener('mousedown', listenClickWidgetsTarget)
  }

  apiGetPageConfig().then(res => res.code === 200 && (pageConfig.value = res.data))
  apiGetWidgetsDetailConfig().then(res => res.code === 200 && (editorStore.widgetsDetailConfig = res.data))
  const getProjectInfo = apiGetProjectInfo().then(res => res.code === 200 && editorStore.loadEditorProject(res.data) || loadEditorProjectSuccess())
  const getAllFonts = apiGetAllFonts().then(res => res.code === 200 && (editorStore.allFont = res.data))
  Promise.all([getProjectInfo, getAllFonts]).then(() => {
    const fontId = editorStore.currentProject?.canvas?.fontId
    if (!fontId || !mainRef.value) return
    editorStore.setFontFamily(<any>mainRef.value, fontId)
  })
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
  sessionStorage.setItem('layout', JSON.stringify(editorStore.currentProject))
  openNotification()
}

onUnmounted(() => {
  editorStore.moveableManager && editorStore.moveableManager.destroy()
  editorStore.lineGuides && editorStore.lineGuides.destroy()
  mainRef.value && mainRef.value!.removeEventListener('click', listenClickWidgetsTarget)
})

</script>

<style scoped lang="scss">
$header-height: 60px;
$item-height: 66px;
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
}

.activeTag {
  background-color: #E8EAEC;
  font-weight: bolder;
  color: black;
  border-radius: 10px;
}

.work-area {
  width: 100%;
  height: calc(100% - $header-height);
  display: flex;

  .aside {
    min-width: 56px;
    min-height: 66px;
    user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
    border-right: #d9d8d8 solid 1px;

    .tool-tags {
      display: flex;
      flex-direction: column;
      width: $tool-tags-width;

      .tag {
        margin: 2px 7px;
        padding: 8px 0;

        .icon {
          font-size: 1.2rem;
        }

        div {
          font-size: 1rem;
          transform: scale(0.8);
          color: #676c73;
          font-weight: 500;
        }

        width: auto;
        text-align: center;
        cursor: pointer;
      }
    }

    .widgets-panel {
      width: calc(310px + $tool-tags-width);
      height: auto;
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