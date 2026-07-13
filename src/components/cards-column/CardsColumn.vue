<template>
  <div>
    <draggable
      v-model="cards"
      item-key="id"
      group="board-cards"
      :disabled="!canEdit"
      :force-fallback="true"
      :fallback-on-body="true"
      :class="['cards-list', { 'cards-list--empty': cards.length === 0 }]"
      ghost-class="card-ghost"
      @change="handleChange"
    >
      <template #item="{ element: card }">
        <VCard class="card-item" rounded="lg" @click="emit('open-card', card.id)">
          <VCardText class="card-text">
            <div class="card-title">{{ card.title }}</div>
            <div v-if="card.labels && card.labels.length" class="card-row">
              <VChip
                v-for="label in card.labels"
                :key="label.id"
                :color="label.color"
                size="small"
                label
              >
                {{ label.name }}
              </VChip>
            </div>
            <div
              v-if="(card.assignees && card.assignees.length) || card.dueDate"
              class="card-footer"
            >
              <div v-if="card.assignees && card.assignees.length" class="card-avatars">
                <UserAvatar
                  v-for="user in card.assignees"
                  :key="user.id"
                  :name="user.displayName"
                  size="28"
                  initials-size="11px"
                  class="card-avatar"
                />
              </div>
              <div v-else />
              <div v-if="card.dueDate" class="due-date">
                {{ formatDate(card.dueDate) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </template>
    </draggable>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import draggable from "vuedraggable";
import { cardsClient } from "@/api";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import type { CardSummary } from "@/types/models";

const props = withDefaults(
  defineProps<{
    columnId: string;
    canEdit?: boolean;
    refreshToken?: number;
  }>(),
  {
    canEdit: false,
    refreshToken: 0,
  },
);

const emit = defineEmits<{
  (e: "open-card", cardId: string): void;
}>();

interface DraggableChangeEvent {
  added?: { newIndex: number; element: CardSummary };
  moved?: { newIndex: number; element: CardSummary };
}

const cards = ref<CardSummary[]>([]);
const newCardTitle = ref("");
const addCardDialogOpen = ref(false);
const creating = ref(false);

async function loadCards(): Promise<void> {
  cards.value = await cardsClient.list(props.columnId);
}

async function handleChange(event: DraggableChangeEvent): Promise<void> {
  if (!props.canEdit) {
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
  if (!title) {
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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

watch(() => props.refreshToken, loadCards);
onMounted(loadCards);

defineExpose({ loadCards });
</script>

<style scoped lang="scss">
@import "./styles";
</style>
