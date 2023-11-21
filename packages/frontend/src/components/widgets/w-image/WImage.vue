<template>
  <div
    :data-uuid="props.config.uuid"
    data-widget-type="widget"
    data-widget-name='w-image'
    class="w-position not-user-select"
    ref="W_Widget"
  >
    <div class="edit-widget-area w-full h-full" spellcheck="false">
      <img class="w-full h-full" draggable="false" :src="props.config.url" :alt="props.config.title">
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
const W_Widget = ref()
let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()

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
