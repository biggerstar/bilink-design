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
          @click="loadNewPoster(childItem)"
          :key="childItem.title + index.toString()"
        >
          <img
            draggable="false"
            class="w-full h-full rounded-lg bg-no-repeat"
            style="border: #eae8e8 solid 1px;object-fit: cover; background-size: cover;"
            :src="`${childItem.preview.url}`"
            :alt="childItem.title"
            data-grid-maintained-target="true"
            @error="handleImageError($event)"
          />
        </div>
      </justified-infinite-grid>
    </div>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {apiGetWidgets} from "@/api/getWidgets";
import {JustifiedInfiniteGrid} from "@egjs/vue3-infinitegrid";
import {QuestionCircleFilled} from '@ant-design/icons-vue';
import {editorStore} from "@/store/editor";
import {apiGetDetail} from "@/api/getDetail";
import {handleImageError} from '@/utils/method'
import {message} from "ant-design-vue";

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
const selectedTemplate = ref()
const selectedPosterId = ref()
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
  apiGetWidgets({
    id: curUseId.value,
    page_size: MATERIAL_PAGE_SIZE,
    page_num: curFetchPage++,
  }).then(async (res) => {
    // console.log(curUseId.value, res);
    if (res.code === 404) return pageEnd = true
    if (res.code !== 200) return
    materialDetail.value = materialDetail.value.concat(res.data)
  }).finally(() => {
    setTimeout(() => isLoading.value = false, 800)
  })
}


async function loadNewPoster(childItem) {
  const posterId = childItem?.id
  if (!posterId) return
  const res = await apiGetDetail({   // 先拿到该模板数据再进行用户交互或者载入
    id: posterId
  })
  if (res && res.code === 200) {
    selectedTemplate.value = res.data
    selectedPosterId.value = posterId
    if (editorStore.getCurrentTemplateLayout()) openModal.value = true  // 如果当前画布中有模板，弹出是否替换
    else replaceProject()  // 如果当前画布中为空，直接载入不弹窗
  } else {
    message.error(`拉取模板数据失败, code${res.code}`)
  }
}

function addToNewProject() {
  replaceProject()
  // TODO  添加成新页面而不是直接替换

}

function replaceProject() {
  selectedTemplate.value && editorStore.bus.emit('loadTemplate', {
    id: selectedPosterId.value,
    data: selectedTemplate.value
  })
  openModal.value = false
}


</script>

<style scoped>
</style>





