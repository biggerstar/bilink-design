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
          <div class="font-item" v-for="(item,index) in fonts" :key="index" @click="choiceFont(item)">
            <img :src="item.preview.url" :alt="item.name" style="width: 75%;height:1.5rem; margin-top: 8px"/>
          </div>
        </el-scrollbar>
      </card>
    </div>
    <div v-if="isShowMainDetailPage">
      <card title="文字">
        <a-button @click="showSelectFontPage"></a-button>
        console.log(222222222222222222)
      </card>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/card/Card.vue";
import fonts from "@/mock/fonts";
import {ref} from 'vue'
import ElScrollbar from 'element-plus/es/components/scrollbar/index.mjs'
import 'element-plus/es/components/scrollbar/style/index.mjs'
import {useEditorStore} from "@/store/editor";

const isShowFontsPage = ref(false)
const isShowMainDetailPage = ref(true)
const editorStore = useEditorStore()

function showSelectFontPage() {
  isShowMainDetailPage.value = false
  isShowFontsPage.value = true
}

function closeSelectFontPage() {
  isShowMainDetailPage.value = true
  isShowFontsPage.value = false
}

function choiceFont(item) {
  if (!document.fonts) return console.error('抱歉，浏览器不支持 document.font 修改字体');
  const {content} = item
  const font = new FontFace(content.family, `url(${content.woff})`);
  document.fonts.add(font);
  font.load();
  font.loaded.then(() => {
    const activeElement = editorStore.moveableManager.activeElement
    if (activeElement) activeElement.style.fontFamily = content.family;
  }).catch(err => {
    console.log(err);
  });

}


</script>

<style scoped>
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
  width: 96%;
  margin: auto;
}

.font-item:hover {
  background-color: #E8EAEC;
  border-radius: 5px;
}

:deep(.ant-page-header-heading-title) {
  font-size: 1rem !important;
}

:deep(.ant-page-header) {
  padding: 3px 20px;
}
</style>
