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
      <Button class="mt-[15px]" v-if="!isShowResizeCanvas" @click='isShowResizeCanvas=true'>调整尺寸</Button>
      <Button class="mt-[15px]" v-else @click='isShowResizeCanvas=false'>完成</Button>
    </card>
    <hr class="hr-line">

    <card v-if="predefineColorList" title="背景色" class="not-user-select">
      <template #header>
        <el-color-picker v-model="curBgColor" show-alpha :predefine="predefineColorList"/>
      </template>
    </card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw, watch} from 'vue';
import Card from "@/components/card/Card.vue";
import {editorStore} from '@/store/editor'
import ElColorPicker from 'element-plus/es/components/color-picker/index.mjs'
import 'element-plus/es/components/color-picker/style/index.mjs'
import {LayoutConfig} from "@type/layout";

const isShowResizeCanvas = ref(false)

let predefineColorList = ref()
const canvasInfo = ref<LayoutConfig>()
const curBgColor = ref('#FFF')

onMounted(() => {
  canvasInfo.value = toRaw(editorStore.currentTemplate.layouts[0])
  predefineColorList.value = editorStore.pageConfig.predefineColors

})
watch(curBgColor, () => {
  editorStore.updateCanvasStyle({backgroundColor: curBgColor.value})
})
watch([canvasInfo], () => {
  editorStore.updateCanvasStyle(canvasInfo.value)
}, {
  deep: true
})

</script>

<style scoped>

.canvas-size-info {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  color: grey;
  font-weight: 500;
}
</style>
