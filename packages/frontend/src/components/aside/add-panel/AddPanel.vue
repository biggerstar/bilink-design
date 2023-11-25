<template>
  <div v-if="curUseLayoutConfig">
    <card :title="cardInfo.name" v-for="(cardInfo,index) in curUseLayoutConfig.layoutInfo" :key="index"
          class="fill-box">
      <div class="add-panel-card fill-box">
        <content-box
          class="add-panel-card-item"
          :class="{
           'selection-border':item.border && curShapeIndex === itemIndex,
          }"
          :style="{
              width: item.width ? `${item.width}px` : '88px',
            }"
          :disabled="!editorStore.getCurrentTemplateLayout()"
          @click="()=> (curShapeIndex = item.border ? itemIndex : -1) && isFunction(callMap[item.call]) && callMap[item.call].call(null) "
          v-for="(item,itemIndex) in cardInfo.items"
          :key="`${itemIndex}item`">
          <a-tooltip placement="top" :mouseEnterDelay="0.5">
            <template #title>
              <span>{{ item.tip || item.text }}</span>
            </template>
            <a-space direction="vertical" class="text-center">
              <div class="iconfont text-[1.15rem]" :class="item.icon"></div>
              <div class="text-[0.8rem]"> {{ item.text }}</div>
            </a-space>
          </a-tooltip>
        </content-box>
      </div>
    </card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {editorStore} from "@/store/editor";
import {isFunction} from "is-what";

const curUseLayoutConfig = ref<Record<any, any>>()
const curShapeIndex = ref()
const callMap = {
  title() {
    editorStore.addMaterialFromId('384297')
  },
  subtitle() {
    editorStore.addMaterialFromId('384297', {
      fontSize: 130,
    })
  },
  text() {
    editorStore.addMaterialFromId('384297', {
      fontSize: 100
    })
  },
  square() {
    // editorStore.drawGraph.draw(() => {
    // })
  },
  triangle() {
    // editorStore.addMaterialFromId('48241575')
  },
  rotundity() {

  },
  straightLine() {

  }
}
// editorStore.drawGraph = new DrawGraph()
onMounted(() => {
  curUseLayoutConfig.value = editorStore.pageConfig.asideTag.find(item => item.name === '添加')
  // console.log(curUseLayoutConfig.value)
})
</script>

<style scoped lang="scss">
.add-panel-card {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  .add-panel-card-item {
    border-radius: 10px;
    cursor: pointer;
    margin: 12px 0;
    justify-content: center;
    padding: 12px;
  }
}

.selection-border {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: -3px;
    top: -3px;
    border: #4D7CFF solid 3px;
    border-radius: 10px;
    transform-origin: center center;
  }
}

</style>
