<template>
  <div
    ref="scrollAreaRef"
    class="columns-scroll-area"
    :class="{ 'columns-scroll-area--dragging': isDragging }"
    @mousedown="(event) => handleDragStart(event, ignoreSelector)"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDragScroll } from "@/composables/useDragScroll";

defineProps<{
  ignoreSelector: string;
}>();

const scrollAreaRef = ref<HTMLElement | null>(null);
const { isDragging, handleDragStart } = useDragScroll(scrollAreaRef);
</script>

<style scoped lang="scss">
@import "./styles";
</style>
