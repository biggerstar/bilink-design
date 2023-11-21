<!--
  展示组件，不做任何交互
-->
<template>
  <div
    :data-uuid="props.config['uuid']"
    data-widget-type="widget"
    data-widget-name='w-text'
    class="w-widget w-position not-user-select w-auto h-auto"
    ref="W_Widget"
    :class="{
      editing:editing
    }"
    @dblclick="dbClickW_Widget"
    @blur="blurText"
  >
    <!--    <canvas ref="canvasRef"></canvas>-->
    <a-spin :spinning="showSpin">
      <div class="edit-widget-area" ref="textRef" v-html="textContent" spellcheck="false">
      </div>
    </a-spin>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, shallowRef} from "vue";
import {isObject, isString} from "is-what";
import {WIDGETS_NAMES} from "@/constant";
import {editorStore} from "@/store/editor";
import {selectAllText4Element} from "@/utils/method";
import {createBaseCssAction} from "@/components/widgets/base-action";

const W_Widget = shallowRef<HTMLElement>()
const textRef = shallowRef<HTMLElement>()
const textContent = ref()
const editing = ref(false)
const showSpin = ref(true)
const props = defineProps({
  config: {
    type: Object,
    default: {}
  }
})
let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()
baseCssAction.expand({  // 对传入状态的处理函数
  color: (val) => baseCssAction.updateStyle('color', val || 'transparent', textRef.value),
  // rotate: (deg) => {
  //   baseCssAction.updateTransform('rotate', `${deg}deg`)
  // },
  fontFamily: (fontName) => editorStore.setFontFamily(fontName, <any>textRef.value).finally(() => showSpin.value = false),
  fontSize: (size) => editorStore.setFontSize(<any>textRef.value, size),
  lineHeight: (val = '1') => {
    baseCssAction.updateStyle("lineHeight", val, textRef.value)
    baseCssAction.updateBoxSize()
  },
  letterSpacing: (val) => {
    baseCssAction.updateStyle("letterSpacing", `${val}px`, textRef.value)
    baseCssAction.updateBoxSize()
  },
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
      if (value && name) baseCssAction.updateStyle(<any>name, value, textRef.value)
    }
  },
  fontWeight: (val) => baseCssAction.updateStyle('fontWeight', val ? val : 'normal', textRef.value),
  fontStyle: (val) => baseCssAction.updateStyle('fontStyle', (!val || !isString(val)) ? 'normal' : val, textRef.value),
  writingMode: (val) => baseCssAction.updateStyle('writingMode', !val ? 'horizontal-tb' : val, textRef.value),
  textDecoration: (val) => baseCssAction.updateStyle('textDecoration', !val ? 'none' : val, textRef.value),
  imageUrl: (val) => baseCssAction.updateStyle('backgroundImage', `url(${val})`, textRef.value),
})

onMounted(async () => {
  if (!W_Widget.value) return
  baseCssAction.connect(W_Widget.value)
  baseCssAction.setState(props.config)
  baseCssAction.patchConfigToElement(props.config)
})

function dbClickW_Widget() {
  const el = <HTMLElement>W_Widget.value
  el.contentEditable = 'plaintext-only'
  el.focus()
  if (!editing.value) selectAllText4Element(el)   // 只有首次双击会全选，后面编辑状态双击根据不同系统自己选择文字
  editing.value = true
}

function blurText() {
  editing.value = false
  W_Widget.value!.contentEditable = String(false)
  window.getSelection().removeAllRanges()
}

</script>

<style scoped>
.w-position {
  position: absolute;
  cursor: move;
  left: 0;
  top: 0;
}

.w-widget {
  background-size: cover;
  background-repeat: no-repeat;
}

.edit-widget-area {
  outline: none;
  word-break: break-word;
  white-space: nowrap;
  margin: 0;
  padding: 0;
}

.editing {
  cursor: text;
  user-select: text;
}
</style>
