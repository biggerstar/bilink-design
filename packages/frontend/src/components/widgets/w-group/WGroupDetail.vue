<template>
  <hr class="hr-line">
  <card title="对齐" font-size="0.9rem">
    <content-box class="text-edit-style-setting-item w-full button-h-40px flex-1">
      <CheckBox v-if="alignList" type="radio" :data="alignList" @changed="alignStatusChanged">
      </CheckBox>
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

function alignStatusChanged() {
  // TODO
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
