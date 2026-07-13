import { ref } from "vue";

export function useInlineEdit<T extends { id: string }>(
  getValue: (item: T) => string,
  onSave: (item: T, value: string) => Promise<void> | void,
) {
  const editingId = ref<string | null>(null);
  const editingValue = ref("");

  function start(item: T): void {
    editingId.value = item.id;
    editingValue.value = getValue(item);
  }

  async function save(item: T): Promise<void> {
    if (editingId.value !== item.id) {
      return;
    }
    editingId.value = null;
    const trimmed = editingValue.value.trim();
    if (!trimmed || trimmed === getValue(item)) {
      return;
    }
    await onSave(item, trimmed);
  }

  return { editingId, editingValue, start, save };
}
