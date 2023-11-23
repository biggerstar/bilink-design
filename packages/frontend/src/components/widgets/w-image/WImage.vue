<template>
  <div
    :data-uuid="props.config.uuid"
    data-widget-type="widget"
    data-widget-name='w-image'
    class="w-position not-user-select"
    ref="W_Widget"
  >
    <div class="edit-widget-area" spellcheck="false">
      <img class="w-full h-auto bg-no-repeat" ref="imgRef" @load="loading=false" draggable="false" :src="props.config.url"
           :alt="props.config.title">
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {createBaseCssAction} from "@/components/widgets/base-action";

const props = <any>defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const W_Widget = ref<HTMLElement>()
const imgRef = ref<HTMLElement>()
const loading = ref<boolean>(true)
let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()
baseCssAction.expand({
  height: () => null, /* image的高让其按照宽度自适应，无需主动设置 */
})

onMounted(async () => {
  if (!W_Widget.value) return
  baseCssAction.connect(W_Widget.value)
  baseCssAction.setState(props.config)
  baseCssAction.patchConfigToElement(props.config)
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
