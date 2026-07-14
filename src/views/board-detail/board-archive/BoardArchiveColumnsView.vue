<template>
  <div class="board-view-root">
    <VAlert v-if="loadError" class="load-error" type="error" density="compact">{{ loadError }}</VAlert>

    <div v-if="loading" class="archive-loading">
      <VProgressCircular indeterminate size="24" color="primary" />
    </div>

    <div v-else-if="!groups.length" class="archive-empty">Архив пуст</div>

    <BoardColumnsScrollArea v-else ignore-selector=".card-item, .restore-column-btn, .restore-card-btn">
      <div class="columns-row">
        <BoardColumnCard
          v-for="group in groups"
          :key="group.columnId"
          :name="group.columnName"
          readonly
          :show-restore-button="canEdit && group.columnArchived"
          :restoring="unarchivingColumnId === group.columnId"
          @restore="handleUnarchiveColumn(group)"
        >
          <TaskCardsColumn
            :cards="group.cards"
            archived
            :can-edit="canEdit"
            :restoring-card-id="unarchivingCardId"
            @open-card="emit('open-card', $event)"
            @restore-card="handleUnarchiveCard"
          />
        </BoardColumnCard>
      </div>
    </BoardColumnsScrollArea>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { cardsClient, columnsClient } from "@/api";
import BoardColumnCard from "@/components/board-column/BoardColumnCard.vue";
import BoardColumnsScrollArea from "@/components/board-columns-scroll-area/BoardColumnsScrollArea.vue";
import TaskCardsColumn from "@/components/task-cards-column/TaskCardsColumn.vue";
import type { CardSummary, Column } from "@/types/models";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    boardId: string;
    canEdit?: boolean;
  }>(),
  {
    canEdit: false,
  },
);

const emit = defineEmits<{
  (e: "open-card", cardId: string): void;
}>();

interface ArchiveGroup {
  columnId: string;
  columnName: string;
  columnArchived: boolean;
  cards: CardSummary[];
}

const archivedColumns = ref<Column[]>([]);
const archivedCards = ref<CardSummary[]>([]);
const boardColumns = ref<Column[]>([]);
const loading = ref(false);
const loadError = ref("");

const unarchivingCardId = ref<string | null>(null);
const unarchivingColumnId = ref<string | null>(null);

const groups = computed<ArchiveGroup[]>(() => {
  const result: ArchiveGroup[] = [];
  const byColumnId = new Map<string, ArchiveGroup>();

  for (const column of archivedColumns.value) {
    const group: ArchiveGroup = { columnId: column.id, columnName: column.name, columnArchived: true, cards: [] };
    byColumnId.set(column.id, group);
    result.push(group);
  }

  for (const card of archivedCards.value) {
    let group = byColumnId.get(card.columnId);
    if (!group) {
      const activeColumn = boardColumns.value.find((column) => column.id === card.columnId);
      group = {
        columnId: card.columnId,
        columnName: activeColumn?.name ?? "Без колонки",
        columnArchived: false,
        cards: [],
      };
      byColumnId.set(card.columnId, group);
      result.push(group);
    }
    group.cards.push(card);
  }

  return result;
});

async function loadArchive(): Promise<void> {
  loading.value = true;
  loadError.value = "";
  try {
    const [columns, cards, allColumns] = await Promise.all([
      columnsClient.listArchived(props.boardId),
      cardsClient.listArchived(props.boardId),
      columnsClient.list(props.boardId),
    ]);
    archivedColumns.value = columns;
    archivedCards.value = cards;
    boardColumns.value = allColumns;
  } catch {
    loadError.value = "Не удалось загрузить архив";
  } finally {
    loading.value = false;
  }
}

async function handleUnarchiveCard(cardId: string): Promise<void> {
  unarchivingCardId.value = cardId;
  try {
    await cardsClient.unarchive(cardId);
    await loadArchive();
  } finally {
    unarchivingCardId.value = null;
  }
}

async function handleUnarchiveColumn(group: ArchiveGroup): Promise<void> {
  unarchivingColumnId.value = group.columnId;
  try {
    await columnsClient.unarchive(group.columnId);
    await loadArchive();
  } finally {
    unarchivingColumnId.value = null;
  }
}

watch(() => props.boardId, loadArchive);
onMounted(loadArchive);
</script>

<style scoped lang="scss">
@import "./styles";
</style>
