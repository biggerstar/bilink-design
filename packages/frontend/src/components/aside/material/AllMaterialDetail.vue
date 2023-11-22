<!--  全部素材页面  -->
<template>
  <InfiniteScroll class="w-full h-full" :is-loading="isLoading"
                  @scroll-to-bottom="loadNewRecordList">
    <div class="w-full h-full mt-[16px]">
      <card
        class="h-[184px] w-full mt-2 mb-5"
        v-for="(item,index) in resourceData"
        :key="item.self?.name+'parent' + index"
        :data-material-type-id="item.self.id"
      >
        <div class="flex justify-between mb-2">
          <div class="font-bold text-[0.9rem]">{{ item.self.name }}</div>
          <div class="text-[0.75rem] font-normal cursor-pointer"
               @click="viewMoreMaterial(item.self)"
          >查看更多
          </div>
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
                width="56"
                height="56"
                :src="childItem.preview.url"
                :alt="childItem.name"
              >
            </div>
          </div>
        </content-box>
      </card>
    </div>
    <el-skeleton v-if="!resourceData" :rows="10" animated/>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {apigetWidgets} from "@/api/getWidgets";

const resourceData = ref()
let curLoadIndex = 0
const isFilterEmptyCard = false
let loadSize = 20
const isLoading = ref(false)

const props = defineProps({
  loadNewData: {   // 只要变化就读取新数据，不够优雅，后面通过mitt 或者 将该组件单独 作为展示组件 来做
    type: Number,
    default: 0
  },
  list: {
    type: Array,
    default: []
  }
})
const emits = defineEmits(['changeId', 'load'])
watch(props, async () => {
  const firstLoad = !resourceData.value
  await loadNewRecordList()
  if (firstLoad) emits('load')   // 首次等待所有页面布局数据加载成功后发起载入成功事件
})

function viewMoreMaterial(toItemInfo: string) {
  emits('changeId', toItemInfo)
}

/*-----------------------------------------------------------------------------------------*/

/**
 * 分次根据不同场景进行动态渲染,如果没有 activeNavId 则加载全部，如果存在 activeNavId 则加载该id
 * */
async function loadNewRecordList() {
  if (isLoading.value || props.list.length < curLoadIndex) return
  if (curLoadIndex !== 0) isLoading.value = true
  const nextParentHttpList = props.list.slice(curLoadIndex, curLoadIndex + loadSize)  // 传入父级，内部获取id之后进行获取该父级id下的资源
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
  // console.log('curLoadIndex', curLoadIndex, 'dataList len', dataList.length)   // 每次获取
  // console.log('all', resourceData.value.length)  // 所有
}

/** 获取下一页列表数据 */
async function getNextDataList(nextHttpList) {
  return Promise.all(nextHttpList.map(async (item) => getNextDataByAllPage(item)))
}

/** 获取某个分类的列表数据 */
async function getNextDataByAllPage(parentItem, opt = {}) {
  const res = await apigetWidgets({
    id: parentItem.id,
    page_num: 1,
    page_size: 8,
    ...opt
  })
  return res?.data
}

</script>

<style scoped>
.icon-item:hover {
  background: var(--color-gray-400);
  border-radius: 10px;
}

</style>
