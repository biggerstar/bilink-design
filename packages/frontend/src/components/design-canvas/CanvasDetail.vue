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

    <card v-if="predefineColorList && currentInfo.backgroundImage" title="背景图" class="not-user-select">
      <div class="w-full h-[120px] relative  rounded-lg overflow-hidden">
        <div class="tooltip h-[20px] min-w-[60px]">
          <span class="iconfont icon-shuipingfanzhuan"
                @click="editorStore.editorAreaBgTarget.style.transform = `scale(1.2)`"></span>
          <span class="iconfont icon-shanchu-" @click="currentInfo.backgroundImage = null"></span>
        </div>
        <div class="bg-preview-container flex-center fill-box">
          <img :src="currentInfo.backgroundImage" class="w-[50px] h-[80px] rounded-lg object-fill" alt="bg"/>
        </div>
      </div>
      <OpacityCard v-model:value="currentInfo.opacity"></OpacityCard>
    </card>
    <hr v-if="currentInfo.backgroundImage" class="hr-line">

    <card v-if="predefineColorList" title="背景色" class="not-user-select">
      <template #header>
        <el-color-picker v-model="currentInfo.backgroundColor" show-alpha :predefine="predefineColorList"/>
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
import {deepmerge} from "@biggerstar/deepmerge";
import {pick} from "lodash-es";
import {isNumber} from "is-what";
import OpacityCard from '@/components/opacity-card/OpacityCard.vue'

const isShowResizeCanvas = ref(false)
const isShowDetailPage = ref(false)
let predefineColorList = ref()
type CurrentInfoType = {
  width: number;
  height: number;
  opacity: number;
  backgroundColor: string;
  backgroundImage: string;
}
const currentInfo = ref<Partial<CurrentInfoType>>({})

onMounted(async () => {
  deepmerge(currentInfo.value, pick(editorStore.getCurrentTemplateLayout(), ['width', 'height', 'backgroundColor', 'backgroundImage', 'opacity']), {})
  const currentOptions = toRaw(editorStore.getCurrentOptions() || {})
  currentInfo.value.opacity = isNumber(currentOptions.opacity) ? currentOptions.opacity * 100 : 100
  predefineColorList.value = editorStore.pageConfig.predefineColors
  isShowDetailPage.value = true
})
watch(currentInfo.value, () => {
  editorStore.updateCanvasStyle({
    ...currentInfo.value,
    opacity: currentInfo.value.opacity / 100,
  })
}, {deep: true})

</script>

<style scoped lang="scss">

.canvas-size-info {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  color: grey;
  font-weight: 500;
}

.bg-preview-container {
  background-color: #F1F2F4;
  transition: 0.3s;

  &:hover {
    background-color: var(--color-gray-300);
    opacity: 0.7;
    filter: brightness(0.9);
  }
}

.tooltip {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  z-index: 2;

  span {
    padding: 2px 5px;
    font-size: 0.8rem;
    background-color: white;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background-color: var(--color-gray-200);
    }

    &:active {
      background-color: var(--color-gray-300);
    }
  }
}

</style>
