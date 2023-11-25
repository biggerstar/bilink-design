<template>
  <div class="flex justify-around">
    <div> {{ pageConfig.brand }}</div>
    <div class="ml-[20px]" v-if="curUsingLayout">
      <a-input
        @focus="isFocusTitleInput=true"
        @blur="isFocusTitleInput=false"
        :class="{
          'focus-title-input':isFocusTitleInput
        }"
        v-model:value="curUsingLayout.title"
        :bordered="false"
        placeholder=""
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from "vue";
import {editorStore} from "@/store/editor.js";

const pageConfig = editorStore.pageConfig
const curUsingLayout = ref()
const isFocusTitleInput = ref(false)

editorStore.bus.on('loadTemplate', async (template) => {
  await nextTick()
  curUsingLayout.value = editorStore.getCurrentTemplateLayout()
  if (!curUsingLayout.value.title) curUsingLayout.value.title = '未命名设计'
})
onMounted(() => curUsingLayout.value = editorStore.getCurrentTemplateLayout())

</script>

<style scoped lang="scss">
.focus-title-input {
  background-color: var(--color-gray-200);
}
</style>
