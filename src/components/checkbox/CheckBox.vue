<!--
 @name: Checkbox
 @desc 展示组件，不参与任何交互，支持用于加载iconfont字体图标， 选择一个或多个选项，
-->
<template>
  <ul class="flex-center fill-box item-box">
    <el-tooltip v-for="(item, index) in props.data"
                :key="index"
                effect="dark"
                :content="item.tip"
                placement="top"
                :show-after="props.showAfter"
    >
      <div class="item flex-center" :class="{active: item.selected}" @click="choiceItem(item)">
        <i class="iconfont" :class="[item.icon]"></i>
      </div>
    </el-tooltip>
  </ul>
</template>

<script setup lang="ts">

const props = defineProps({
  data: {   // 组件内会直接修改 data.selected 状态值
    type: Array,
    required: true,
    default: []
  },
  type: {   // radio 单选 | checkbox 多选
    type: String,
    default: 'checkbox'
  },
  showAfter: {
    type: Number,
    default: 1000
  }
})
const emit = defineEmits(['changed'])

function choiceItem(curItem) {
  if (props.type === 'radio') {
    props.data && props.data.forEach((item) => item.selected = curItem === item)
  } else if (props.type === 'checkbox') {
    curItem.selected = !curItem.selected
  }
  emit('changed', curItem, props.type)
}

</script>

<style scoped lang="scss">
.item-box {
  align-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.item {
  flex: 1;
  height: 100%;
  margin: 0 1px;

  i::before {
    font-weight: bolder;
    font-size: 1.2rem;
  }

  &:hover {
    background-color: var(--color-gray-200);
  }
}

.active {
  background-color: var(--color-gray-400) !important;
}
</style>
