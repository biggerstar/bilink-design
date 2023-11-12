<template>
  <div class="detail-main not-user-select">
    <div v-if="isShowFontsPage" class="select-font-page">
      <a-page-header
        class="a-page-header"
        style="border: 1px solid rgb(235, 237, 240); "
        title="字体"
        @back="closeSelectFontPage"
      />
      <card title="当前字体">
        <el-scrollbar height="90vh">
          <div
            class="font-item"
            v-if="allFonts"
            v-for="(item,index) in allFonts"
            :key="index"
            @click="choiceFont(item)"
            :class="{'font-item-active':item.name === curFont?.name}"
          >
            <span v-if="item.name === curFont?.name">☑️</span>
            <img draggable="false" :src="item.preview.url" :alt="item.name" style="width: 75%;height:1.5rem; "/>
          </div>
        </el-scrollbar>
      </card>
    </div>

    <div v-if="isShowMainDetailPage">
      <card title="文字">
        <div class="text-edit-style-setting">
          <content-box class="text-edit-style-setting-item" @click="showSelectFontPage" style="width: 65%;">
            <img draggable="false" v-if="curFont" :src="curFont.preview.url" :alt="curFont ?curFont?.name : ''"
                 style="width: 75%; height: 60% "/>
            <span v-else>默认字体</span>
          </content-box>
          <content-box class="text-edit-style-setting-item" style="width: 30%;">
            <a-select
              v-model:value="fontSizeValue"
              size="middle"
              :options="fontSizeRefList"
            ></a-select>
          </content-box>
          <content-box class="text-edit-style-setting-item" style="width: 100%;">
            <CheckBox v-if="textStyleList" :data="textStyleList" @changed="textStyleStatusChanged">
            </CheckBox>
          </content-box>
          <content-box class="text-edit-style-setting-item" style="width: 100%;">
            <CheckBox v-if="alignList" type="radio" :data="alignList" @changed="alignStatusChanged">
            </CheckBox>
          </content-box>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/card/Card.vue";
import {nextTick, onMounted, ref, watch} from 'vue'
import ElScrollbar from 'element-plus/es/components/scrollbar/index.mjs'
import 'element-plus/es/components/scrollbar/style/index.mjs'
import {useEditorStore} from "@/store/editor";
import ContentBox from "@/components/content-box/ContentBox.vue";
import {apiGetFontSizeList} from "@/api/getFontSizeList";
import CheckBox from "@/components/checkbox/CheckBox.vue";
import {WIDGETS_NAMES} from "@/constant";
import {globalStore} from "@/store/global";

const editorStore = useEditorStore()
const isShowFontsPage = ref(false)
const isShowMainDetailPage = ref(true)
const fontSizeValue = ref();
const fontSizeRefList = ref()
const allFonts = ref()
const curFont = ref()

function showSelectFontPage() {
  isShowMainDetailPage.value = false
  isShowFontsPage.value = true
  allFonts.value = editorStore.allFont
}

function closeSelectFontPage() {
  isShowMainDetailPage.value = true
  isShowFontsPage.value = false
}

function getConflictItems(curItem) {
  return /* key冲突的item */ textStyleList.value.filter(item => item.key === curItem.key && item !== curItem)
}

/** 设置冲突的样式控制按钮,会自动处理冲突 */
function activeStyleItems(curItem) {
  const conflictItem = getConflictItems(curItem)
  conflictItem.forEach(item => item.selected = false)
}

function textStyleStatusChanged(curItem) {
  let style = {}
  const curStatus = curItem.selected
  if (!curStatus) Object.keys(curItem.style).forEach(name => style[name] = false)
  else {
    style = curItem.style
    activeStyleItems(curItem)
  }
  // console.log(curStatus, style)
  editorStore.updateActiveWidgetsState(style)
}

function alignStatusChanged(item) {
  editorStore.updateActiveWidgetsState({
    textAlign: item.name
  })
}

function updateTextStyle(textStyle: any[]) {
  const currentOptions = editorStore.getCurrentOptions()
  if (!currentOptions) return
  textStyle.forEach(item => {
    const isActive = item.style[item.key] === currentOptions[item.key]
    if (isActive) activeStyleItems(item)
    item.selected = isActive
  })
}

onMounted(() => {
  const currentOptions = editorStore.getCurrentOptions()
  nextTick(() => {  // 显示当前字体
    if (!currentOptions) return
    const fontId = currentOptions.fontId || editorStore.currentProject?.canvas?.fontId
    if (fontId) curFont.value = editorStore.getFont4Id(fontId)
  })
  apiGetFontSizeList().then(res => {
    const {code, data} = res
    if (code !== 200) return
    fontSizeValue.value = currentOptions?.fontSize || ''
    fontSizeRefList.value = data.map(size => ({value: size, label: size}))
  })
})

function choiceFont(item) {
  const currentWidget = globalStore.moveableManager.currentWidget
  if (!currentWidget || !item) return
  curFont.value = item
}

function updateFont({sizeChanged} = {}) {
  // console.log(sizeChanged)
  // if (sizeChanged) editorStore.updateActiveWidgetsState({style: {transformOrigin: 'left top'}}, {safe: true})
  const font: Record<any, any> = {}
  if (fontSizeValue.value) font.fontSize = Number(fontSizeValue.value)
  if (curFont.value?.id) font.fontId = curFont.value.id
  editorStore.updateActiveWidgetsState(font)
  // if (sizeChanged) editorStore.updateActiveWidgetsState({style: {transformOrigin: 'center center'}}, {safe: true})
}


const alignList = ref()
const textStyleList = ref()
onMounted(() => {
  const detailConfig = editorStore.getWidgetsDetailConfig(WIDGETS_NAMES.W_TEXT)
  alignList.value = detailConfig.align
  textStyleList.value = detailConfig.textStyle
  const currentOptions = editorStore.getCurrentOptions()
  alignList.value && alignList.value.forEach(item => item.selected = item.name === currentOptions.textAlign)
  updateTextStyle(detailConfig.textStyle)
})

watch([fontSizeValue], () => updateFont({sizeChanged: true}), {deep: true})
watch([curFont], () => updateFont(), {deep: true})

</script>

<style scoped lang="scss">
.detail-main {
  height: 100%;
  width: 100%;
  position: relative;
}

.select-font-page {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.font-item {
  display: flex;
  width: 96%;
  height: 2.5rem;
  margin: auto;
  justify-content: space-evenly;
  align-items: center;

  span {
    font-size: 1.1rem;
  }
}

.font-item:hover {
  background-color: #E8EAEC;
  border-radius: 5px;
  cursor: pointer;
}

.font-item-active {
  background-color: #F0F6FF;
  border-radius: 5px;
}

.text-edit-style-setting {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.text-edit-style-setting-item {
  height: 2.5rem;
  margin: 1% 0;
}

:deep(.ant-page-header-heading-title) {
  font-size: 1rem !important;
}

:deep(.ant-page-header) {
  padding: 3px 20px;
}

:deep(.ant-select-selector) {
  background-color: transparent !important;
  border: none !important;
  border-color: transparent;
  font-size: 1rem;
}

</style>
