<template>
  <p class="tab-empty-state">{{ text }}</p>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<style scoped lang="scss">
.tab-empty-state {
  margin-bottom: 20px;
  font-size: 14px;
  opacity: 0.6;
}
</style>
