<!--
  展示组件，不做任何交互
-->
<template>
  <div
    :data-uuid="uuid"
    data-type="widgets"
    data-name='w-text'
    class="w-text not-user-select"
    ref="WText"
    :class="{
      editing:editing
    }"
    @dblclick="dbClickWText"
    @blur="blurText"
  >
    <div
      class="edit-text-area"
      v-html="textContent"
      spellcheck="false"
    ></div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, shallowRef} from "vue";
import {isObject, isString} from "is-what";
import {DESIGN_OPTIONS, DESIGN_SET_STATE, WIDGETS_NAMES} from "@/constant";
import {editorStore} from "@/store/editor";
import {selectAllText4Element} from "@/utils/method";
import {createBaseCssAction} from "@/components/widgets/base-action";

const WText = shallowRef<HTMLElement>()
const textContent = ref()
const uuid = ref()
const editing = ref(false)
const props = defineProps({
  config: {
    type: Object,
    default: {}
  }
})
let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()
baseCssAction.expand({  // 对传入状态的处理函数
  color: (val) => baseCssAction.updateStyle('color', val || 'transparent'),
  // rotate: (deg) => {
  //   baseCssAction.updateTransform('rotate', `${deg}deg`)
  // },
  location: (loc: string[] | number[] = [0, 0]) => {
    baseCssAction.updateTransform('translate', `${loc[0] || 0}px,${loc[1] || 0}px`)
  },
  fontFamily: (fontName) => editorStore.setFontFamily(<any>WText.value, fontName),
  left(val) {
    console.log(val)
    baseCssAction.updateTransform('translateX', `${val}px`)
  },
  top(val) {
    console.log(val)
    baseCssAction.updateTransform('translateY', `${val}px`)
  },
  fontSize: (size) => editorStore.setFontSize(<any>WText.value, size),
  lineHeight: (val = '1') => baseCssAction.updateStyle("lineHeight", val),
  letterSpacing: (val) => baseCssAction.updateStyle("letterSpacing", `${val}px`),
  content: (text) => textContent.value = text.replace(/\n/g, '<br/>'),
  textAlign: (name: string) => {
    const config = editorStore.getWidgetsDetailConfig(WIDGETS_NAMES.W_TEXT)
    if (!config) return
    const align = config.align || []
    const found = align.find(item => item.value === name)
    if (!found) return
    if (!isObject(found.style)) return
    for (const name in found.style) {
      const value = found.style[name]
      if (value && name) baseCssAction.updateStyle(<any>name, value)
    }
  },
  fontWeight: (val) => baseCssAction.updateStyle('fontWeight', val ? val : 'normal'),
  fontStyle: (val) => baseCssAction.updateStyle('fontStyle', (!val || !isString(val)) ? 'normal' : val),
  writingMode: (val) => baseCssAction.updateStyle('writingMode', !val ? 'horizontal-tb' : val),
  textDecoration: (val) => baseCssAction.updateStyle('textDecoration', !val ? 'none' : val),
})

onMounted(async () => {
  if (!WText.value) return
  baseCssAction.connect(WText.value)
  baseCssAction.setState(props.config)
  WText.value[DESIGN_OPTIONS] = props.config
  WText.value[DESIGN_SET_STATE] = baseCssAction.setState
})

function dbClickWText() {
  const el = <HTMLElement>WText.value
  el.contentEditable = 'plaintext-only'
  el.focus()
  if (!editing.value) selectAllText4Element(el)   // 只有首次双击会全选，后面编辑状态双击根据不同系统自己选择文字
  editing.value = true
}

function blurText() {
  editing.value = false
  WText.value!.contentEditable = String(false)
  window.getSelection().removeAllRanges()
}

</script>

<style scoped>
.w-text {
  position: absolute;
  cursor: move;
  left: 0;
  top: 0;
}

.editing {
  cursor: text;
  user-select: text;
}

.edit-text-area {
  outline: none;
  word-break: break-word;
  margin: 0;
}
</style>
