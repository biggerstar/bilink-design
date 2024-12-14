<template>
  <div class="fill-box content-box"
       @mousedown.capture="preEvent"
       @click.capture="preEvent"
       @mouseup.capture="preEvent"
       :class="{
          // 'disable-content':props.disabled
       }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  disabled: {   // 是否可选择
    type: Boolean,
    default: false
  }
})

function preEvent(ev) {
  props.disabled && ev.stopPropagation() && ev.preventDefault()
}

</script>

<style scoped lang="scss">
.disable-content {
  filter: grayscale(0.2);
  color: #939191 !important;
  cursor: no-drop !important;
}

.content-box {
  background-color: var(--color-gray-200);
  word-break: break-word;
  border-radius: 8px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
</style>
