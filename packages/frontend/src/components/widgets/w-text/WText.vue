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
    @keydown="listenKeydown"
    @blur="blurText"
    @dblclick="dbClickW_Widget"
  >
    <!--    <canvas ref="canvasRef"></canvas>-->
    <a-spin :spinning="showSpin" size="large" class="fill-box">
      <div v-if="textContents" style="text-align: start; " ref="contentsRef">
        <span
          data-content-type="contents"
          v-for="(item,index) in textContents"
          :key="index"
          @blur="blurText($event)"
          class="edit-widget-area"
          v-html="item.content"
          spellcheck="false"
          :style="{
            color:item.color,
            fontFamily:item.fontFamily,
            fontSize:`${item.fontSize}px`,
            fontStyle:item.fontStyle,
            fontWeight:item.fontWeight,
            textDecoration:item.textDecoration,
          }"
        > </span>
      </div>
      <div
        v-else
        ref="textRef"
        data-content-type="content"
        spellcheck="false">
        <div class="edit-widget-area" v-html="textContent"></div>
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
import {createBaseCssAction} from "@/components/widgets/base-action";

const W_Widget = shallowRef<HTMLElement>()
const textRef = shallowRef<HTMLElement>()
const contentsRef = shallowRef<HTMLElement>()
const textContent = ref()
const textContents = ref()
const editing = ref(false)
const showSpin = ref(true)
const props = defineProps({
  config: {
    type: Object,
    default: {}
  }
})

function filterText(text: string) {
  return text.replaceAll('\n', '<br/>').replaceAll('\r', '<br/>')
}

let baseCssAction: ReturnType<typeof createBaseCssAction> = createBaseCssAction()
baseCssAction.expand({  // 对传入状态的处理函数
  height: () => null,   // 高度自动设置
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
  content: (text) => textContent.value = filterText(text),
  contents: (textList: any[]) => textList && (textContents.value = textList.map(item => {
    return {
      ...item,
      content: filterText(item.content)
    }
  })),
  textAlign: (name: string) => {
    // console.log(name);
    const config = editorStore.getWidgetsDetailConfig(WIDGETS_NAMES.W_TEXT)
    if (!config) return
    const align = config.align || []
    const found = align.find(item => item.value === name)
    if (!found) return
    if (!isObject(found.style)) return
    // console.log(found.style)
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
  setTimeout(() => {
    if (contentsRef.value) {
      textRef.value = contentsRef.value
      baseCssAction.setState(props.config)
    }
  })
})

let inputContentTemp = ''  // 文字输入临时

async function listenKeydown() {
  // console.log(item)
  setTimeout(() => {
    // 必须等待延时等到dom更新拿到最新的文本值
    inputContentTemp = filterText(textRef.value.innerText)
    // .replaceAll(' ', '</br>')
    // console.log(textRef.value.innerText)
    editorStore.updateActiveWidgetsState({content: textRef.value.innerText.replaceAll('\n\n', '\n')})
  })
}

function dbClickW_Widget() {
  editing.value = true
}

function blurText(_: MouseEvent) {
  if (inputContentTemp) inputContentTemp = ''
  editing.value = false
}


</script>

<style scoped lang="scss">
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

  div, span {
    word-break: break-word;
    white-space: nowrap;
    //text-align: inherit;
  }
}

.editing {
  cursor: text !important;
  user-select: text;
}
</style>
