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
        <div style="display: flex; justify-content: space-around">
          <content-box @click="showSelectFontPage" style="width: 65%; height: 2.5rem">
            <img draggable="false" v-if="curFont" :src="curFont.preview.url" :alt="curFont ?curFont?.name : ''"
                 style="width: 75%; height: 60% "/>
          </content-box>
          <content-box style="width: 25%;height: 2.5rem">
            <a-select
              v-model:value="fontSizeValue"
              size="middle"
              :options="fontSizeRefList"
            ></a-select>
          </content-box>
        </div>
      </card>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/card/Card.vue";
import {nextTick, onMounted, ref, watch} from 'vue'
import ElScrollbar from 'element-plus/es/components/scrollbar/index.mjs'
import 'element-plus/es/components/scrollbar/style/index.mjs'
import {useEditorStore} from "@/store/editor";
import ContentBox from "@/components/content-box/ContentBox.vue";
import {apiGetFontSizeList} from "@/api/getFontSizeList";

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


onMounted(() => {
  nextTick(() => {  // 显示当前字体
    const activeOptions = editorStore.activeOptions
    if (!activeOptions) return
    const font = activeOptions.font
    const fontId = font.id || editorStore.canvas?.font?.id
    if (fontId) curFont.value = editorStore.getFont4Id(fontId)
  })
  apiGetFontSizeList().then(res => {
    const {code, data} = res
    if (code !== 200) return
    const activeOptions = editorStore.activeOptions
    fontSizeValue.value = activeOptions.font.size
    fontSizeRefList.value = data.map(size => ({value: size, label: size}))
  })
})

function choiceFont(item) {
  const activeElement = editorStore.moveableManager.activeElement
  if (!activeElement || !item) return
  curFont.value = item
}

function updateFont() {
  const item = curFont.value
  if (!item) return
  const font = {}
  if (fontSizeValue.value) font.size = Number(fontSizeValue.value)
  if (item.id) font.id = item.id
  editorStore.updateActiveWidgetsState({font}, ['font'])
}

watch([fontSizeValue, curFont], () => {
  updateFont()
}, {
  deep: true
})

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
