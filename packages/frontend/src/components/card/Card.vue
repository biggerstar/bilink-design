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
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  font-weight: bolder;
  text-align: center;
  font-size: 1rem;
  padding-bottom: 10px;
}
</style>
