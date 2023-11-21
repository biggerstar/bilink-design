<template>
  <div class="btn-group w-[232px] mt-[40px] mb-[20px] m-auto font-black text-[0.9rem] cursor-pointer not-user-select">
    <WGroupControl/>
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
        <Button class="button-h-40px">水平分布</Button>
      </div>
      <div class="w-[49%] mt-[3px] cursor-pointer text-[0.9rem] font-black">
        <Button class="button-h-40px">垂直分布</Button>
      </div>
    </div>
  </card>
  <hr class="hr-line">

</template>

<script setup lang="ts">

import {editorStore} from "@/store/editor";
import {WIDGETS_NAMES} from "@/constant";
import {onMounted, ref} from "vue";
import WGroupControl from "@/components/widgets/w-group/WGroupControl.vue";

const alignList = ref()
const showMakeGroup = ref<boolean>(true)


onMounted(() => {
  alignList.value = editorStore.pageConfig.widgetsDetail[WIDGETS_NAMES.W_GROUP].align
})
</script>

<style scoped>
.button-h-40px {
  height: 40px;
}
</style>
