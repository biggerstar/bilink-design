<template>
  <el-button-group>
    <el-button color="#2154F4" class="w-8/12" size="large" type="primary" @click="saveProject">保存</el-button>
    <el-button color="#2154F4" @click="visible=true" class="iconfont icon-androidgengduo w-2/6" size="large"
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
            <component :is="currentActionConfig.component" @handler="(...args)=>currentActionConfig?.handler(...args)"></component>
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
import {notification} from "ant-design-vue";
import html2canvas from "html2canvas";
import {DESIGN_AREA_BOUNDARY_SELECTOR} from "@/constant";
import {jsPDF} from "jspdf";
import Download from "@/components/header/Download.vue";
import {sleep} from "../../../../common/tool/tool";
import Shared from "@/components/header/Shared.vue";

const moreOperationList = ref()
const currentActionConfig = shallowRef()
const isShowDefaultMorePage = shallowRef(true)
const visible = ref()

const actionMap = {
  download: {
    title: '下载作品',
    handler: download,
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

function saveProject() {  /* 保存当前工程 */
  sessionStorage.setItem('layout', JSON.stringify(editorStore.currentTemplate))
  openNotification()
}

const openNotification = () => {
  notification.open({
    message: '保存成功',
    description: '🎉🎉 您的项目已经保存成功啦!',
    duration: 1.5,
  });
};

/**
 * 进行导出下载成图片或者pdf  TODO 监控转换进度
 * */
async function download(downloadInfo: { workType: string, workSize: number }) {
  const editorArea = document.querySelector(DESIGN_AREA_BOUNDARY_SELECTOR)
  if (!editorArea) throw new Error('未在dom中找到画板')
  notification.open({
    message: '开始下载',
    description: '🎉🎉 您的项目已经开始下载喽!,耐心等一等哦',
    duration: 3,
  });
  await sleep(600)
  html2canvas(<HTMLElement>editorArea, {
    logging: false,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    foreignObjectRendering: false,
    scale: downloadInfo.workSize,
  }).then(canvas => {
    // console.log(canvas)
    document.body.appendChild(canvas)
    const suffix = downloadInfo.workType.split('/').pop()
    const base64Image = canvas.toDataURL(downloadInfo.workType)
    // console.log(suffix)
    if (downloadInfo.workType === 'pdf') {  // 下载pdf
      const doc = new jsPDF();
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;
      const scale = Math.min(doc.internal.pageSize.width / imageWidth, doc.internal.pageSize.height / imageHeight);
      const pdfWidth = imageWidth * scale;
      const pdfHeight = imageHeight * scale;
      const x = (doc.internal.pageSize.width - pdfWidth) / 2;
      const y = (doc.internal.pageSize.height - pdfHeight) / 2;

      doc.addImage(base64Image, 'JPEG', x, y, pdfWidth, pdfHeight);
      doc.save("exported_image.pdf");

    } else {  // 默认下载图片
      const downloadLink = document.createElement('a');
      downloadLink.href = base64Image;
      downloadLink.download = `exported_image.${suffix}`;
      downloadLink.click();
    }
  })
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
