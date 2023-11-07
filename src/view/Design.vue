<template>
  <div class="header">
    <div>BiLink设计</div>
  </div>
  <div class="work-area">
    <div class="aside">
      <div class="tool-tags">
        <div v-for="(item,index) in tagList" :key="index" @click="gotoTag(index,item)">
          <div class="tag" :class="{activeTag: activeTagIndex === index }">
            <i class="iconfont icon" :class="item.icon"> </i>
            <div>{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="widgets-panel" v-show="activeTagIndex >= 0"></div>
    </div>
    <div id="main" class="main">
      <Design-Canvas
          :w="editorStore.canvas.width"
          :h="editorStore.canvas.height"
          :scale='editorStore.canvas.scale'
      />
      <ScaleControl selector="#main" :scaleWheelStep="editorStore.canvas.scaleWheelStep"/>
    </div>

    <div class="widgets-detail"></div>

  </div>
</template>

<script setup lang="ts">
import tags from '@/mock/tags'
import {onMounted, onUnmounted, ref} from "vue";
import {defaultMoveableOptions, MoveableManager} from '@/common/moveable'
import DesignCanvas from "@/components/design-canvas/Design-Canvas.vue";
import {useEditorStore} from "@/store/editor";
import ScaleControl from "@/components/scale-control/ScaleControl.vue";

const editorStore = useEditorStore()

const tagList = ref(tags)
const activeTagIndex = ref<number>(-1)

function gotoTag(index, item) {
  // console.log(item)
  activeTagIndex.value = activeTagIndex.value === index ? -1 : index
}

let moveableManager: MoveableManager
onMounted(() => {
  moveableManager = new MoveableManager()
  moveableManager.start(defaultMoveableOptions, document.getElementById('main'))
  editorStore.moveableManager = moveableManager
})
onUnmounted(() => {
  moveableManager && moveableManager.stop()
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
    flex: 1;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .widgets-detail {
    min-width: 260px;
    flex-basis: 300px;
    background-color: #fae1f5;
  }
}
</style>
