<template>
  <div v-if="!showMergeGroup" class="w-full h-full">
    <Button class="mt-[5px] mb-[5px]" @click="makeGroup(false)">
      <span>拆分组</span>
    </Button>
    <Button class="mt-[5px] mb-[5px]" @click="inGroupMovement">
      <span>组内移动</span>
    </Button>
  </div>
  <div v-else class="w-full h-full">
    <Button class="mt-[5px] mb-[5px]" @click="makeGroup(true)">
      <span>成组</span>
    </Button>
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

const inGroupMovement = () => editorStore.autoMonitoringGroupMovement()

onMounted(() => {
  const currentGroupElement = editorStore.moveableManager.currentGroupElement
  if (currentGroupElement) showMergeGroup.value = false   // 点击某个组件，然后该控制面板挂载后如果当前点击的是一个组，则显示拆分组按钮
})


</script>

<style scoped>

</style>
