<template>
  <div class="fill-box content-box">
    <slot></slot>
  </div>
</template>

<script>
</script>

<style scoped>
.content-box {
  background-color: var(--color-gray-300);
  word-break: break-word;
  border-radius: 8px;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
</style>
