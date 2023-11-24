<template>
  <div
    :data-uuid="props.config.uuid"
    data-widget-type="widget"
    data-widget-name='w-svg'
    class="w-position not-user-select"
    ref="W_Widget"
  >
    <div class="edit-widget-area" spellcheck="false">
      <a-spin :spinning="!svgData">
        <div v-if="svgData" v-html="svgData" ref="svgBoxRef"></div>
      </a-spin>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import {createBaseCssAction} from "@/components/widgets/base-action";
import axios from "axios";

const props = defineProps({
  config: {
    type: Object,
    default: {}
  } as any
})
const W_Widget = ref<HTMLElement>()
const svgBoxRef = ref<HTMLElement>()
const svgData = ref('')
const loading = ref<boolean>(true)
let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()
baseCssAction.expand({
  height: () => null, /* image的高让其按照宽度自适应，无需主动设置 */
  colors: (colors) => {
    if (!svgBoxRef.value) return
    const svgEl = svgBoxRef.value.querySelector('svg')
    if (!svgEl) return
    let [color1, color2] = colors
    if (!color2) color2 = color1
    baseCssAction.updateStyle('fill', color1, svgEl)
    baseCssAction.updateStyle('stroke', color2, svgEl)
  },
})

onMounted(async () => {
  if (!W_Widget.value) return
  baseCssAction.connect(W_Widget.value)
  baseCssAction.patchConfigToElement(props.config)
  baseCssAction.setState(props.config)   // 先设置保证group时位置正确
  const res = await axios.get(props.config.url)
  svgData.value = res.data
  nextTick(() => baseCssAction.setState(props.config)).then()  // 等待获取svg后继续在进行设置颜色参数啥的
})
</script>

<style scoped>
.w-position {
  position: absolute;
  cursor: move;
  left: 0;
  top: 0;
}
</style>
