import { computed, ref } from "vue";
import { cardsClient, labelsClient } from "@/api";
import { useConfirmAction } from "./useConfirmAction";
import type { CardDetail, Label } from "@/types/models";

export const LABEL_COLORS = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5", "#8e24aa", "#6d4c41", "#546e7a"];
export const DEFAULT_LABEL_COLOR = "#1976d2";

export function useCardLabels(options: {
  boardId: () => string;
  card: () => CardDetail | null;
  reload: () => Promise<void>;
  notifyChanged: () => void;
}) {
  const allLabels = ref<Label[]>([]);
  const { confirmAction } = useConfirmAction();

  const availableLabels = computed<Label[]>(() => {
    const attachedIds = new Set((options.card()?.labels || []).map((l) => l.id));
    return allLabels.value.filter((l) => !attachedIds.has(l.id));
  });

  async function loadLabels(): Promise<void> {
    allLabels.value = await labelsClient.list(options.boardId());
  }

  async function addLabel(label: Label): Promise<void> {
    const card = options.card();
    if (!card) {
      return;
    }
    await cardsClient.addLabel(card.id, label.id);
    await options.reload();
    options.notifyChanged();
  }

  async function removeLabel(label: Label): Promise<void> {
    const card = options.card();
    if (!card) {
      return;
    }
    await cardsClient.removeLabel(card.id, label.id);
    await options.reload();
    options.notifyChanged();
  }

  async function createLabel(name: string, color: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const label = await labelsClient.create(options.boardId(), { name: trimmed, color });
    await loadLabels();
    await addLabel(label);
  }

  async function deleteLabel(label: Label): Promise<void> {
    await confirmAction(`Удалить метку "${label.name}" с доски целиком?`, async () => {
      await labelsClient.remove(label.id);
      await loadLabels();
      await options.reload();
      options.notifyChanged();
    });
  }

  return { allLabels, availableLabels, loadLabels, addLabel, removeLabel, createLabel, deleteLabel };
}
