<template>
  <div>
    <VAlert v-if="loadError" class="load-error" type="error" density="compact">{{ loadError }}</VAlert>

    <div
      ref="scrollAreaRef"
      class="columns-scroll-area"
      :class="{ 'columns-scroll-area--dragging': isDragging }"
      @mousedown="(event) => handleDragStart(event, '.column-card, .add-column-trigger')"
    >
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
          <VCard
            width="280"
            min-width="280"
            class="column-card"
            :class="{ 'column-card--readonly': !canEdit }"
            rounded="lg"
          >
            <VCardTitle class="column-title-row">
              <VTextField
                v-if="editingId === col.id"
                v-model="editingValue"
                density="compact"
                hide-details
                autofocus
                @keyup.enter="saveRename(col)"
                @blur="saveRename(col)"
              />
              <span v-else class="column-name" @click="canEdit && startRename(col)">
                {{ col.name }}
              </span>
              <VBtn v-if="canEdit" icon variant="text" size="x-small" @click="handleArchive(col)">
                <VIcon icon="mdi-archive-outline" size="16" />
              </VBtn>
            </VCardTitle>
            <VCardText>
              <CardsColumn
                :column-id="col.id"
                :can-edit="canEdit"
                :refresh-token="cardsRefreshToken"
                @open-card="(cardId: string) => emit('open-card', cardId)"
              />
            </VCardText>
          </VCard>
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
    </div>

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
import CardsColumn from "@/components/cards-column/CardsColumn.vue";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import { useConfirmAction } from "@/composables/useConfirmAction";
import { useDragScroll } from "@/composables/useDragScroll";
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
const scrollAreaRef = ref<HTMLElement | null>(null);
const { isDragging, handleDragStart } = useDragScroll(scrollAreaRef);

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
