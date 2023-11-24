<template>
  <el-button-group>
    <el-button
      color="#2154F4" c
      lass="w-8/12"
      size="large"
      type="primary"
      @mousedown.prevent
      @click="editorStore.saveProject()">
      保存
    </el-button>
    <el-button
      color="#2154F4"
      @click="visible=true"
      class="iconfont icon-androidgengduo w-2/6"
      size="large"
      type="primary">
      <a-popover
        trigger="click"
        placement="bottomRight"
        v-model:open="visible"
        class="not-user-select">
        <template #content>
          <div style="width: 360px;"></div>
          <div v-if="currentActionConfig">
            <div class="w-full h-[45px] font-bold text-[1.04rem] p-1">{{ currentActionConfig.title }}</div>
            <component :is="currentActionConfig.component"></component>
          </div>
          <div v-if="!currentActionConfig && isShowDefaultMorePage">
            <div class="w-full h-[45px] font-bold text-[1.04rem] p-1">更多操作</div>
            <div class="w-full h-[340px] flex flex-wrap justify-evenly">
              <div
                class="w-14 h-14 rounded-lg cursor-pointer"
                v-for="(item,index) in moreOperationList"
                @click="showActionPopover(item)"
                :key="index + item.text">
                <div class="w-full h-full more-tag-icon ">
                  <ContentBox>
                    <div class="iconfont" :class="item.icon"></div>
                  </ContentBox>
                </div>
                <div class="text-center mt-1">{{ item.text }}</div>
              </div>
            </div>
          </div>
        </template>
      </a-popover>
    </el-button>
  </el-button-group>
</template>

<script setup lang="ts">
import {editorStore} from "@/store/editor";
import {onMounted, ref, shallowRef, watch} from "vue";
import Download from "@/components/header/Download.vue";
import Shared from "@/components/header/Shared.vue";

const moreOperationList = ref()
const currentActionConfig = shallowRef()
const isShowDefaultMorePage = shallowRef(true)
const visible = ref(false)

const actionMap = {
  download: {
    title: '下载作品',
    component: Download
  },
  shared: {
    title: '分享',
    component: Shared
  }
}

// currentActionConfig.value = actionMap['download']

function showActionPopover(item) {
  if (actionMap[item.handler]) {
    currentActionConfig.value = actionMap[item.handler]
    isShowDefaultMorePage.value = false
  }
}

watch(visible, () => {
  if (!visible.value) {
    currentActionConfig.value = null
    setTimeout(() => isShowDefaultMorePage.value = true, 200)
  }
})

onMounted(() => {
  moreOperationList.value = editorStore.pageConfig.header.moreOperation
})

</script>

<style scoped lang="scss">
.more-tag-icon {
  :hover {
    background-color: var(--color-gray-300);
  }

  :active {
    background-color: var(--color-gray-400);
  }
}
</style>
