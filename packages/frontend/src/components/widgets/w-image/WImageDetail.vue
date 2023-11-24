<template>
  <div class="detail-main not-user-select w-full h-full relative">
    <card title="基础">
      <SliderNumber
        v-if="isNumber(widgetOpacity)"
        class="w-full"
        :max="100"
        :min="0"
        :step="1"
        v-model:value="widgetOpacity"
        @change="opacityChanged"
      >
        <template #icon>
          <span class="text-[0.9rem] w-1/3 min-w-[60px]">不透明度</span>
        </template>
      </SliderNumber>
    </card>
    <hr class="hr-line">
  </div>
</template>

<script setup>
import {onMounted, ref, toRaw} from "vue";
import {editorStore} from "@/store/editor";
import SliderNumber from '@/components/slider-number/SliderNumber.vue'
import {isNumber} from "is-what";

const widgetOpacity = ref()
const opacityChanged = (val) => editorStore.updateActiveWidgetsState({opacity: val / 100},{effectDom:true})
onMounted(() => {
  const currentOptions = toRaw(editorStore.getCurrentOptions() || {})
  widgetOpacity.value = isNumber(currentOptions.opacity) ? currentOptions.opacity * 100 : 100
})

</script>

<style scoped>

</style>
