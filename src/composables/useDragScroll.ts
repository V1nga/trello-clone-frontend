import { onUnmounted, ref, type Ref } from "vue";

export function useDragScroll(scrollAreaRef: Ref<HTMLElement | null>) {
  const isDragging = ref(false);
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  function handleDragMove(event: MouseEvent): void {
    if (!isDragging.value || !scrollAreaRef.value) {
      return;
    }
    event.preventDefault();
    scrollAreaRef.value.scrollLeft = dragStartScrollLeft - (event.pageX - dragStartX);
  }

  function handleDragEnd(): void {
    isDragging.value = false;
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
  }

  function handleDragStart(event: MouseEvent, ignoreSelector?: string): void {
    const target = event.target as HTMLElement;
    if (ignoreSelector && target.closest(ignoreSelector)) {
      return;
    }
    if (!scrollAreaRef.value) {
      return;
    }
    isDragging.value = true;
    dragStartX = event.pageX;
    dragStartScrollLeft = scrollAreaRef.value.scrollLeft;
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
  }

  onUnmounted(() => {
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
  });

  return { isDragging, handleDragStart };
}
