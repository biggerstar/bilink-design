<template>
  <div id="design-canvas" ref="designCanvas" class="not-user-select">
    <div id="editor-shell-wrap">
      <div id="editor-area-box" ref="editorAreaBox">
        <div class="editor-area-mask"></div>
        <!-- 取巧使用遮罩覆盖溢出元素 box-shadow 上颜色等于中间镂空两个部分就能分割开 -->
        <div id="editor-area" ref="editorArea">
          <slot></slot>
          <a-watermark :content="'bi.link'" style="height: 100%; width: 100%;z-index: -1">
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
const editorAreaBox = ref()

onMounted(() => {
  editorStore.designCanvasTarget = designCanvas.value
  editorStore.editorAreaBoxTarget = editorAreaBox.value
  editorStore.editorAreaTarget = editorArea.value
  const templateConfig = editorStore.getCurrentTemplateLayout()
  editorStore.displayLineGuides(true)
  editorStore.updateCanvasStyle(templateConfig)
  editorStore.updateCanvasScale()
})

</script>

<style scoped lang="scss">
#design-canvas {
  position: relative;
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
  position: relative;
  background-color: #FFFFFF;
  width: calc(var(--canvas-width) * var(--canvas-scale));
  height: calc(var(--canvas-height) * var(--canvas-scale));
  //overflow: hidden;
}

.editor-area-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 0 10000px #F6F7F9;
  -webkit-box-shadow: 0 0 0 10000px #F6F7F9;
  -moz-box-shadow: 0 0 0 10000px #F6F7F9;
  z-index: 20;
  background-color: transparent;
  pointer-events: none;
}

#editor-area {
  position: relative;
  background-color: transparent;
  width: var(--canvas-width);
  height: var(--canvas-height);
  transform-origin: left top;
  transform: scale(var(--canvas-scale));
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
