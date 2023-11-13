<template>
  <div class="flex justify-around items-center w-full h-full pl-2 pr-2">
    <slot class="w-1/5 mr-1" name="icon"></slot>
    <a-slider
      class="w-3/5 ml-4"
      v-model:value="curValue"
      :min="props.min"
      :max="props.max"
      :step="props.step"
    />
    <a-input-number
      class="w-1/4 ml-2"
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
})
const curValue = ref(props.value)
const emit = defineEmits(['change', 'update:value'])

watch(curValue, () => {
  emit('update:value', curValue.value)
  emit('change', curValue.value)
})

</script>
<style scoped>
.code-box-demo .ant-slider {
  margin-bottom: 16px;
}

:deep(.ant-input-number) {
  border-color: transparent;
  background-color: transparent;
}
</style>
