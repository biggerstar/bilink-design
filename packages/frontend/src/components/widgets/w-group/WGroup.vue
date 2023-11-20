<template>
  <div
    data-widget-type="widget"
    data-widget-name='w-group'
    class="w-position not-user-select"
    ref="W_Widget"
  >
    <div class="w-full h-full relative">
      <component
        v-show=" widgetsMap[widgetConfig.type]"
        v-for="(widgetConfig,index) in elements"
        :data-widget-in-group="true"
        :is="widgetsMap[widgetConfig.type]"
        :config="widgetConfig"
        :key="`${index}${widgetConfig.uuid}`"
      ></component>
    </div>
  </div>
</template>
<script setup lang="ts">
import {createBaseCssAction} from "@/components/widgets/base-action";
import {onMounted, ref} from "vue";
import {widgetsMap} from "@/config/widgets-map";

const props = <any>defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const elements = props.config.elements
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


.edit-widget-area {
  outline: none;
  word-break: break-word;
  margin: 0;
}
</style>
