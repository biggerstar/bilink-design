<template>
  <div v-if="canvasInfo" style=" width: 100%; height: 100%; ">
    <card title="画布" class="not-user-select">
      <a-space v-if="isShowResizeCanvas">
        <a-space>
          <span>宽</span>
          <a-input-number
            :step="20"
            v-model:value="canvasInfo.width"
          />
        </a-space>
        <a-space>
          <span>高</span>
          <a-input-number
            :step="20"
            v-model:value="canvasInfo.height"
          />
        </a-space>
      </a-space>
      <div v-else class="canvas-size-info">
        <div>尺寸</div>
        <div>{{ `${canvasInfo.width} x ${canvasInfo.height} px` }}</div>
      </div>
      <div class="reset-canvas-btn" v-if="!isShowResizeCanvas" @click='isShowResizeCanvas=true'>调整尺寸</div>
      <div class="reset-canvas-btn" v-else @click='isShowResizeCanvas=false'>完成</div>
    </card>
    <hr class="hr-line">

    <card title="背景色" class="not-user-select">
      <template #header>
        <el-color-picker v-model="canvasInfo.background.color" show-alpha :predefine="predefineColorList"/>
      </template>
    </card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import Card from "@/components/card/Card.vue";
import {editorStore} from '@/store/editor'
import ElColorPicker from 'element-plus/es/components/color-picker/index.mjs'
import 'element-plus/es/components/color-picker/style/index.mjs'
import {predefineColorList} from "@/config/base";
import {LayoutConfig} from "@type/layout";

const isShowResizeCanvas = ref(false)
const canvasInfo = ref<LayoutConfig>()
onMounted(() => {
  canvasInfo.value = editorStore.currentTemplate.layouts[0]
})
watch([canvasInfo], () => {
  editorStore.updateCanvasStyle(canvasInfo.value)
}, {
  deep: true
})

</script>

<style scoped>
.reset-canvas-btn {
  background-color: var(--color-gray-300);
  width: 90%;
  font-weight: 400;
  padding: 10px;
  margin: 16px auto auto;
  border-radius: 10px;
  font-size: .9rem;
  cursor: pointer;
}

.reset-canvas-btn:hover {
  background-color: var(--color-gray-400);
}

.canvas-size-info {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  color: grey;
  font-weight: 500;
}
</style>
