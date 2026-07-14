<template>
  <div class="board-view-root">
    <VAlert v-if="loadError" class="load-error" type="error" density="compact">{{ loadError }}</VAlert>

    <BoardColumnsScrollArea ignore-selector=".column-card, .add-column-trigger">
      <draggable
        v-model="columns"
        item-key="id"
        :disabled="!canEdit"
        draggable=".column-card"
        :force-fallback="true"
        :fallback-on-body="true"
        class="columns-row"
        ghost-class="column-ghost"
        @end="handleReorder"
      >
        <template #item="{ element: col }">
          <BoardColumnCard
            :name="col.name"
            :readonly="!canEdit"
            :is-editing-name="editingId === col.id"
            :editing-name-value="editingValue"
            :show-archive-button="canEdit"
            @update:editing-name-value="editingValue = $event"
            @start-rename="startRename(col)"
            @save-rename="saveRename(col)"
            @archive="handleArchive(col)"
          >
            <TaskCardsColumn
              :column-id="col.id"
              :can-edit="canEdit"
              :refresh-token="cardsRefreshToken"
              @open-card="(cardId: string) => emit('open-card', cardId)"
            />
          </BoardColumnCard>
        </template>
        <template #footer>
          <VBtn
            v-if="canEdit"
            class="add-column-trigger"
            variant="text"
            rounded="lg"
            prepend-icon="mdi-plus"
            @click="addColumnDialogOpen = true"
          >
            Добавить колонку
          </VBtn>
        </template>
      </draggable>
    </BoardColumnsScrollArea>

    <FormDialog
      v-model="addColumnDialogOpen"
      max-width="360"
      title="Новая колонка"
      submit-label="Добавить"
      :loading="creating"
      @submit="handleCreateColumn"
    >
      <VTextField
        v-model="newColumnName"
        label="Название колонки"
        variant="outlined"
        density="comfortable"
        autofocus
        hide-details
      />
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import draggable from "vuedraggable";
import { columnsClient } from "@/api";
import BoardColumnCard from "@/components/board-column/BoardColumnCard.vue";
import BoardColumnsScrollArea from "@/components/board-columns-scroll-area/BoardColumnsScrollArea.vue";
import TaskCardsColumn from "@/components/task-cards-column/TaskCardsColumn.vue";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import { useConfirmAction } from "@/composables/useConfirmAction";
import { useInlineEdit } from "@/composables/useInlineEdit";
import type { Column } from "@/types/models";

const props = withDefaults(
  defineProps<{
    boardId: string;
    canEdit?: boolean;
    cardsRefreshToken?: number;
  }>(),
  {
    canEdit: false,
    cardsRefreshToken: 0,
  },
);

const emit = defineEmits<{
  (e: "open-card", cardId: string): void;
}>();

const columns = ref<Column[]>([]);
const loadError = ref("");

const newColumnName = ref("");
const creating = ref(false);
const addColumnDialogOpen = ref(false);

const { confirmAction } = useConfirmAction();

async function loadColumns(): Promise<void> {
  loadError.value = "";
  try {
    columns.value = await columnsClient.list(props.boardId);
  } catch {
    loadError.value = "Не удалось загрузить колонки";
  }
}

const {
  editingId,
  editingValue,
  start: startRename,
  save: saveRename,
} = useInlineEdit<Column>(
  (col) => col.name,
  async (col, value) => {
    col.name = value;
    await columnsClient.rename(col.id, { name: value });
  },
);

async function handleArchive(col: Column): Promise<void> {
  await confirmAction(`Архивировать колонку "${col.name}"? Карточки внутри тоже будут архивированы.`, async () => {
    await columnsClient.archive(col.id);
    await loadColumns();
  });
}

async function handleReorder(event: { newIndex?: number }): Promise<void> {
  if (!props.canEdit || event.newIndex === undefined) {
    return;
  }
  const movedColumn = columns.value[event.newIndex];
  await columnsClient.move(movedColumn.id, { position: event.newIndex });
  await loadColumns();
}

async function handleCreateColumn(): Promise<void> {
  const name = newColumnName.value.trim();
  if (!name) {
    return;
  }
  creating.value = true;
  try {
    await columnsClient.create(props.boardId, { name });
    newColumnName.value = "";
    addColumnDialogOpen.value = false;
    await loadColumns();
  } finally {
    creating.value = false;
  }
}

watch(() => props.boardId, loadColumns);
onMounted(loadColumns);
</script>

<style scoped lang="scss">
@import "./styles";
</style>
