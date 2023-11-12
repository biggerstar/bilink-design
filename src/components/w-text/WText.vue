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
import {useEditorStore} from "@/store/editor";
import {createHandlerAction, createSetWidgetsStyle, CssTransformApi, selectAllText4Element} from "@/utils/method";
import {globalStore} from "@/store/global";

const WText = shallowRef<HTMLElement>()
const textContent = ref()
const uuid = ref()
const editorStore = useEditorStore()
const editing = ref(false)

const props = defineProps({
  config: {
    type: Object,
    default: {}
  }
})

const setWidgetsStyle: (name: keyof CSSStyleDeclaration, val: string) => void = createSetWidgetsStyle(() => WText.value)

/** 生成或者修改 当前元素transform 指定函数值，不会影响到字符中其他函数，返回一条修改后的字符串 */
function genTransform(name: string, val: string) {
  const cssTransformApi = new CssTransformApi()
  cssTransformApi.load(WText.value!.style.transform).change(name, val)
  return cssTransformApi.transform
}

const actionMap = {  // 对传入状态的处理函数
  width: (val) => setWidgetsStyle("width", val ? `${val}px` : 'auto'),
  height: (val) => setWidgetsStyle("height", val ? `${val}px` : 'auto'),
  bgColor: (val) => setWidgetsStyle('backgroundColor', val || 'transparent'),
  left: (val) => setWidgetsStyle("left", val ? `${val}px` : '0'),
  top: (val) => setWidgetsStyle("top", val ? `${val}px` : '0'),
  rotate: (deg) => {
    const transform = genTransform('rotate', `${deg}deg`)
    transform && setWidgetsStyle("transform", transform)
  },
  translate: (val: string) => {
    const translatePxStr = val.split(',').map(offset => `${offset}px`).toString()
    const transform = genTransform('translate', `${translatePxStr}`)
    transform && setWidgetsStyle("transform", transform)
  },
  scale: (val: string) => {
    const transform = genTransform('scale', `${val}`)
    transform && setWidgetsStyle("transform", transform)
  },
  opacity: (val) => setWidgetsStyle("opacity", `${val}`),
  fontId: (fontId) => editorStore.setFontFamily(<any>WText.value, fontId),
  fontSize: (size) => editorStore.setFontSize(<any>WText.value, size),
  uuid: (val) => uuid.value = val,
  text: (text) => textContent.value = text.replace(/\n/g, '<br/>'),
  textAlign: (name: string) => {
    const config = editorStore.getWidgetsDetailConfig(WIDGETS_NAMES.W_TEXT)
    if (!config) return
    const align = config.align || []
    const found = align.find(item => item.name === name)
    if (!found) return
    if (!isObject(found.style)) return
    for (const name in found.style) {
      const value = found.style[name]
      if (value && name) setWidgetsStyle(<any>name, value)
    }
  },
  fontWeight: (val) => setWidgetsStyle('fontWeight', val ? val : 'normal'),
  fontStyle: (val) => setWidgetsStyle('fontStyle', (!val || !isString(val)) ? 'normal' : val),
  writingMode: (val) => setWidgetsStyle('writingMode', !val ? 'horizontal-tb' : val),
  textDecoration: (val) => setWidgetsStyle('textDecoration', !val ? 'none' : val),
}

const setState: Function = createHandlerAction(actionMap, () => {
  globalStore.moveableManager.moveable.updateRect()
})

onMounted(async () => {
  if (!WText.value) return
  setState(props.config)
  WText.value[DESIGN_OPTIONS] = props.config
  WText.value[DESIGN_SET_STATE] = setState
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
