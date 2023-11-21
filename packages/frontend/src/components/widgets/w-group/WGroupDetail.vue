<template>
  <div class="btn-group w-[232px] mt-[40px] mb-[20px] m-auto font-black text-[0.9rem] cursor-pointer not-user-select">
    <div v-if="!showMakeGroup">
      <content-box class="mt-[5px] mb-[5px]" @click="makeGroup(false)">
        <span class="flex-center button-h-40px">拆分组</span>
      </content-box>
      <content-box class="mt-[5px] mb-[5px]" @click="editorStore.allowInGroupMovement = true">
        <span class="flex-center button-h-40px">组内移动</span>
      </content-box>
    </div>
    <div v-else>
      <content-box class="mt-[5px] mb-[5px]" @click="makeGroup(true)">
        <span class="flex-center button-h-40px">成组</span>
      </content-box>
    </div>
  </div>
  <hr class="hr-line">
  <card title="对齐" font-size="0.9rem">
    <content-box class=" flex justify-center items-center">
      <div
        class="button-h-40px flex-1"
        v-for="(item,index) in alignList"
        :key="`${index}${item.tip}`"
      >
        <div class="iconfont fill-box text-[1.2rem] leading-[40px] cursor-pointer" :class="item.icon"></div>
      </div>
    </content-box>
    <div class="w-full flex justify-between">
      <div class="w-[49%] mt-[3px] cursor-pointer text-[0.9rem] font-black">
        <content-box class="button-h-40px">水平分布</content-box>
      </div>
      <div class="w-[49%] mt-[3px] cursor-pointer text-[0.9rem] font-black">
        <content-box class="button-h-40px">垂直分布</content-box>
      </div>
    </div>
  </card>
  <hr class="hr-line">

</template>

<script setup lang="ts">

import {editorStore} from "@/store/editor";
import {DESIGN_OPTIONS, WIDGETS_NAMES} from "@/constant";
import {onMounted, ref} from "vue";
import {v4 as uuid4} from 'uuid';

const alignList = ref()
const showMakeGroup = ref<boolean>(true)

function makeGroup(isMake: boolean) {
  // console.log(editorStore.selectoManager.selected);
  if (isMake) {
    const childrenOptions = editorStore.selectoManager.selected.map(node => node[DESIGN_OPTIONS])
    // childrenOptions.forEach(item=>{
    //   console.log(item.elements)
    // })

    const newWidget = {
      uuid: uuid4(),
      type: 'group',
      elements: childrenOptions
    }
    editorStore.addNewWidget(<any>newWidget)
  }
  showMakeGroup.value = !isMake

}

onMounted(() => {
  alignList.value = editorStore.pageConfig.widgetsDetail[WIDGETS_NAMES.W_GROUP].align
})
</script>

<style scoped>
.button-h-40px {
  height: 40px;
}
</style>
