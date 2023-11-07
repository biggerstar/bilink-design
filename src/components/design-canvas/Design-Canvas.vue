<template>
  <div id="design-canvas" ref="designCanvas">
    <div id="editor-shell-wrap">
      <div id="editor-area-box">
        <div id="editor-area">
          <slot></slot>
          <div data-type="widgets" style="height: 100px;width: 200px; background-color: #747bff"></div>
          <div data-type="widgets" style="height: 100px;width: 200px; background-color: #747bff"></div>
          <div data-type="widgets" style="height: 100px;width: 200px; background-color: #747bff"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {isNumber} from "is-what";
import {CSS_DEFINE} from "@/constant/index";

const designCanvas = ref()

const props = defineProps({
  w: {
    type: Number,
    required: true,
    default: 600
  },
  h: {
    type: Number,
    required: true,
    default: 800
  },
  scale: {
    type: [Number, null],
    required: false,
  },
  padding: {
    type: [Number, null],
    required: false,
    default: 60
  },
})

function setCurrentScale() {  // 设置当前尺寸，未设置 scale 或者 scale 为 -1 自动设置最佳尺寸
  let {w: width, h: height, scale, padding} = props
  if (!scale || isNumber(scale) && scale <= 0) {
    const designCanvasEl = designCanvas.value
    const rect = designCanvasEl.getBoundingClientRect()
    scale = Math.min((rect.width - padding * 2) / width, (rect.height - padding * 2) / height).toFixed(2)       // 获取最佳比例
  }
  const bodyStyle = document.body.style
  bodyStyle.setProperty(CSS_DEFINE["--canvas-width"], `${width}px`)
  bodyStyle.setProperty(CSS_DEFINE["--canvas-height"], `${height}px`)
  bodyStyle.setProperty(CSS_DEFINE["--canvas-scale"], scale)
  bodyStyle.setProperty(CSS_DEFINE["--canvas-padding"], `${padding}px`)
}

onMounted(() => {
  setCurrentScale()
})

// watch(props,() => {
//   setCurrentScale()
// })

</script>

<style scoped lang="scss">
#design-canvas {
  height: 100%;
  width: 100%;
  background-color: #F6F7F9;
  overflow: auto;
}

#editor-shell-wrap {
  padding: var(--canvas-padding);
  margin: auto;
  width: calc(var(--canvas-width) * var(--canvas-scale) + var(--canvas-padding) * 2);
  height: calc(var(--canvas-height) * var(--canvas-scale) + var(--canvas-padding) * 2);
  //width:100%;
  //height:100%;
}

#editor-area-box {
  width: calc(var(--canvas-width) * var(--canvas-scale));
  height: calc(var(--canvas-height) * var(--canvas-scale));
  overflow: hidden;
}

#editor-area {
  margin: auto;
  width: var(--canvas-width);
  height: var(--canvas-height);
  background: #b2afaf;
  transform-origin: left top;
  transform: scale(var(--canvas-scale));
}
</style>
