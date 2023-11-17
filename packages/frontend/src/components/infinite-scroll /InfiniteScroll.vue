<!--
  自己封装的无限滚动加载新数据组件
-->

<template>
  <el-scrollbar class="h-full w-full overflow-auto block" ref="cardBoxRef" noresize  @scroll="infiniteScroll">
    <div class="h-full w-full">
      <slot></slot>
    </div>
    <div v-show="props.isLoading" ref="spinRef" class="mb-5 overflow-hidden">
      <a-spin :indicator="indicator"/>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import {h, ref, shallowRef, watch} from "vue";
import {LoadingOutlined} from "@ant-design/icons-vue";
import {ScrollbarInstance} from 'element-plus'
import {isElementAtBottom} from "@/utils/tool";

const cardBoxRef = ref<ScrollbarInstance>()
const spinRef = shallowRef<HTMLElement>()

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  distance: {
    type: Number,
    default: 0
  },
  lockTime: {
    type: Number,
    default: 300
  }
})

const emits = defineEmits(['scrollToBottom'])
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '30px',
    color: '#000',
  },
  spin: true,
})

let lockFirstChangeScroll = false  // 锁定阻止自动加载后渲染会再次调用一次的 scroll 回调

function infiniteScroll(offsetInfo) {
  if (!cardBoxRef.value || lockFirstChangeScroll) return
  const containerEl = cardBoxRef.value?.wrapRef
  if (!containerEl) return
  if (isElementAtBottom(containerEl, props.distance)) {
    emits('scrollToBottom', offsetInfo, containerEl)
  }
}

watch(props, () => {
  lockFirstChangeScroll = true
  setTimeout(() => lockFirstChangeScroll = false, props.lockTime)
})

</script>

<style scoped>

</style>
