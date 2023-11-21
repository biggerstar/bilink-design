<template>
  <div class="button h-[40px] ">
    <div class="fill-box  flex justify-center items-center">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.button {
  background-color: var(--color-gray-200);
  word-break: break-word;
  border-radius: 8px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s;
  overflow: hidden;

  :hover {
    background-color: var(--color-gray-300);
  }

  :active {
    background-color: var(--color-gray-400);
  }
}
</style>
