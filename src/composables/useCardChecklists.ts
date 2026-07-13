import { reactive, ref } from "vue";
import { checklistsClient } from "@/api";
import type { Checklist } from "@/types/models";

export function useCardChecklists(options: {
  cardId: () => string | null;
  canEdit: () => boolean;
  reload: () => Promise<void>;
}) {
  const newChecklistTitle = ref("");
  const newItemText = reactive<Record<string, string>>({});
  const checklistDialogOpen = ref(false);

  function doneCount(checklist: Checklist): number {
    return checklist.items.filter((item) => item.done).length;
  }

  async function toggleItem(item: { id: string }, done: boolean): Promise<void> {
    if (!options.canEdit()) {
      return;
    }
    await checklistsClient.updateItem(item.id, { done });
    await options.reload();
  }

  async function addItem(checklist: Checklist): Promise<void> {
    const text = (newItemText[checklist.id] || "").trim();
    if (!text) {
      return;
    }
    await checklistsClient.addItem(checklist.id, { text });
    newItemText[checklist.id] = "";
    await options.reload();
  }

  async function createChecklist(): Promise<void> {
    const title = newChecklistTitle.value.trim();
    const cardId = options.cardId();
    if (!title || !cardId) {
      return;
    }
    await checklistsClient.create(cardId, { title });
    newChecklistTitle.value = "";
    checklistDialogOpen.value = false;
    await options.reload();
  }

  return { newChecklistTitle, newItemText, checklistDialogOpen, doneCount, toggleItem, addItem, createChecklist };
}
