<template>
  <div style="padding: .5rem 1rem;">
    <div class="card-header">
      <span v-if="props.title"> {{ props.title }} </span>
      <span>
        <slot name="header"></slot>
      </span>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  fontSize: {
    type: String,
    default: '0.9rem',
  },
})
const {fontSize} = props
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bolder;
  text-align: center;
  font-size: v-bind(fontSize);
  padding-bottom: 10px;
}
</style>
