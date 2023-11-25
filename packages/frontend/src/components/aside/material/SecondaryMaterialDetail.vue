<template>
  <InfiniteScroll class="w-full h-full" :is-loading="isLoading"
                  @scroll-to-bottom="loadNewRecordList">

    <div class="flex justify-center   flex-wrap p-[10px]">
      <div
        class="icon-detail-item w-[88px] h-[88px] overflow-hidden mr-auto cursor-pointer flex justify-center items-center"
        v-for="(childItem,index) in materialDetail" :key="childItem.id + index.toString()">
        <img
          draggable="true"
          style="background-repeat: no-repeat; background-size: cover"
          width="78"
          height="78"
          :data-material-id="childItem.id"
          :data-material-type="'material'"
          :src="childItem.preview.url" :alt="childItem.title"
          @error="handleImageError($event)"
          @mousedown.capture="()=>editorStore.dragMaterial(childItem)"
          @click="()=>editorStore.addMaterial(childItem)"
        >
      </div>
    </div>
  </InfiniteScroll>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {apiGetWidgets} from "@/api/getWidgets";
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
    isLoading.value = false
  })
}

</script>

<style scoped>
.icon-detail-item {
  background-color: #F1F2F4;
  border-radius: 8px;
  padding: 4px;
  margin: 4px auto 4px 4px;
}

.icon-detail-item:hover {
  background-color: rgba(140, 138, 138, 0.2);
  opacity: 0.95;
  filter: brightness(0.8);
}
</style>
