<template>
  <div class="header">
    <div>BiLink设计</div>
  </div>
  <div class="work-area">
    <div class="aside">
      <div class="tool-tags">
        <div v-for="(item,index) in tagList" :key="index" @click="gotoTag(index)">
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
        v-if="editorStore.canvas"
        :w="editorStore.canvas.width"
        :h="editorStore.canvas.height"
        :scale='editorStore.canvas.scale'
        :bgColor='editorStore.canvas.bgColor'
        :watermark='watermarkData'
      >
        <component v-if="editorStore.currentProject" :is="widgetsMap[item.type]"
                   v-for="item in editorStore.currentProject.items"
                   :config="item"></component>
      </DesignCanvas>
      <div id="main-bottom">
        <ScaleControl
          v-if="editorStore.canvas"
          class="scale-control"
          selector="#design-canvas"
          @scaleChanged='scaleChanged'
          :scaleWheelStep="editorStore.canvas.scaleWheelStep"
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
import {useEditorStore} from "@/store/editor";
import ScaleControl from "@/components/scale-control/ScaleControl.vue";
import {getElement4EventTarget} from "@/utils/tool";
import {widgetsDetailMap, widgetsMap} from "@/config/widgets-map";
import {apiGetProjectInfo} from "@/api/getProjectInfo";
import {apiGetAsideTags} from "@/api/getAsideTags";
import {apiGetAllFonts} from "@/api/getFontData";
import {apiGetCanvasDefaultConfig} from "@/api/getCanvasDefaultConfig";

const editorStore = useEditorStore()
const tagList = ref()
const mainRef = ref<HTMLElement>()
const activeTagIndex = ref<number>(-1)
const watermarkData = ref("bi.link")
const curDetailComp = shallowRef()

// console.log(editorStore)
function gotoTag(index) {
  // console.log(item)
  activeTagIndex.value = activeTagIndex.value === index ? -1 : index
}

function scaleChanged() {
  editorStore.moveableManager.moveable.updateRect()
}

function getCurDetailComp(widgetsName = 'dev') {
  return widgetsDetailMap[widgetsName] || widgetsDetailMap['default']
}

function listenClickWidgetsTarget(ev: MouseEvent) {
  const moveableManger = editorStore.moveableManager
  const clickTarget = getElement4EventTarget(ev)
  if (!clickTarget) return
  const res = moveableManger.activeWidgets(clickTarget)
  curDetailComp.value = null
  nextTick(() => {
    curDetailComp.value = getCurDetailComp(res?.name)
    if (res) moveableManger.activeElement = res.el
    else moveableManger.deActive()
  })
}

let moveableManager: MoveableManager
onMounted(async () => {
  curDetailComp.value = getCurDetailComp()
  moveableManager = new MoveableManager()
  moveableManager.start(defaultMoveableOptions, document.getElementById('main'))
  editorStore.moveableManager = <any>moveableManager
  mainRef.value && mainRef.value!.addEventListener('mousedown', listenClickWidgetsTarget)

  apiGetProjectInfo().then(res => res.code === 200 && editorStore.loadEditorProject(res.data))
  apiGetAsideTags().then(res => res.code === 200 && (tagList.value = res.data))
  const getAllFonts = apiGetAllFonts().then(res => res.code === 200 && (editorStore.allFont = res.data))
  const getCanvasDefaultConfig = apiGetCanvasDefaultConfig().then(res => res.code === 200 && (editorStore.canvas = res.data))
  Promise.all([getCanvasDefaultConfig, getAllFonts]).then(res => {
    const fontId = editorStore.canvas?.font?.id
    if (!fontId || !mainRef.value) return
    editorStore.setFontFamily(<any>mainRef.value, fontId)
  })
})

onUnmounted(() => {
  moveableManager && moveableManager.stop()
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
  justify-content: space-around;
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
    flex-basis: 300px;
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
