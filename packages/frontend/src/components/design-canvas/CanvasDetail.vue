<template>
  <div v-if="isShowDetailPage" style=" width: 100%; height: 100%; ">
    <card title="画布" class="not-user-select">
      <a-space v-if="isShowResizeCanvas">
        <a-space>
          <span>宽</span>
          <a-input-number
            :step="20"
            v-model:value="currentInfo.width"
          />
        </a-space>
        <a-space>
          <span>高</span>
          <a-input-number
            :step="20"
            v-model:value="currentInfo.height"
          />
        </a-space>
      </a-space>
      <div v-else class="canvas-size-info">
        <div>尺寸</div>
        <div>{{ `${currentInfo.width} x ${currentInfo.height} px` }}</div>
      </div>
      <Button class="mt-[15px]" v-if="!isShowResizeCanvas" @click='isShowResizeCanvas=true'>调整尺寸</Button>
      <Button class="mt-[15px]" v-else @click='isShowResizeCanvas=false'>完成</Button>
    </card>
    <hr class="hr-line">

    <card v-if="predefineColorList" title="背景色" class="not-user-select">
      <template #header>
        <el-color-picker v-model="currentInfo.backgroundColor" show-alpha :predefine="predefineColorList"/>
      </template>
    </card>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref, watch} from 'vue';
import Card from "@/components/card/Card.vue";
import {editorStore} from '@/store/editor'
import ElColorPicker from 'element-plus/es/components/color-picker/index.mjs'
import 'element-plus/es/components/color-picker/style/index.mjs'
import {deepmerge} from "@biggerstar/deepmerge";
import {pick} from "lodash-es";

const isShowResizeCanvas = ref(false)
const isShowDetailPage = ref(false)

let predefineColorList = ref()
const currentInfo = ref({})

onMounted(async () => {
  deepmerge(currentInfo.value, pick(editorStore.getCurrentTemplateLayout(), ['width', 'height', 'backgroundColor']), {})
  predefineColorList.value = editorStore.pageConfig.predefineColors
  isShowDetailPage.value = true
})
watch(currentInfo.value, () => editorStore.updateCanvasStyle(currentInfo.value), {deep: true})

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
