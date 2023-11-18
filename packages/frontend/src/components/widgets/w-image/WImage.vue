<template>
  <div
    data-type="widgets"
    data-name='w-image'
    class="w-text not-user-select"
    ref="WImage"
  >
    image-widget
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
const props = defineProps({
  config: {
    type: Object,
    default: {}
  }
})
const  WImage= ref
</script>

<style scoped>
</style>
