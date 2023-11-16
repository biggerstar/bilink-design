<template>
  <InfiniteScroll ref="cardBoxRef" :is-loading="isLoading" @scroll-to-bottom="loadNewRecordList">
    <card
      class="h-[184px] w-full mt-2 mb-5"
      v-for="(item,index) in resourceData"
      :key="item.self?.name+'parent' + index"
      :data-id="item.self.id"
    >
      <div class="flex justify-between mb-2">
        <div class="font-bold text-[0.9rem]">{{ item.self.name }}</div>
        <div class="text-[0.75rem] font-normal cursor-pointer">查看更多</div>
      </div>
      <content-box>
        <div class="h-[140px] w-full p-[5px] flex flex-wrap justify-between">
          <div
            class="icon-item w-[60px] h-[60px] items-center mt-[4px] mb-[4px] overflow-hidden cursor-pointer"
            v-for="(childItem, index) in item.children" :key="index.toString() + 'child' + childItem?.name"
            :data-material-id="childItem.id"
          >
            <img
              draggable="true"
              style="background-repeat: no-repeat; background-size: cover"
              width="60"
              height="60"
              :src="childItem.preview.url"
              :alt="childItem.name"
            >
          </div>
        </div>
      </content-box>
    </card>
    <el-skeleton v-if="!resourceData" :rows="10" animated/>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import axios from "axios";
import {onMounted, ref, shallowRef} from "vue";
import {getChildrenByDepth} from "@/utils/tool";
import {ScrollbarInstance} from 'element-plus'
import InfiniteScroll from "@/components/infinite-scroll /InfiniteScroll.vue";

/*-------------------------------------------------*/
let loadSize = 20
const isFilterEmptyCard = false
const pageMaterialId = 4828240
const pageMaterialType = 'icon'
/*-------------------------------------------------*/

const isLoading = ref(false)
const resourceData = ref()
const cardBoxRef = shallowRef<ScrollbarInstance>()
let allResourceData = []
let allMaterialResourceData = []
let curLoadIndex = 0


onMounted(() => {
  /* 获取所有的列表数据 */
  axios.get('getResource', {
    params: {
      id: pageMaterialId,
      type: pageMaterialType
    }
  }).then(res => {
    if (!res.data) return
    allResourceData = res.data?.data?.children
    allMaterialResourceData = getChildrenByDepth(allResourceData || [], 1)   // 所有二级页分类
    // console.log(allResourceData)
    loadNewRecordList()
    console.log(cardBoxRef.value)
  })

})

/** 获取某个分类的列表数据 */
async function getNextData(parentItem, opt = {}) {
  const res = await loadMaterialData({
    id: parentItem.id,
    parent_id: parentItem.parent_id,   // 指定当前要获取分类是属于哪个父级
    page_num: 1,
    page_size: 8,
    ...opt
  })
  return res?.data
}

/** 获取下一页列表数据 */
async function getNextDataList(nextHttpList) {
  return Promise.all(nextHttpList.map(async (item) => getNextData(item)))
}


/**
 * 分次渲染
 * */
async function loadNewRecordList() {
  console.warn('loadNewRecordList')

  if (isLoading.value || allMaterialResourceData.length < curLoadIndex) return
  if (curLoadIndex !== 0) isLoading.value = true
  const nextParentHttpList = allMaterialResourceData.slice(curLoadIndex, curLoadIndex + loadSize)  // 传入父级，内部获取id之后进行获取该父级id下的资源
  const dataList = await getNextDataList(nextParentHttpList)
  curLoadIndex += loadSize
  if (!dataList.length) return   // 必要
  if (!resourceData.value) resourceData.value = []
  isLoading.value = false
  let newAppendList = nextParentHttpList.map((self, index) => {
    return {
      self,
      children: dataList[index]
    }
  })
  if (isFilterEmptyCard) newAppendList = newAppendList.filter(item => Boolean(item?.children?.length))
  newAppendList.length && (resourceData.value = resourceData.value.concat(newAppendList))

  console.log('curLoadIndex', curLoadIndex, 'dataList len', dataList.length)   // 每次获取
  console.log('all', resourceData.value.length)  // 所有
}


async function loadMaterialData(opt: { id: any, page_num: any, page_size: any }) {
  const res = await axios.get('getList', {params: opt})
  return res?.data
}


</script>

<style scoped>
.icon-item:hover {
  background: var(--color-gray-400);
  border-radius: 10px;
}
</style>
