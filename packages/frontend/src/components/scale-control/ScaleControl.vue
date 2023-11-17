<!--  工程中所有调整 scale 的操作都在该组件中 -->

<template>
  <div>
    <a-popover v-model:open="visiblePopover" placement="topRight" trigger="click">
      <template #content>
        <div class="w-[230px]"></div>
        <div class="not-user-select cursor-pointer flex justify-evenly flex-col w-full">
          <div
            v-for="itemGroup in actionList"
          >
            <div
              v-for="item in itemGroup"
              class="h-[40px] h-[220px] text-left leading-[40px] flex justify-between"
              :style="item.style"
              :key="item.text"
              @click="item.handler"
            >
              <div>{{ item.text }}</div>
              <div v-if="item.selected">✔</div>
            </div>
            <hr v-if="actionList[actionList.length - 1] !== itemGroup" class="m-[10px]">
          </div>

        </div>
      </template>

      <div class="adjustment-btn-box" @mouseleave="mouseleaveAdjustmentBtn">
        <span v-show="isShowAdjustmentBtn" @click="subtraction($event)"
              class="adjustment-btn-item not-user-select">-</span>
        <span v-show="isShowAdjustmentBtn" @click="addition($event)"
              class="adjustment-btn-item not-user-select">+</span>
        <span class="adjustment-btn-item not-user-select" @mouseenter="mouseenterAdjustmentBtn">
          {{ scaleValue }}
        </span>
      </div>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {CSS_DEFINE} from "@/constant";
import {toPercent} from "@/utils/tool";
import {editorStore} from "@/store/editor";
import {toFixed} from "@/utils/method";

const props = defineProps({
  selector: {  // 将该工具绑定到某个el元素中
    type: String,
    required: true
  },
  scaleWheelStep: {  // 缩放步数
    type: Number,
    required: false,
    default: 0.02
  },
  scaleManualStep: {  // 手动点击调整按钮的缩放步数
    type: Number,
    required: false,
    default: 0.2
  }
})
const displayLineGuides = ref(false)
const lineGuidesList = [
  {
    text: '显示标尺和参考线',
    handler() {
      if (!editorStore.lineGuides) {
        editorStore.displayLineGuides(true)
        displayLineGuides.value = true
      } else if (editorStore.lineGuides) {
        editorStore.displayLineGuides(false)
        displayLineGuides.value = false
      }
    },
    get selected() {
      return displayLineGuides
    },
    style: {
      fontWeight: 'bold'
    },
  },
]

const scaleList = editorStore.currentProject.scaleSizeList.map(scaleNum => {
  return {
    text: toPercent(scaleNum),
    handler() {
      editorStore.updateCanvasStyle({scale: scaleNum}, {safe: true})
      scaleValue.value = toPercent(scaleNum)
    },
    get selected() {
      return scaleNum === editorStore.getCurScaleValue()
    }
  }
})

const otherScaleList = [
  {
    text: '适合屏幕',
    handler: () => {
      editorStore.updateCanvasStyle({scale: null}, {safe: true})
      scaleValue.value = toPercent(getCurScaleValue())
    },
    get selected() {
      return !editorStore.currentProject.scaleSizeList.includes(editorStore.getCurScaleValue())
    }
  },
]

const actionList = ref([lineGuidesList, scaleList, otherScaleList])


const visiblePopover = ref<boolean>(false)
const isShowAdjustmentBtn = ref<boolean>(false)
const scaleValue = ref<string | number>('')

const mouseenterAdjustmentBtn = () => isShowAdjustmentBtn.value = true
const mouseleaveAdjustmentBtn = () => isShowAdjustmentBtn.value = false
const getCurScaleValue = () => Number(document.body.style.getPropertyValue(CSS_DEFINE["--canvas-scale"]))

function addition(ev: Event) {
  ev.stopPropagation()
  visiblePopover.value = false
  const curScaleNum = getCurScaleValue()
  const newScaleVal = Math.min(2, toFixed(curScaleNum + props.scaleManualStep, 3))
  scaleValue.value = toPercent(newScaleVal)
  editorStore.updateCanvasStyle({scale: newScaleVal}, {safe: true})
}

function subtraction(ev: Event) {
  ev.stopPropagation()
  visiblePopover.value = false
  const curScaleNum = getCurScaleValue()
  const newScaleVal = Math.max(0.1, toFixed(curScaleNum - props.scaleManualStep, 3))
  scaleValue.value = toPercent(newScaleVal)
  editorStore.updateCanvasStyle({scale: newScaleVal}, {safe: true})
}

onMounted(() => {
  const bodyStyle = document.body.style
  scaleValue.value = toPercent(getCurScaleValue())
  const selector: string = <string>props.selector
  let dom = document.querySelector(selector) || document.body
  dom.addEventListener("mousewheel", (ev: WheelEvent) => {
    const isMetaKey = ev.metaKey || ev.ctrlKey
    const wheelDelta = ev['wheelDelta'] || ev.detail
    if (isMetaKey && wheelDelta !== 0) {
      ev.preventDefault()
      const sign = wheelDelta > 0 ? 1 : -1
      const curScale = getCurScaleValue()
      const newScale = (curScale + sign * props.scaleWheelStep).toFixed(2) * 1
      const limitScale = Math.min(2, Math.max(newScale, 0.1)) // 最小为0.1缩放,最大为2倍
      scaleValue.value = toPercent(limitScale)
      bodyStyle.setProperty(CSS_DEFINE["--canvas-scale"], limitScale.toString())
      editorStore.updateCanvasStyle({scale: limitScale}, {safe: true})
    }
  }, {passive: false})
})


</script>

<style scoped lang="scss">

$adjustment-btn-color: #f1f0f0;

.adjustment-btn-box {
  display: flex;
  flex-direction: row;
  text-align: center;
  background: white;
  padding: 3px 5px;
  border-radius: 8px;
  transition: all .5s;
}

.adjustment-btn-item {
  min-width: 2.5rem;
  background-color: white;
  padding: 5px 5px;
  font-size: .9rem;
  font-weight: 600;
}

.adjustment-btn-item:hover {
  border-radius: 5px;
  background: $adjustment-btn-color;
}
</style>
