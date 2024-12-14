<template>
  <div v-if="config.category === 'QRCODE'">
    <CQrcode></CQrcode>
  </div>
  <WImage v-else :config="config"></WImage>
</template>

<script setup lang="ts">
import CQrcode from "@/components/widgets/c-qrcode/CQrcode.vue";

const props = defineProps({
  config: {
    type: Object,
    default: {}
  } as any
})
const config = props.config

console.log(props.config)

</script>

<style scoped>
</style>
