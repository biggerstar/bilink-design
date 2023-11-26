<template>
  <div class="detail-main not-user-select">
    <!-- 字体选择二级控件 -->
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
            <span v-if="item.name === curFont?.name">✔</span>
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
          <!-- 文字样式控件 -->
          <content-box class="text-edit-style-setting-item w-full">
            <CheckBox v-if="textStyleList" :data="textStyleList" @changed="textStyleStatusChanged">
            </CheckBox>
          </content-box>
          <!-- 文字排列方向控件 -->
          <content-box class="text-edit-style-setting-item w-full">
            <CheckBox v-if="alignList" type="radio" :data="alignList" @changed="alignStatusChanged">
            </CheckBox>
          </content-box>
          <!-- 行距 字距 调整控件 -->
          <content-box v-if="spaceInfoList" class="w-full">
            <SliderNumber
              class="w-full ml-2 mr-2"
              v-for="item in curSpaceInfo"
              :max="item.max"
              :min="item.min"
              :step="item.step"
              v-model:value="item.value"
              @change="spaceInfoChanged(item)"
            >
              <template #icon>
                <a-tooltip :title="item.tip">
                  <div class="iconfont font-bold text-[1rem]" :class="item.icon"></div>
                </a-tooltip>
              </template>
            </SliderNumber>
          </content-box>
        </div>
      </card>
      <hr class="hr-line">
      <card title="特效">
        <div v-if="predefineColorList" class="flex justify-between">
          <span class="text-[0.9rem]">颜色</span>
          <el-color-picker v-model="textColor" @change="textColorChanged" show-alpha :predefine="predefineColorList"/>
        </div>
      </card>
      <hr class="hr-line">
      <card title="基础">
        <SliderNumber
          v-if="isNumber(widgetOpacity)"
          class="w-full"
          :max="100"
          :min="0"
          :step="1"
          v-model:value="widgetOpacity"
          @change="opacityChanged"
        >
          <template #icon>
            <span class="text-[0.9rem] w-1/3 min-w-[60px]"> 不透明度</span>
          </template>
        </SliderNumber>
      </card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "@/components/card/Card.vue";
import {onMounted, ref, toRaw, watch} from 'vue'
import ElScrollbar from 'element-plus/es/components/scrollbar/index.mjs'
import 'element-plus/es/components/scrollbar/style/index.mjs'
import {editorStore} from "@/store/editor";
import ContentBox from "@/components/content-box/ContentBox.vue";
import CheckBox from "@/components/checkbox/CheckBox.vue";
import {WIDGETS_NAMES} from "@/constant";
import SliderNumber from "@/components/slider-number/SliderNumber.vue";
import {isNumber} from "is-what";
import type {LayoutWidget} from "@type/layout";

const isShowFontsPage = ref(false)
const isShowMainDetailPage = ref(true)
const fontSizeValue = ref();
const fontSizeRefList = ref()
const allFonts = ref()
const curFont = ref()
const alignList = ref()
const textStyleList = ref()
const spaceInfoList = ref()
const curSpaceInfo = ref()
const textColor = ref()
const widgetOpacity = ref()
const predefineColorList = ref([])

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

/** 设置文字样式控件的冲突按钮,会自动处理冲突活跃显示与失活 */
function activeStyleItems(curItem) {
  const conflictItem = getConflictItems(curItem)
  conflictItem.forEach(item => item.selected = false)
}

/**
 * 文字样式控件点击后状态改变
 * */
function textStyleStatusChanged(curItem) {
  let style = {}
  const curStatus = curItem.selected
  if (!curStatus) Object.keys(curItem.style).forEach(name => style[name] = false)
  else {
    style = curItem.style
    activeStyleItems(curItem)
  }
  editorStore.updateActiveWidgetsState(style, {effectDom: true})
}

/**
 * 文字排序控件点击后状态改变
 * */
function alignStatusChanged(item) {
  editorStore.updateActiveWidgetsState({textAlign: item.value}, {effectDom: true})
}

/**
 * 判断当前样式设置控件选择情况
 * */
function updateTextStyle(textStyle: any[]) {
  const currentOptions = editorStore.getCurrentOptions()
  if (!currentOptions) return
  textStyle.forEach(item => {
    const isActive = item.style[item.key] === currentOptions[item.key]
    if (isActive) activeStyleItems(item)
    item.selected = isActive
  })
}

const spaceInfoChanged = (item) => editorStore.updateActiveWidgetsState({[item.key]: item.value}, {effectDom: true})
const textColorChanged = (val) => editorStore.updateActiveWidgetsState({color: val}, {effectDom: true})
const opacityChanged = (val) => editorStore.updateActiveWidgetsState({opacity: val / 100}, {effectDom: true})


/** 二级页面选择字体后执行 */
function choiceFont(item) {
  const currentWidget = editorStore.moveableManager.currentWidget
  if (!currentWidget || !item) return
  curFont.value = item
}

/** 更新与加载远程字体 */
function updateFont() {
  const font: Partial<LayoutWidget> = {}
  if (fontSizeValue.value) font.fontSize = Number(fontSizeValue.value)
  if (curFont.value?.id) font.fontFamily = curFont.value.name
  editorStore.updateActiveWidgetsState(font, {effectDom: true})
}

onMounted(() => {
  const currentOptions = toRaw(editorStore.getCurrentOptions() || {})
  const detailConfig = editorStore.getWidgetsDetailConfig(WIDGETS_NAMES.W_TEXT)
  const {align, textStyle, spaceInfo, fontsSizeList} = detailConfig
  curFont.value = editorStore.getFont4FontName(currentOptions.fontFamily)
  predefineColorList.value = editorStore.pageConfig.predefineColors
  textColor.value = currentOptions.color
  widgetOpacity.value = isNumber(currentOptions.opacity) ? currentOptions.opacity * 100 : 100
  alignList.value = align
  alignList.value.forEach(item => item.selected = item.value === currentOptions.textAlign)
  textStyleList.value = textStyle
  spaceInfoList.value = spaceInfo
  fontSizeRefList.value = (fontsSizeList || []).map(size => ({value: size, label: size}))
  fontSizeValue.value = currentOptions?.fontSize || ''
  curSpaceInfo.value = spaceInfo.map(item => {
    const originSpaceVal = currentOptions[item.key || item.key]
    return {
      ...item,
      value: originSpaceVal === void 0 ? item.value : originSpaceVal
    }
  })

  updateTextStyle(textStyle)
  // nextTick(() => {  // 显示当前字体
  //   if (!currentOptions) return
  // })
})

watch([curFont, fontSizeValue], () => updateFont(), {deep: true})

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
