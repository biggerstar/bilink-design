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


  <InfiniteScroll class="w-full h-full" :is-loading="isLoading" @scroll-to-bottom="loadNewRecordList()">
    <div class="container pl-[10px] pr-[12px] mb-[50px] w-full h-full">
      <justified-infinite-grid
        :gap="8"
        :column-range="[1,3]"
      >
        <div
          class="template-preview overflow-hidden cursor-pointer relative"
          v-for="(childItem,index) in materialDetail"
          @click="loadNewPoster(childItem)"
          :key="childItem.title + index.toString()"
        >
          <a-popover v-model:open="childItem.show" trigger="click"
                     @click.stop.prevent
                     class="popover-btn absolute right-1.5 top-1.5"
                     placement="bottomLeft">
            <div @click="(childItem.show=true)  "
                 class="iconfont icon-gengduosangedian w-[28px] h-[16px]  leading-4 rounded-lg  transition"></div>
            <template #content>
              <div class=" min-w-[300px]"></div>
              <div class="font-bold text-[1.1rem] pb-4">{{ childItem.title }}</div>
              <div class="text-[1.1rem]">
                <div>
                  <a-space>
                    <span>类型</span>
                    <span>{{ childItem.type }}</span>
                  </a-space>
                </div>
                <div>
                  <a-space>
                    <span>大小</span>
                    <span>{{ `${childItem.preview.width} x ${childItem.preview.height} px` }}</span>
                  </a-space>
                </div>
                <hr class="hr-line" style="width: 100%"/>
                <div class="text-[1rem] hover:bg-gray-100 not-user-select">
                  <div class="flex h-[40px] items-center cursor-pointer"
                       @click="deleteUserTemplate(childItem)">
                    <span class="iconfont icon-shanchu- ml-[10px]"></span>
                    <span class="ml-3">删除</span>
                  </div>
                </div>
              </div>
            </template>
          </a-popover>
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
    <a-empty v-if="!materialDetail.length" description="您还没有创作模板哦"/>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {JustifiedInfiniteGrid} from "@egjs/vue3-infinitegrid";
import {QuestionCircleFilled} from '@ant-design/icons-vue';
import {editorStore} from "@/store/editor";
import {apiDeleteDetail, apiGetDetail} from "@/api/getDetail";
import {handleImageError} from '@/utils/method'
import {mockUserId} from "@/config/widgets-map.js";
import {message} from 'ant-design-vue';

const props = defineProps({
  config: {
    type: Object,
    default: {}
  }
})

const MATERIAL_PAGE_SIZE = 40   // 每次请求个数
const isLoading = ref(false)
const openModal = ref(false)
const selectedTemplate = ref()
const selectedPosterId = ref()
const materialDetail = ref([])
let curFetchPage = 1   // 记录当前加载的页数
let pageEnd = false     // 数据是否已经都加载完了

onMounted(() => loadNewRecordList())

function loadNewRecordList() {
  if (isLoading.value || pageEnd) return
  isLoading.value = true
  apiGetDetail({
    uid: mockUserId,
    page_size: MATERIAL_PAGE_SIZE,
    page_num: curFetchPage++,
  }).then(async (res) => {
    // console.log(res);
    if (res.code === 404) return pageEnd = true
    if (res.code !== 200) return
    const urls = new URL(location.href)
    const curId = Number(urls.searchParams.get('id'))
    materialDetail.value = materialDetail.value.concat(res.data).reduce((pre: any[], cur) => {   /* 将当前使用的模板前置 */
      curId === cur.id ? pre.unshift(cur) : pre.push(cur)
      return pre
    }, [])

  }).finally(() => {
    setTimeout(() => isLoading.value = false, 800)
  })
}


async function loadNewPoster(childItem) {
  const posterId = childItem?.id
  if (!posterId) return
  const res = await apiGetDetail({
    id: posterId
  })
  if (res && res.code === 200) {
    openModal.value = true
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
}

function replaceProject() {
  selectedTemplate.value && editorStore.bus.emit('loadTemplate', {
    id: selectedPosterId.value,
    data: selectedTemplate.value
  })
  openModal.value = false
}

async function deleteUserTemplate(item) {
  item.show = false
  const res = await apiDeleteDetail({id: item.id})
  if (res.code === 200) {
    const foundIndex = materialDetail.value.findIndex(material => item.id === material.id)
    // console.log(foundIndex)
    if (foundIndex >= 0) {
      materialDetail.value.splice(foundIndex, 1)
      editorStore.destroyEditorProject()
    }
    message.success('删除成功', item.id);
    editorStore.currentTemplate = null
  } else {
    message.success('删除失败-_-!', item.id, res.message);
  }
}

</script>

<style scoped lang="scss">
.template-preview {
  .popover-btn {
    opacity: 0;
    background-color: white;

    &:active {
      opacity: 1;
      background-color: var(--color-gray-300);
    }
  }

  &:hover {
    .popover-btn {
      opacity: 1;
    }
  }

}
</style>





