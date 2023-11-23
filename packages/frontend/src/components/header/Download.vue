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
    <a-button type="primary" @click="doDownload" class="w-full h-[40px] mt-[20px] mb-[10px] font-bold">下载</a-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";

const emits = defineEmits(['handler'])

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
  emits('handler', downloadInfo)
}

onMounted(() => {
  config.value.workType.value = config.value.workType.options[0].value
  config.value.workSize.value = config.value.workSize.options[2].value
})

</script>

<style scoped>

</style>












