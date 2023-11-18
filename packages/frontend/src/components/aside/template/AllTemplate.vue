<template>
  <a-modal v-model:open="openModal" type="warning" :width="400" :maskClosable="false">
    <template #title>
      <div class="flex justify-start items-center not-user-select">
        <QuestionCircleFilled
          class="ml-[5px] mr-[20px]"
          style="color:#F48B21;transform: scale(1.24);transform-origin: center center"/>
        <div class="font-bold text-[1.02rem]">将模板添加为新页面</div>
      </div>
    </template>
    <p class="font-bold text-gray-400 ml-[40px]">使用模板后, 模板内容将应用至新页面</p>
    <br/>
    <template #footer>
      <el-button
        key="back"
        size="large"
        type="info"
        color="#E8EAEC"
        class="w-[118px] h-[40px]"
        style="border-radius: 10px"
        @click="replaceProject"
      >
        <div class="font-bold">替换当前页面</div>
      </el-button>
      <el-button
        key="submit"
        size="large"
        class="w-[118px] h-[40px]"
        style="border-radius: 10px"
        type="primary"
        color="#2154F4"
        @click="addToNewProject"
      >
        <div class="font-bold">添加为新页面</div>
      </el-button>
    </template>
  </a-modal>


  <InfiniteScroll class="w-full h-full" :is-loading="isLoading" @scroll-to-bottom="loadNewRecordList">
    <div class="container pl-[10px] pr-[12px] mb-[50px] w-full h-full">
      <justified-infinite-grid
        :gap="8"
        :column-range="[1,2]"
      >
        <div
          class="overflow-hidden cursor-pointer"
          v-for="(childItem,index) in materialDetail"
          :key="childItem.title + index.toString()"
        >
          <img
            draggable="false"
            class="w-full h-full rounded-lg bg-no-repeat"
            style="border: #eae8e8 solid 1px;object-fit: cover; background-size: cover;"
            @click="openModal = true"
            :src="`${childItem.preview.url}`"
            :alt="childItem.title"
            data-grid-maintained-target="true"
            @error="handleImageError"
          />
        </div>
      </justified-infinite-grid>
    </div>
  </InfiniteScroll>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {apiGetList} from "@/api/getList";
import {getElement4EventTarget} from "@/utils/tool";
import {JustifiedInfiniteGrid} from "@egjs/vue3-infinitegrid";
import {QuestionCircleFilled} from '@ant-design/icons-vue';

const props = defineProps({
  id: {
    type: [Number, String, Array],
    required: true,
    default: ''
  }
})

const MATERIAL_PAGE_SIZE = 40   // 每次请求个数
const isLoading = ref(false)
const openModal = ref(false)
const materialDetail = ref([])
let curFetchPage = 1   // 记录当前加载的页数
let beforeId
let curUseId = computed(() => Array.isArray(props.id) ? props.id[props.id.length - 1] : props.id)   // 记录当前加载的页数
let pageEnd = false     // 数据是否已经都加载完了

onMounted(() => loadNewRecordList())
watch(props, () => {
  if (curUseId.value !== beforeId) {
    beforeId = curUseId.value
    curFetchPage = 1
    pageEnd = false
    materialDetail.value = []
    loadNewRecordList()
  }
})

function loadNewRecordList() {
  if (!curUseId.value || isLoading.value || pageEnd) return
  isLoading.value = true
  apiGetList({
    id: curUseId.value,
    page_size: MATERIAL_PAGE_SIZE,
    page_num: curFetchPage++,
  }).then(async (res) => {
    console.log(curUseId.value, res);
    if (res.code === 404) return pageEnd = true
    if (res.code !== 200) return
    materialDetail.value = materialDetail.value.concat(res.data)
  }).finally(() => {
    setTimeout(() => isLoading.value = false, 100)
  })
}

/** 图片加载失败从dom中移除掉 */
function handleImageError(ev) {
  const target = getElement4EventTarget(ev)
  if (target && target.nodeName.toLowerCase() === 'img') {
    const parentNode = target?.parentElement
    if (parentNode) parentNode.remove()
  }
}

function addToNewProject() {
  openModal.value = false
}

function replaceProject() {
  openModal.value = false
}


</script>

<style scoped>
</style>
