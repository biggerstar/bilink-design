<template>
  <div class="flex justify-around items-center w-full h-full ">
    <slot class="w-1/5 mr-1" name="icon"></slot>
    <a-slider
      color="#2154F4"
      class="w-[60%] ml-4"
      v-model:value="curValue"
      :min="props.min"
      :max="props.max"
      :step="props.step"
    />
    <a-input-number
      class="w-[30%] ml-1"
      :controls="false"
      v-model:value="curValue"
      :min="props.min"
      :max="props.max"
      :step="props.step"
    />
  </div>

</template>
<script lang="ts" setup>
import {ref, watch} from "vue";

const props = defineProps({
  value: {  // 双向绑定
    type: Number,
    default: 0
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
  step: {
    type: Number,
    default: 1
  },
  trackColor: {   // 轨道颜色
    type: String,
    default: '#2154F4'
  }
})
const {trackColor} = props
const curValue = ref(props.value)
const emit = defineEmits(['change', 'update:value'])

watch(curValue, () => {
  emit('update:value', curValue.value)
  emit('change', curValue.value)
})

</script>
<style scoped>
:deep(.ant-input-number) {
  border-color: transparent;
  background-color: transparent;
}

:deep(.ant-slider-handle::after) {
  box-shadow: 0 0 0 2px v-bind(trackColor);
}

:deep(.ant-slider:hover .ant-slider-handle::after) {
  box-shadow: 0 0 0 2px v-bind(trackColor);
}

:deep(.ant-slider-track) {
  background-color: v-bind(trackColor);
}

:deep( .ant-slider:hover .ant-slider-track) {
  background-color: v-bind(trackColor);
}

</style>
