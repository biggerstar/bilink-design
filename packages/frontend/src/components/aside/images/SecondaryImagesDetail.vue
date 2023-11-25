<template>
  <InfiniteScroll class="w-full h-full" :is-loading="isLoading" @scroll-to-bottom="loadNewRecordList">
    <div class="container pl-[10px] pr-[12px] mb-[50px] w-full h-full">
      <justified-infinite-grid
        :gap="8"
        :column-range="[1,3]"
      >
        <div
          class="overflow-hidden"
          v-for="(childItem,index) in materialDetail"
          :key="childItem.title + index.toString()"
        >
          <img
            class="w-full h-full rounded-lg bg-no-repeat"
            style="border: #eae8e8 solid 1px;object-fit: cover; background-size: cover;"
            :src="`${childItem.preview.url}?x-oss-process=image/resize,w_${Math.max(270,Math.round(childItem.preview.width /6))}`"
            :alt="childItem.title"
            :data-material-id="childItem.id"
            :data-material-type="'material'"
            data-grid-maintained-target="true"
            @error="handleImageError($event)"
            @mousedown.capture="()=>editorStore.dragMaterial(childItem)"
            @click="()=>editorStore.addMaterial(childItem,{autoSize:true})"
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
import {handleImageError} from '@/utils/method'
import {editorStore} from "@/store/editor";

const props = defineProps({
  id: {
    type: [Number, String, Array],
    required: true,
    default: ''
  }
})
const MATERIAL_PAGE_SIZE = 40   // 每次请求个数
const isLoading = ref(false)
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
    setTimeout(() => isLoading.value = false, 100)
  })
}


</script>

<style scoped>
</style>
