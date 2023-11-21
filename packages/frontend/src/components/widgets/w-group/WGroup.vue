<template>
  <div
    :data-uuid="props.config.uuid"
    data-widget-type="widget"
    data-widget-name='w-group'
    class="w-position not-user-select w-full h-full"
    ref="W_Widget"
  >
    <div class="group-box w-full h-full relative" ref="groupBox">
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
import {onMounted, onUnmounted, ref} from "vue";
import {widgetsMap} from "@/config/widgets-map";
import {editorStore} from "@/store/editor";
import {CssTransformApi, parseWidget4DomChain} from "@/utils/method";
import {getElement4EventTarget} from "@/utils/tool";
import {DESIGN_SET_STATE} from "@/constant";
import {isFunction} from "is-what";

const props = <any>defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const elements = props.config.elements
const W_Widget = ref<HTMLElement>()
const groupBox = ref<HTMLElement>()
let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()
let childrenPosition = []

/**
 *  设置当前位置的宽高和位置，保证group元素完全包裹所有子组件
 * */
function autoSetWGroupSizeAndOffsetPosition() {
  const cssTransformApi = new CssTransformApi()
  cssTransformApi.load(W_Widget.value.style.transform)
  let pos = cssTransformApi.get('translate')
  if (!pos) return
  pos = pos.map(parseFloat)

  const newChildrenPosition = loadAllChildrenPosition()
  const {clientWidth, clientHeight} = W_Widget.value
  const minX = Math.min.apply(null, newChildrenPosition.map(info => info.x))
  const maxX = Math.max.apply(null, newChildrenPosition.map(info => info.x + info.w))
  const minY = Math.min.apply(null, newChildrenPosition.map(info => info.y))
  const maxY = Math.max.apply(null, newChildrenPosition.map(info => info.y + info.h))
  // console.log(newChildrenPosition)
  // console.log('minX', minX, 'maxX', maxX, 'minY', minY, 'maxY', maxY, 'clientWidth', clientWidth, 'clientHeight', clientHeight);
  let curW, curH
  let offsetLeft = 0, offsetTop = 0
  offsetLeft = minX
  offsetTop = minY
  curW = minX < 0 ? clientWidth + Math.abs(offsetLeft) : maxX - offsetLeft
  curH = minY < 0 ? clientHeight + Math.abs(offsetTop) : maxY - offsetTop
  // console.log(curW, curH, offsetLeft, offsetTop)
  W_Widget.value.style.width = `${curW}px`
  W_Widget.value.style.height = `${curH}px`
  cssTransformApi.change('translate', `${offsetLeft + pos[0]}px,${offsetTop + pos[1]}px`)
  cssTransformApi.apply(W_Widget.value)
  /* 重置group内组件位置并同步到外部配置中 */
  newChildrenPosition.forEach(info => {
    const element = info.node
    if (!isFunction(element[DESIGN_SET_STATE])) return
    element[DESIGN_SET_STATE]({
      left: info.x - offsetLeft,
      top: info.y - offsetTop,
    })
  })
}

function loadAllChildrenPosition(): { node: HTMLElement; x: number; y: number, w: number; h: number }[] {
  const cssTransformApi = new CssTransformApi()
  const childs: HTMLElement[] = <any>Array.from(groupBox.value.children)
  return childs.map((node) => {
    cssTransformApi.load(node.style.transform)
    const [x, y] = cssTransformApi.get('translate')
    const translateX = parseFloat(x)
    const translateY = parseFloat(y)
    return {
      node,
      x: translateX,
      y: translateY,
      w: node.clientWidth,
      h: node.clientHeight,
    }
  })
}

function listenMouseDown() {
  if (!groupBox.value) return
  if (!editorStore.allowInGroupMovement) return // 不是组内移动直接忽略
  childrenPosition = loadAllChildrenPosition()
}

function computedOffset(info) {
  const {clientWidth: containerClientWidth, clientHeight: containerClientHeight} = W_Widget.value
  const {clientWidth, clientHeight} = info.node
  let x = 0, y = 0
  if (info.x <= 0) x = info.x
  else if (info.x + clientWidth > containerClientWidth) x = info.x + clientWidth - containerClientWidth
  if (info.y <= 0) y = info.y
  else if (info.y + clientHeight > containerClientHeight) y = info.y + clientHeight - containerClientHeight
  return {
    x,
    y
  }
}

function listenMouseup(ev: MouseEvent) {
  if (!groupBox.value) return
  if (!editorStore.allowInGroupMovement) return // 不是组内移动直接忽略
  const clickEl = getElement4EventTarget(ev)
  const clickWidgetEl = parseWidget4DomChain(clickEl)
  if (!clickWidgetEl) return
  autoSetWGroupSizeAndOffsetPosition()
}

onMounted(async () => {
  if (!W_Widget.value) return
  baseCssAction.connect(W_Widget.value)
  baseCssAction.setState(props.config)
  baseCssAction.patchConfigToElement(props.config)
  W_Widget.value.addEventListener('mousedown', listenMouseDown)
  W_Widget.value.addEventListener('mouseup', listenMouseup)
})
onUnmounted(() => {

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
