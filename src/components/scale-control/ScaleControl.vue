<template>
  <div>
    <a-popover v-model:open="visible" placement="topRight" title="Title" trigger="click">
      <template #content>
        <a @click="visible.value = false">Close</a>
      </template>

      <div class="adjustment-btn-box" @mouseleave="mouseleaveAdjustmentBtn">
        <span v-show="isShowAdjustmentBtn" class="adjustment-btn-item not-user-select">-</span>
        <span v-show="isShowAdjustmentBtn" class="adjustment-btn-item not-user-select">+</span>
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
})

const emits = defineEmits(['scaleChanged'])


const visible = ref<boolean>(false)
const isShowAdjustmentBtn = ref<boolean>(false)
const scaleValue = ref<string>('')

const mouseenterAdjustmentBtn = () => isShowAdjustmentBtn.value = true
const mouseleaveAdjustmentBtn = () => isShowAdjustmentBtn.value = false


onMounted(() => {
  const bodyStyle = document.body.style
  scaleValue.value = toPercent(bodyStyle.getPropertyValue(CSS_DEFINE["--canvas-scale"]))
  const selector: string = <string>props.selector
  let dom = document.querySelector(selector) || document.body
  dom.addEventListener("mousewheel", (ev: WheelEvent) => {
    const isMetaKey = ev.metaKey || ev.ctrlKey
    const wheelDelta = ev['wheelDelta'] || ev.detail

    if (isMetaKey && wheelDelta !== 0) {
      ev.preventDefault()

      // const inOriginInfo = getMouseInElementPercent(ev, dom)
      // dom.scrollTo({
      //     left: inOriginInfo.percentX / 100 * dom.clientWidth,
      //     top: inOriginInfo.percentY / 100 * dom.clientHeight,
      //     behavior: "smooth",
      //   }
      // )

      const sign = wheelDelta > 0 ? 1 : -1
      const curScale = bodyStyle.getPropertyValue(CSS_DEFINE["--canvas-scale"]) * 1
      const newScale = (curScale + sign * props.scaleWheelStep).toFixed(2) * 1
      const limitScale = Math.min(2, Math.max(newScale, 0.1)) // 最小为0.1缩放,最大为4倍
      scaleValue.value = toPercent(limitScale)
      bodyStyle.setProperty(CSS_DEFINE["--canvas-scale"], limitScale.toString())
      emits('scaleChanged')
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
