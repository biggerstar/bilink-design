<template>
  <div class="text-box" v-if="showHeaderTagBox">
    <div class="add-text-btn">
      <div class="w-[280px] h-[40px] m-auto mt-[10px] mb-[10px] text-[0.9rem] font-bold cursor-pointer">
        <content-box class="w-full h-full">
          <div>添加文字</div>
        </content-box>
      </div>
    </div>
  </div>
  <div v-if="activeNavId" class="page-header mt-3 mb-4">
    <div class="back  flex justify-start items-center cursor-pointer" @click="activeNavId = ''">
      <div class="w-[30px] text-gray-300">&lt;</div>
      <div class="font-bold text-[0.9rem] leading-none pt-1">{{ getNameForMaterialId(activeNavId) }}</div>
    </div>
  </div>
  <div class="text-container">
    <SecondaryTextDetail v-if="activeNavId" :id="activeNavId"></SecondaryTextDetail>
    <AllTextDetail
      :list="allMaterialResourceData"
      @load="showHeaderTagBox = true"
      @change-id="(toItemInfo) => {activeNavId = toItemInfo.id}"
      v-show="!activeNavId && allMaterialResourceData.length"
    ></AllTextDetail>
  </div>
</template>

<script setup lang="ts">

import {apiGetResource} from "@/api/getResource";
import {onMounted, shallowRef} from "vue";
import {getChildrenByDepth} from "@/utils/tool";
import AllTextDetail from "@/components/aside/text/AllTextDetail.vue";

const props = <any>defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const {config} = props
const PAGE_MATERIAL_ID = config.materialId    // 素材类别的根ID
const PAGE_MATERIAL_TYPE = config.materialType
let allResourceData = []
const allMaterialResourceData = shallowRef([])
const activeNavId = shallowRef<string | number | (string | number)[]>('')
const showHeaderTagBox = shallowRef<boolean>(false)

// activeNavId.value = 4828209


onMounted(() => {
  /* 获取所有的列表数据 */
  apiGetResource({
    id: PAGE_MATERIAL_ID,
    type: PAGE_MATERIAL_TYPE
  }).then(res => {
    if (!res.data) return
    allResourceData = res.data?.data?.children
    allMaterialResourceData.value = getChildrenByDepth(allResourceData || [], 1)   // 所有二级页分类
    // console.log(allMaterialResourceData.value)
  })
})

function getNameForMaterialId(id) {
  const res = (allMaterialResourceData.value || []).find(item => item.id === id)
  return res ? res.name : ''
}

</script>

<style scoped lang="scss">
$text-header_height: 60px;
.text-box {
  height: $text-header_height;
  width: 100%;
}

.text-container {
  height: calc(100% - $text-header_height);
  width: 100%;
}

</style>
