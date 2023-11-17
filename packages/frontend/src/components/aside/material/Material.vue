<template>
  <!--  素材类型导航页  -->
  <div class="material-box">
    <div class="header-box p-[6px]" v-if="showHeaderTagBox">
      <div class="w-full flex justify-start flex-wrap mt-4 pl-[10px] pr-[10px]">
        <div
          class="m-[2px]"
          v-for="(item ,index) in navigationInfo" :key="`${item.text}${index}`"
        >
          <el-button
            v-if="item.type === 'button'"
            @mousedown="($event) => $event.preventDefault()"
            @click="()=> {activeNavId !== item.id && (activeNavId = item.id); cascaderCurrentLabelName ='更多'}"
            class="w-[54px]" :color="activeNavId === item.id ? '#2154F4' : '#F1F2F4'">
            {{ item.text }}
          </el-button>
          <div v-if="item.type === 'cascader'">
            <el-button
              @mousedown="($event) => $event.preventDefault()"
              @click="showMoreCascader = true"
              class="cascader relative overflow-hidden"
              :color=" !navigationInfo.find(val=> activeNavId === val.id.toString()) ? '#2154F4' : '#F1F2F4'">
              <div class="cascader-text"> {{ cascaderCurrentLabelName }}</div>
              <div class="w-full h-full overflow-hidden absolute left-0 top-0 opacity-0">
                <a-cascader
                  @change="(_,opt)=> cascaderCurrentLabelName = opt[opt.length - 1].label"
                  v-model:value="cascaderValueList"
                  :options="cascaderOptions"
                  placeholder="">
                </a-cascader>
              </div>
            </el-button>

          </div>
        </div>
      </div>
    </div>

    <div class="material-container">
      <SecondaryMaterialDetail v-if="activeNavId" :id="activeNavId"></SecondaryMaterialDetail>
      <AllMaterialDetail
        :list="allMaterialResourceData"
        @load="showHeaderTagBox = true"
        @change-id="(toItemInfo) => {activeNavId = toItemInfo.id ;cascaderCurrentLabelName = toItemInfo.name}"
        v-show="!activeNavId && allMaterialResourceData.length"/>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 实现了只要改变 activeNavId 就能自动跳转到不同场景下的对应页面，所有操作只需要改变 activeNavId 就行
 * */
import {onMounted, ref, shallowRef, watch} from "vue";
import AllMaterialDetail from "@/components/aside/material/AllMaterialDetail.vue";
import SecondaryMaterialDetail from "@/components/aside/material/SecondaryMaterialDetail.vue";
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
const PAGE_MATERIAL_ID = config.materialId    // 素材类别的根ID
const PAGE_MATERIAL_TYPE = config.materialType

/*--------------------------------------------------------*/
let allResourceData = []
const showMoreCascader = shallowRef<boolean>(false)
const showHeaderTagBox = shallowRef<boolean>(false)
const activeNavId = shallowRef<string | number | (string | number)[]>('')
const allMaterialResourceData = shallowRef([])
const cascaderOptions = shallowRef([])
const cascaderValueList = ref()
const cascaderCurrentLabelName = ref('更多')

watch(cascaderValueList, () => {   // 当级联选择器改变，则改变当前的活跃类型id
  const list = cascaderValueList.value
  if (!Array.isArray(list)) return
  if (list.length) activeNavId.value = list[list.length - 1]
  // console.log(activeNavId.value)
})

/** 显示默认使用的 id 数据 */
const navigationInfo = config.navigationInfo

onMounted(() => {
  /* 获取所有的列表数据 */
  apiGetResource({
    id: PAGE_MATERIAL_ID,
    type: PAGE_MATERIAL_TYPE
  }).then(res => {
    if (!res.data) return
    allResourceData = res.data?.data?.children
    allMaterialResourceData.value = getChildrenByDepth(allResourceData || [], 1)   // 所有二级页分类
    cascaderOptions.value = genCascaderTree(allResourceData)
  })
})


</script>
<style scoped lang="scss">
.material-box {
  --header_height: 100px;
  height: 100%;

  .header-box {
    height: var(--header_height);
    overflow: auto;
  }
}

.material-container {
  height: calc(100% - var(--header_height));
  width: 100%;
}

.cascader {
  position: relative;
}

.cascader-text {
  width: 100%;
  padding-right: 6px;
}

.cascader::before {
  content: '>';
  position: absolute;
  height: 10px;
  width: 8px;
  right: 0;
  top: 0;
  transform: rotate(90deg) translateX(10px);
  color: #b0adad;
  font-weight: 500;
}

.cascader:active::before {
  color: white;
  font-weight: 500;
}
</style>
