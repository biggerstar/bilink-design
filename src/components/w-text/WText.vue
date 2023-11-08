<template>
  <div data-type="widgets" data-name='w-text' class="w-text not-user-select" ref="WText">
    console.log(111111111111111111)
    console.log(111111111111111111)
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {shallowRef} from 'vue'
// const value = el ? el.innerHTML : text.replace(/\n/g, '<br/>')
import {useEditorStore} from "@/store/editor";

const props = defineProps({
  detail: {
    type: Object,
    required: false,
    default: {}
  }
})

const WText = shallowRef<HTMLElement>()

const editorStore = useEditorStore()

</script>

<style scoped>
.w-text {
  font-size: 3rem;
  /*cursor: text;*/
  outline: none;
  word-break: break-word;
  text-align: left;
  cursor: move;
}
</style>
