<template>
  <SliderNumber
    class="w-full"
    :max="props.max"
    :min="props.min"
    :step="props.step"
    v-model:value="opacity"
    @change="opacityChanged"
  >
    <template #icon>
      <span class="text-[0.9rem] w-1/3 min-w-[60px]"> {{ props.text }}</span>
    </template>
  </SliderNumber>
</template>

<script setup lang="ts">
import {ref} from "vue";

const props = defineProps({
  text: {
    type: String,
    default: '不透明度'
  },
  value: {
    type: Number,
    default: 100
  },
  max: {
    type: Number,
    default: 100
  },
  min: {
    type: Number,
    default: 0
  },
  step: {
    type: Number,
    default: 1
  },
})

const opacity = ref(props.value)

const emits = defineEmits(['opacity-changed', 'update:value'])

function opacityChanged() {
  emits('update:value', opacity.value)
  emits('opacity-changed', opacity.value)
}


</script>

<style scoped>

</style>
