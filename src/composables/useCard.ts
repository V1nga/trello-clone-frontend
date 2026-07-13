import { ref } from "vue";
import { cardsClient } from "@/api";
import { useConfirmAction } from "./useConfirmAction";
import type { CardDetail } from "@/types/models";

function toLocalInputValue(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function useCard(options: {
  cardId: () => string | null;
  canEdit: () => boolean;
  onChanged: () => void;
  onClose: () => void;
}) {
  const card = ref<CardDetail | null>(null);
  const titleDraft = ref("");
  const descriptionDraft = ref("");
  const dueDateDraft = ref("");
  const { confirmAction } = useConfirmAction();

  async function loadCard(): Promise<void> {
    const cardId = options.cardId();
    if (!cardId) {
      return;
    }
    card.value = await cardsClient.get(cardId);
    titleDraft.value = card.value.title;
    descriptionDraft.value = card.value.description || "";
    dueDateDraft.value = toLocalInputValue(card.value.dueDate);
  }

  async function saveTitle(): Promise<void> {
    const cardId = options.cardId();
    if (
      !options.canEdit() ||
      !cardId ||
      !card.value ||
      !titleDraft.value.trim() ||
      titleDraft.value === card.value.title
    ) {
      return;
    }
    await cardsClient.update(cardId, {
      title: titleDraft.value,
      description: card.value.description,
      dueDate: card.value.dueDate,
    });
    await loadCard();
    options.onChanged();
  }

  async function saveDescription(): Promise<void> {
    const cardId = options.cardId();
    if (!options.canEdit() || !cardId || !card.value) {
      return;
    }
    await cardsClient.update(cardId, {
      title: card.value.title,
      description: descriptionDraft.value,
      dueDate: card.value.dueDate,
    });
    await loadCard();
    options.onChanged();
  }

  async function saveDueDate(): Promise<void> {
    const cardId = options.cardId();
    if (!options.canEdit() || !cardId || !card.value) {
      return;
    }
    const dueDate = dueDateDraft.value ? new Date(dueDateDraft.value).toISOString() : null;
    await cardsClient.update(cardId, {
      title: card.value.title,
      description: card.value.description,
      dueDate,
    });
    await loadCard();
    options.onChanged();
  }

  async function handleArchive(): Promise<void> {
    const cardId = options.cardId();
    if (!cardId || !card.value) {
      return;
    }
    await confirmAction(`Архивировать карточку "${card.value.title}"?`, async () => {
      await cardsClient.archive(cardId);
      options.onChanged();
      options.onClose();
    });
  }

  return { card, titleDraft, descriptionDraft, dueDateDraft, loadCard, saveTitle, saveDescription, saveDueDate, handleArchive };
}
