<template>
  <div
    :data-uuid="config.uuid"
    data-type="widgets"
    data-name='w-text'
    class="w-text not-user-select"
    ref="WText"
    :style="{
      width: config.width ? `${config.width}px` : 'auto',
      height: config.height ? `${config.height}px` : 'auto',
      backgroundColor: config.bgColor,
      left: `${config.left}px`,
      top: `${config.top}px`,
      transform: `rotate(${config.rotate}deg)`,
      fontSize: isNumber(config.fontInfo.size) ? `${config.fontInfo.size}px` : config.fontInfo.size
    }"
  >
    <div>{{ config.text }}</div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// // const value = el ? el.innerHTML : text.replace(/\n/g, '<br/>')
import {apiGetFontData} from "@/api/getFontData";
import {onMounted, shallowRef, watch} from "vue";
import {isNumber} from "is-what";
import {updateFont} from "@/utils/method";

const props = defineProps({
  config: {
    type: Object,
    required: false,
    default: {}
  }
})
const WText = shallowRef<HTMLElement>()
const config: any = props.config

onMounted(async () => {
  return
  if (WText) {
    const fontInfo = await apiGetFontData(config.fontInfo.id)
    if (!fontInfo) return
    updateFont(fontInfo)
  }
})

watch(props.config, () => {

})

</script>

<style scoped>
.w-text {
  position: absolute;
  font-size: 3rem;
  /*cursor: text;*/
  outline: none;
  word-break: break-word;
  text-align: left;
  cursor: move;
}

</style>
