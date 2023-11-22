<template>
  <InfiniteScroll class="w-full h-full" :is-loading="isLoading"
                  @scroll-to-bottom="loadNewRecordList">
    <div class="w-full h-full ">
      <card
        class="w-full "
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
        <div>
          <div class="overflow-hidden w-full flex flex-wrap justify-between">
            <div
              class="icon-item  rounded-lg  overflow-hidden cursor-pointer"
              style="border: #e3e2e2 solid 1px"
              v-for="(childItem, index) in item.children" :key="index.toString() + 'child' + childItem?.name"
              :data-material-id="childItem.id"
              :style="{ width: `${getItemOccupancyWidth(childItem,item)}`}"
            >
              <img
                draggable="true"
                class=" w-full h-full"
                style="background-repeat: no-repeat; background-size: cover;"
                :src="`${childItem.preview.url }?x-oss-process=image/resize,w_${Math.max(60,Math.round(childItem.preview.width /6))}`"
                :data-size-w="childItem.preview.width"
                :data-size-h="childItem.preview.height"
                :alt="childItem.name"
                @mousedown.capture="()=>editorStore.dragMaterial(childItem)"
                @click="()=>editorStore.addMaterial(childItem)"
              >
            </div>
          </div>
        </div>
      </card>
    </div>
    <el-skeleton v-if="!resourceData" :rows="10" animated/>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {apigetWidgets} from "@/api/getWidgets";
import {toPercent} from "@/utils/tool";
import {editorStore} from "@/store/editor";

const props = defineProps({
  loadNewData: {   // 只要变化就读取新数据，不够优雅，后面通过mitt 或者 将该组件单独 作为展示组件 来做
    default: 0
  },
  list: {
    type: Array,
    default: []
  }
})

/** 获取当前图片在一行中占用的比例
 * 实现原理，通过获取当前item 图片的宽高比例/ 所有图片宽度比例(width / height)总和
 * */
function getItemOccupancyWidth(childItem, item) {
  const countHeight = item.children.reduce((pre, cur) => pre + cur.preview.width / cur.preview.height, 0)
  const itemProportion = childItem.preview.width / childItem.preview.height
  return toPercent((itemProportion / countHeight) * 0.97)
  // console.log(itemProportion, countHeight)
}

const resourceData = ref()
const isLoading = ref(false)
let curLoadIndex = 0
const isFilterEmptyCard = false
let loadSize = 20

const emits = defineEmits(['changeId', 'load'])
watch(props, async () => {
  const firstLoad = !resourceData.value
  await loadNewRecordList()
  if (firstLoad) emits('load')   // 首次等待所有页面布局数据加载成功后发起载入成功事件
})

function viewMoreMaterial(toItemInfo: string) {
  emits('changeId', toItemInfo)
}

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
    page_size: 2,
    ...opt
  })
  return res?.data
}

</script>

<style scoped>
</style>
