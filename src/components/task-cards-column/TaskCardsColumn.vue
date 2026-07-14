<template>
  <div>
    <draggable
      v-model="cards"
      item-key="id"
      group="board-cards"
      :disabled="!canEdit || archived"
      :force-fallback="true"
      :fallback-on-body="true"
      :class="['cards-list', { 'cards-list--empty': cards.length === 0 }]"
      ghost-class="card-ghost"
      @change="handleChange"
    >
      <template #item="{ element: card }">
        <TaskCard
          :card="card"
          :show-restore="archived && canEdit"
          :restoring="restoringCardId === card.id"
          @click="emit('open-card', card.id)"
          @restore="emit('restore-card', card.id)"
        />
      </template>
    </draggable>

    <div v-if="archived && !cards.length" class="cards-column-empty">Архивных карточек нет</div>

    <template v-if="!archived">
      <VBtn
        v-if="canEdit"
        class="add-card-trigger"
        :class="{ 'add-card-trigger--tight': cards.length === 0 }"
        variant="text"
        rounded="lg"
        prepend-icon="mdi-plus"
        block
        @click="addCardDialogOpen = true"
      >
        Добавить карточку
      </VBtn>

      <FormDialog
        v-model="addCardDialogOpen"
        max-width="360"
        title="Новая карточка"
        submit-label="Добавить"
        :loading="creating"
        @submit="handleCreate"
      >
        <VTextField
          v-model="newCardTitle"
          label="Название карточки"
          variant="outlined"
          density="comfortable"
          autofocus
          hide-details
        />
      </FormDialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import draggable from "vuedraggable";
import { cardsClient } from "@/api";
import TaskCard from "@/components/task-card/TaskCard.vue";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import type { CardSummary } from "@/types/models";

const props = withDefaults(
  defineProps<{
    columnId?: string;
    cards?: CardSummary[];
    canEdit?: boolean;
    archived?: boolean;
    refreshToken?: number;
    restoringCardId?: string | null;
  }>(),
  {
    columnId: undefined,
    cards: undefined,
    canEdit: false,
    archived: false,
    refreshToken: 0,
    restoringCardId: null,
  },
);

const emit = defineEmits<{
  (e: "open-card", cardId: string): void;
  (e: "restore-card", cardId: string): void;
}>();

interface DraggableChangeEvent {
  added?: { newIndex: number; element: CardSummary };
  moved?: { newIndex: number; element: CardSummary };
}

const cards = ref<CardSummary[]>(props.cards ?? []);
const newCardTitle = ref("");
const addCardDialogOpen = ref(false);
const creating = ref(false);

async function loadCards(): Promise<void> {
  if (!props.columnId) {
    return;
  }
  cards.value = await cardsClient.list(props.columnId);
}

async function handleChange(event: DraggableChangeEvent): Promise<void> {
  if (!props.canEdit || !props.columnId) {
    return;
  }
  if (event.added) {
    await cardsClient.move(event.added.element.id, { columnId: props.columnId, position: event.added.newIndex });
  } else if (event.moved) {
    await cardsClient.move(event.moved.element.id, { columnId: props.columnId, position: event.moved.newIndex });
  }
}

async function handleCreate(): Promise<void> {
  const title = newCardTitle.value.trim();
  if (!title || !props.columnId) {
    return;
  }
  creating.value = true;
  try {
    await cardsClient.create(props.columnId, { title });
    newCardTitle.value = "";
    addCardDialogOpen.value = false;
    await loadCards();
  } finally {
    creating.value = false;
  }
}

watch(
  () => props.cards,
  (value) => {
    if (value) {
      cards.value = value;
    }
  },
);
watch(() => props.refreshToken, loadCards);
onMounted(() => {
  if (!props.cards) {
    loadCards();
  }
});

defineExpose({ loadCards });
</script>

<style scoped lang="scss">
@import "./styles";
</style>
