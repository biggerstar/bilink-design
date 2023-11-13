<template>
  <div id="design-canvas" ref="designCanvas" class="not-user-select">
    <div id="editor-shell-wrap">
      <div id="editor-area-box">
        <div id="editor-area" ref="editorArea">
          <slot></slot>
          <a-watermark :content="props.config.watermark || ''" style="height: 100%; width: 100%;z-index: -1">
          </a-watermark>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {editorStore} from "@/store/editor";

const designCanvas = ref()
const editorArea = ref()
const props = defineProps({
  config: {
    type: Object,
    required: true,
  }
})
onMounted(() => {
  editorStore.editorAreaTarget = editorArea.value
  editorStore.designCanvasTarget = designCanvas.value
  editorStore.updateCanvasStyle({
    /* 外部无传入对应参数时的默认配置 */
    width: 600,
    height: 800,
    padding: 60,
    bgColor: '#FFF',
    scale: void 0,
    ...props.config
  })
})


</script>

<style scoped lang="scss">
#design-canvas {
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
  width: calc(var(--canvas-width) * var(--canvas-scale));
  height: calc(var(--canvas-height) * var(--canvas-scale));
  overflow: hidden;
}

#editor-area {
  position: relative;
  width: var(--canvas-width);
  height: var(--canvas-height);
  transform-origin: left top;
  transform: scale(var(--canvas-scale));
}
</style>
