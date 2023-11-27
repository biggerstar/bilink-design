<template>
  <div class="w-[320px]"></div>
  <div class="p-[6px]">
    <div class="text-start font-bold">作品类型</div>
    <div class="flex justify-between mt-[20px]">
      <a-select
        ref="select"
        class="w-[60%] h-[40px] font-bold"
        size="large"
        :dropdown-match-select-width="false"
        v-model:value="config.workType.value"
      >
        <a-select-option v-for="(item ,index) in config.workType.options" :value="item.value" :key="index">
          <p class="font-bold">{{ item.label }}</p>
          <p class="text-[0.7rem] mt-[5px]" style="color: grey">{{ item.desc }}</p>
        </a-select-option>
      </a-select>
      <!--  画质  -->
      <a-select
        ref="select"
        class="w-[36%] h-[40px] font-bold"
        size="large"
        :dropdown-match-select-width="false"
        v-model:value="config.workSize.value"
      >
        <a-select-option v-for="(item ,index) in config.workSize.options" :value="item.value" :key="index">
          <p class="font-bold">{{ item.label }}</p>
          <p class="mb-[3px]"></p>
        </a-select-option>
      </a-select>
    </div>
    <a-button type="primary" @click.prevent.stop="doDownload" class="w-full h-[40px] mt-[20px] mb-[10px] font-bold">下载</a-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {notification} from "ant-design-vue";
import {sleep} from "../../../../../common/tool/tool";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import {editorStore} from "@/store/editor";

const CONFIG = {
  workType: {
    value: void 0,
    default: 0,
    options: [
      {
        label: 'JPG',
        value: 'image/jpeg',
        desc: '文件较小的图片,不支持透明背景',
      },
      {
        label: 'PNG',
        value: 'image/png',
        desc: '优质无损图片,文件较大,支持透明背景',
      },
      {
        label: 'PDF',
        value: 'pdf',
        desc: '优质文档格式',
      },
    ]
  },
  workSize: {
    value: void 0,
    default: 3,
    options: [
      {
        label: '较差',
        value: 1,
      },
      {
        label: '能看',
        value: 3,
      },
      {
        label: '普通',
        value: 5,
      },
      {
        label: '高清',
        value: 8,
      },
      {
        label: '超高清',
        value: 12,
      },
    ]
  }
}

const config = ref(CONFIG)

function doDownload() {
  const downloadInfo = {
    workType: config.value.workType.value,
    workSize: config.value.workSize.value,
  }
  download(downloadInfo)
}

onMounted(() => {
  config.value.workType.value = config.value.workType.options[0].value
  config.value.workSize.value = config.value.workSize.options[2].value
})

/**
 * 进行导出下载成图片或者pdf  TODO 监控转换进度
 * */
async function download(downloadInfo: { workType: string, workSize: number }) {
  const editorArea = editorStore.editorAreaBoxTarget
  if (!editorStore.currentTemplate) {
    return notification.open({
      message: '您似乎还没有开始进行设计哦',
      description: '您可以先设计您的成果后再进行导出哦',
      duration: 3,
    });
  }
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
  }).then(async (canvas) => {
    // console.log(canvas)
    // document.body.appendChild(canvas)
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
</script>

<style scoped>
</style>












