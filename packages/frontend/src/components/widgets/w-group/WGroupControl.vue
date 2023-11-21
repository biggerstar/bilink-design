<template>
  <div v-if="showMergeGroup" class="w-full h-full">
    <Button class="mt-[5px] mb-[5px]" @click="makeGroup(true)"> 成组</Button>
  </div>
  <div v-else class="w-full h-full">
    <Button class="mt-[5px] mb-[5px]" @click="makeGroup(false)"> 拆分组</Button>
    <Button class="mt-[5px] mb-[5px]" @click="inGroupMovement"> 组内移动</Button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {editorStore} from "@/store/editor";
import Button from '@/components/button/Button.vue'

const showMergeGroup = ref<boolean>(true)

function makeGroup(isMake: boolean) {
  if (isMake) editorStore.mergeGroup()
  else editorStore.separationGroup()
  showMergeGroup.value = !isMake
}

const inGroupMovement = () => {
  editorStore.autoMonitoringGroupMovement()
}


onMounted(() => {
  if (!editorStore.moveableManager) return
  const currentGroupElement = editorStore.moveableManager.currentGroupElement
  // 点击某个组件，然后该控制面板挂载后如果当前点击的是一个组，则显示拆分组按钮, 此时如果正在分离中，说明还在组内，此时需要显示合并成组
  if (currentGroupElement) {
    showMergeGroup.value = false
  }
  if(editorStore.isSeparating)  showMergeGroup.value = true
})


</script>

<style scoped>

</style>
