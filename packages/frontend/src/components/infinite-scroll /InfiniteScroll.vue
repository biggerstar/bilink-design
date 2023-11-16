<!--
  自己封装的无限滚动加载新数据组件
-->

<template>
  <el-scrollbar class="h-full w-full overflow-auto" ref="cardBoxRef" @scroll="infiniteScroll">
    <div class="h-full w-full">
      <slot></slot>
    </div>
    <div v-if="props.isLoading" class="mb-5">
      <a-spin :indicator="indicator"/>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import {h, ref} from "vue";
import {LoadingOutlined} from "@ant-design/icons-vue";
import {ScrollbarInstance} from 'element-plus'
import {isElementAtBottom} from "@/utils/tool";

const cardBoxRef = ref<ScrollbarInstance>()

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  distance: {
    type: Number,
    default: 0
  },
})

const emits = defineEmits(['scrollToBottom'])
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '30px',
    color:'#000',
  },
  spin: true,
})

function infiniteScroll(offsetInfo) {
  if (!cardBoxRef.value) return
  const containerEl = cardBoxRef.value?.wrapRef
  if (!containerEl) return
  if (isElementAtBottom(containerEl, props.distance)) {
    emits('scrollToBottom', offsetInfo, containerEl)
  }
}
</script>

<style scoped>

</style>
