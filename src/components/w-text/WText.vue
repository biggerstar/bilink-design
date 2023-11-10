<!--
  展示组件，不做任何交互
-->
<template>
  <div
    :data-uuid="config.uuid"
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
import {computed, onMounted, ref, shallowRef} from "vue";
import {isFunction, isObject} from "is-what";
import {DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";
import {useEditorStore} from "@/store/editor";
import {createSetWidgetsStyle, selectAllText4Element} from "@/utils/method";

const props = defineProps({
  config: {
    type: Object,
    required: false,
    default: {}
  }
})
const WText = shallowRef<HTMLElement>()
const config: any = props.config
const textContent = computed(() => config.text.replace(/\n/g, '<br/>'))
const editorStore = useEditorStore()
const editing = ref(false)

function init() {
  setState(config)
  if (WText.value) WText.value.contentEditable = 'plaintext-only'
}

const setWidgetsStyle = createSetWidgetsStyle(() => WText.value)

const actionMap = {
  width: (val) => setWidgetsStyle("width", val ? `${val}px` : 'auto'),
  height: (val) => setWidgetsStyle("height", val ? `${val}px` : 'auto'),
  bgColor: (val) => setWidgetsStyle('backgroundColor', val || 'transparent'),
  left: (val) => setWidgetsStyle("left", `${val}px`),
  top: (val) => setWidgetsStyle("top", `${val}px`),
  rotate: (val) => setWidgetsStyle("transform", `rotate(${val}deg)`),
  font: (font) => {
    if (!isObject(font) || !WText.value) return
    editorStore.setFont(WText.value, font)
  }
}

function setState(options: Record<any, any>) {
  for (const name in options) {
    const func = actionMap[name]
    if (isFunction(func)) func.call(null, options[name])
  }
}

function dbClickWText() {
  const el = WText.value
  if (el) {
    editing.value = true
    el.focus()
    if (!editing.value) selectAllText4Element(el)   // 只有首次双击会全选，后面编辑状态双击根据不同系统自己选择文字
  }
}

function blurText() {
  editing.value = false
}

onMounted(async () => {
  init()
  if (!WText.value) return
  WText.value[DESIGN_OPTIONS] = config
  WText.value[DESIGN_SET_STATE] = setState
})

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
