<template>
  <div v-if="activeNavId" class="images-box page-header mt-3 mb-3">
    <div class="back  flex justify-start items-center cursor-pointer" @click="activeNavId = ''">
      <div class="w-[30px] text-gray-300">&lt;</div>
      <div class="font-bold text-[0.9rem] leading-none pt-1">{{ getNameForMaterialId(activeNavId) }}</div>
    </div>
  </div>
  <div class="images-container h-full w-full">
    <SecondaryImagesDetail v-if="activeNavId" :id="activeNavId"></SecondaryImagesDetail>
    <AllImagesDetail
      :list="allMaterialResourceData"
      @load="showHeaderTagBox = true"
      @change-id="(toItemInfo) => {activeNavId = toItemInfo.id}"
      v-show="!activeNavId && allMaterialResourceData.length"
    ></AllImagesDetail>
  </div>
</template>

<script setup lang="ts">

import {onMounted, shallowRef} from "vue";
import {apiGetResource} from "@/api/getResource";
import {getChildrenByDepth} from "@/utils/tool";

const props = <any>defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const {config} = props
const PAGE_MATERIAL_TYPE = config.type
let allResourceData = []
const allMaterialResourceData = shallowRef([])
const activeNavId = shallowRef<string | number | (string | number)[]>('')
const showHeaderTagBox = shallowRef<boolean>(false)

onMounted(() => {
  apiGetResource({
    type: PAGE_MATERIAL_TYPE
  }).then(res => {
    if (!res.data) return
    allResourceData = res?.data?.children
    allMaterialResourceData.value = getChildrenByDepth(allResourceData || [], 0)   // 所有二级页分类
    // console.log(allMaterialResourceData.value)
  })
})

function getNameForMaterialId(id) {
  const res = (allMaterialResourceData.value || []).find(item => item.id === id)
  return res ? res.name : ''
}

</script>
<style scoped lang="scss">
</style>
