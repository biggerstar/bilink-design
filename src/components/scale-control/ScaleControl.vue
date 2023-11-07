<template>

</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {CSS_DEFINE} from "@/constant";

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
onMounted(() => {
  const selector: string = <string>props.selector
  let dom = document.querySelector(selector) || document
  dom.addEventListener("mousewheel",(ev: WheelEvent) => {
    const isMetaKey = ev.metaKey || ev.ctrlKey
    const wheelDelta = ev['wheelDelta'] || ev.detail

    if (isMetaKey && wheelDelta !== 0) {
      ev.preventDefault()
      const sign = wheelDelta > 0 ? 1 : -1
      const bodyStyle = document.body.style
      const curScale = bodyStyle.getPropertyValue(CSS_DEFINE["--canvas-scale"]) * 1
      const newScale = (curScale + sign * props.scaleWheelStep).toFixed(2) * 1
      const limitScale = Math.min(3, Math.max(newScale, 0.1)) // 最小为0.1缩放,最大为4倍
      bodyStyle.setProperty(CSS_DEFINE["--canvas-scale"], limitScale.toString())
      console.log(sign, limitScale);
    }
  }, {passive: false})
})


</script>

<style scoped>

</style>
