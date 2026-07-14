<template>
  <VTextarea
    :model-value="descriptionDraft"
    class="spaced-field"
    :class="{ 'field--readonly': !canEdit }"
    label="Описание"
    :readonly="!canEdit"
    rows="4"
    autocomplete="off"
    @update:model-value="(value) => emit('update:descriptionDraft', value)"
    @blur="saveDescription"
  />

  <VTextField
    :model-value="dueDateDraft"
    class="spaced-field"
    :class="{ 'field--readonly': !canEdit }"
    label="Срок выполнения"
    type="datetime-local"
    :readonly="!canEdit"
    autocomplete="off"
    @update:model-value="(value) => emit('update:dueDateDraft', value)"
    @change="saveDueDate"
  />

  <div v-if="canEdit || card.assignees.length" class="section">
    <div class="section-label">Исполнители</div>
    <div class="assignee-row">
      <div v-for="assignee in card.assignees" :key="assignee.id" class="assignee-card">
        <UserAvatar :name="assignee.displayName" size="32" class="assignee-avatar" />
        <div class="assignee-info">
          <div class="assignee-name">{{ assignee.displayName }}</div>
          <div class="assignee-email">{{ assignee.email }}</div>
        </div>
        <VBtn
          v-if="canEdit"
          icon
          variant="text"
          size="x-small"
          class="assignee-remove"
          @click="removeAssignee(assignee)"
        >
          <VIcon icon="mdi-close" size="14" />
        </VBtn>
      </div>
      <VMenu v-if="canEdit">
        <template #activator="{ props: menuProps }">
          <VBtn icon="mdi-plus" size="small" variant="tonal" v-bind="menuProps" />
        </template>
        <VList>
          <VListItem v-for="member in availableAssignees" :key="member.userId" @click="addAssignee(member)">
            <template #prepend>
              <UserAvatar :name="member.displayName" size="28" class="assignee-menu-avatar" />
            </template>
            <VListItemTitle>{{ member.displayName }}</VListItemTitle>
            <VListItemSubtitle>{{ member.email }}</VListItemSubtitle>
          </VListItem>
          <VListItem v-if="availableAssignees.length === 0" title="Нет доступных участников" />
        </VList>
      </VMenu>
    </div>
  </div>

  <div v-if="canEdit || card.labels.length" class="section">
    <div class="section-label">Метки</div>
    <div class="chip-row">
      <VChip
        v-for="label in card.labels"
        :key="label.id"
        :color="label.color"
        :closable="canEdit"
        label
        @click:close="removeLabel(label)"
      >
        {{ label.name }}
      </VChip>
      <VMenu v-if="canEdit" v-model="labelMenuOpen" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <VBtn icon="mdi-plus" size="small" variant="tonal" v-bind="menuProps" />
        </template>
        <VCard min-width="260">
          <VList>
            <VListItem v-for="label in availableLabels" :key="label.id">
              <template #prepend>
                <VChip :color="label.color" size="small" label>{{ label.name }}</VChip>
              </template>
              <template #append>
                <VBtn icon="mdi-plus" size="x-small" variant="text" @click="addLabel(label)" />
                <VBtn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteLabel(label)" />
              </template>
            </VListItem>
          </VList>
          <VCardText>
            <VTextField
              v-model="newLabelName"
              label="Название метки"
              density="compact"
              hide-details
              autocomplete="off"
            />
            <div class="color-row">
              <VBtn
                v-for="color in labelColors"
                :key="color"
                :color="color"
                icon
                size="x-small"
                :variant="newLabelColor === color ? 'flat' : 'tonal'"
                @click="newLabelColor = color"
              />
            </div>
            <VBtn class="create-label-button" size="small" color="primary" block @click="handleCreateLabel">
              Создать метку
            </VBtn>
          </VCardText>
        </VCard>
      </VMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { cardsClient } from "@/api";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import { useCardLabels, LABEL_COLORS, DEFAULT_LABEL_COLOR } from "@/composables/useCardLabels";
import type { BoardMember, CardDetail, User } from "@/types/models";

const props = defineProps<{
  cardId: string | null;
  card: CardDetail;
  canEdit: boolean;
  boardId: string;
  boardMembers: BoardMember[];
  descriptionDraft: string;
  dueDateDraft: string;
  saveDescription: () => void;
  saveDueDate: () => void;
  reload: () => Promise<void>;
  notifyChanged: () => void;
  refreshToken: number;
}>();

const emit = defineEmits<{
  (e: "update:descriptionDraft", value: string): void;
  (e: "update:dueDateDraft", value: string): void;
}>();

const availableAssignees = computed<BoardMember[]>(() => {
  const assignedIds = new Set(props.card.assignees.map((a) => a.id));
  return props.boardMembers.filter((m) => !assignedIds.has(m.userId));
});

async function addAssignee(member: BoardMember): Promise<void> {
  await cardsClient.addAssignee(props.card.id, member.userId);
  await props.reload();
  props.notifyChanged();
}

async function removeAssignee(assignee: User): Promise<void> {
  await cardsClient.removeAssignee(props.card.id, assignee.id);
  await props.reload();
  props.notifyChanged();
}

const labelMenuOpen = ref(false);
const newLabelName = ref("");
const newLabelColor = ref(DEFAULT_LABEL_COLOR);
const labelColors = LABEL_COLORS;

const { availableLabels, loadLabels, addLabel, removeLabel, deleteLabel, createLabel } = useCardLabels({
  boardId: () => props.boardId,
  card: () => props.card,
  reload: props.reload,
  notifyChanged: props.notifyChanged,
});

async function handleCreateLabel(): Promise<void> {
  await createLabel(newLabelName.value, newLabelColor.value);
  newLabelName.value = "";
}

watch(() => props.refreshToken, loadLabels, { immediate: true });
</script>

<style scoped lang="scss">
@import "./styles";
</style>
