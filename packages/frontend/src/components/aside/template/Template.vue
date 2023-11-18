<template>
  <div class="h-[40px] w-full flex justify-start items-center mt-[20px]">
    <a-cascader
      v-model:value="activeNavId"
      placeholder=""
      :options="cascaderOptions"
      @change="(_,opt)=> cascaderCurrentLabelName = opt[opt.length - 1].label"
    >
      <div class="w-full h-full flex justify-start items-center ml-[20px] mr-[20px]">
        <div class="flex justify-around items-center font-bold text-[0.9rem] cursor-pointer">
          <div class="mr-[3px]">{{ cascaderCurrentLabelName }}</div>
          <div class="cur-use-template-dir iconfont icon-jiantouyou"></div>
        </div>
      </div>
    </a-cascader>
  </div>

  <div class="material-container">
    <AllTemplate :id="activeNavId"/>
  </div>
</template>

<script setup lang="ts">
import AllTemplate from './AllTemplate.vue'
import {onMounted, ref, shallowRef} from 'vue'
import {apiGetResource} from "@/api/getResource";
import {getChildrenByDepth} from "@/utils/tool";
import {genCascaderTree} from "@/utils/method";

const props = <any>defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const {config} = props
const PAGE_MATERIAL_TYPE_ID = config.typeId

let allResourceData = []
const allMaterialResourceData = shallowRef([])
const activeNavId = shallowRef<string | number | (string | number)[]>(PAGE_MATERIAL_TYPE_ID)
const cascaderOptions = shallowRef([])
const cascaderCurrentLabelName = ref('所有模板')

onMounted(() => {
  /* 获取所有的列表数据 */
  apiGetResource({
    id: PAGE_MATERIAL_TYPE_ID,
  }).then(res => {
    if (!res.data) return
    allResourceData = res.data?.data?.children
    allMaterialResourceData.value = getChildrenByDepth(allResourceData || [], 1)   // 所有二级页分类
    cascaderOptions.value = genCascaderTree(allResourceData)
    // console.log(allMaterialResourceData.value)
  })
})
</script>

<style scoped lang="scss">
$text-header_height: 60px;
.material-container {
  height: calc(100% - $text-header_height);
  width: 100%;
}

.active-cascader {
  transform: rotate(-90deg);
}

.cur-use-template-dir {
  transform: rotate(90deg);
  transition: all 0.3s;
  font-size: 0.7rem;
  color: grey;
  transform-origin: center center;
  text-align: center;
  width: 18px;
  height: 18px;

  &:hover {
    color: black;
    transform: rotate(-90deg);

  }
}
</style>
