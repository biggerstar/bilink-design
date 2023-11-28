<template>
  <div class="detail-main not-user-select w-full h-full relative">
    <card title="基础">
      <OpacityCard v-model:value="widgetOpacity" @opacity-changed="opacityChanged"></OpacityCard>
    </card>
    <hr class="hr-line">
  </div>
</template>

<script setup>
import {onMounted, ref, toRaw} from "vue";
import {editorStore} from "@/store/editor";
import {isNumber} from "is-what";
import OpacityCard from '@/components/opacity-card/OpacityCard.vue'

const widgetOpacity = ref()
const opacityChanged = (val) => editorStore.updateActiveWidgetsState({opacity: val / 100}, {effectDom: true})
onMounted(() => {
  const currentOptions = toRaw(editorStore.getCurrentOptions() || {})
  widgetOpacity.value = isNumber(currentOptions.opacity) ? currentOptions.opacity * 100 : 100
})

</script>

<style scoped>

</style>
