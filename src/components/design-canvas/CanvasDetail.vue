<template>
  <div v-if="editorStore.canvas" style=" width: 100%; height: 100%; ">
    <card title="画布" class="not-user-select">
      <a-space v-if="isShowResizeCanvas">
        <a-space>
          <span>宽</span>
          <a-input-number
            :step="20"
            v-model:value="editorStore.canvas.width"
          />
        </a-space>
        <a-space>
          <span>高</span>
          <a-input-number
            :step="20"
            v-model:value="editorStore.canvas.height"
          />
        </a-space>
      </a-space>
      <div v-else class="canvas-size-info">
        <div>尺寸</div>
        <div>{{ `${editorStore.canvas.width} x ${editorStore.canvas.height}px` }}</div>
      </div>
      <div class="reset-canvas-btn" v-if="!isShowResizeCanvas" @click='isShowResizeCanvas=true'>调整尺寸</div>
      <div class="reset-canvas-btn" v-else @click='isShowResizeCanvas=false'>完成</div>
    </card>
    <hr class="hr-line">

    <card title="背景色" class="not-user-select">
      <template #header>
        <el-color-picker v-model="editorStore.canvas.bgColor" show-alpha :predefine="predefineColors"/>
      </template>
    </card>

  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import Card from "@/components/card/Card.vue";
import {useEditorStore} from '@/store/editor'
import ElColorPicker from 'element-plus/es/components/color-picker/index.mjs'
import 'element-plus/es/components/color-picker/style/index.mjs'

const isShowResizeCanvas = ref(false)

const editorStore = useEditorStore()

const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])


</script>

<style scoped>
.reset-canvas-btn {
  background-color: #F1F2F4;
  width: 90%;
  font-weight: 400;
  padding: 10px;
  margin: 16px auto auto;
  border-radius: 10px;
  font-size: .9rem;
  cursor: pointer;
}

.reset-canvas-btn:hover {
  background-color: #E8EAEC;
}

.canvas-size-info {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  color: grey;
  font-weight: 500;
}
</style>
