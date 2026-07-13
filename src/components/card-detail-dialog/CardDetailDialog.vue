<template>
  <VDialog :model-value="modelValue" max-width="720" scrollable @update:model-value="handleDialogUpdate">
    <VCard v-if="card">
      <VCardTitle class="header-row">
        <VTextField
          v-model="titleDraft"
          class="title-field"
          :readonly="!canEdit"
          density="compact"
          hide-details
          variant="plain"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
        />
        <VBtn
          v-if="canEdit"
          variant="text"
          color="error"
          prepend-icon="mdi-archive-outline"
          class="archive-btn"
          @click="handleArchive"
        >
          Архивировать
        </VBtn>
        <VBtn icon variant="text" class="close-btn" @click="close">
          <VIcon icon="mdi-close" size="22" />
        </VBtn>
      </VCardTitle>

      <VTabs v-model="tab" class="dialog-tabs">
        <VTab value="details">Детали</VTab>
        <VTab value="checklists">Чек-листы</VTab>
        <VTab value="comments">Комментарии</VTab>
        <VTab value="attachments">Вложения</VTab>
      </VTabs>

      <VCardText class="tab-content">
        <VWindow v-model="tab">
          <VWindowItem value="details">
            <CardDetailsTab
              v-model:description-draft="descriptionDraft"
              v-model:due-date-draft="dueDateDraft"
              :card-id="cardId"
              :card="card"
              :can-edit="canEdit"
              :board-id="boardId"
              :board-members="boardMembers"
              :save-description="saveDescription"
              :save-due-date="saveDueDate"
              :reload="loadCard"
              :notify-changed="notifyChanged"
              :refresh-token="openToken"
            />
          </VWindowItem>

          <VWindowItem value="checklists">
            <CardChecklistsTab :card-id="cardId" :card="card" :can-edit="canEdit" :reload="loadCard" />
          </VWindowItem>

          <VWindowItem value="comments">
            <CardCommentsTab :card-id="cardId" :can-edit="canEdit" :refresh-token="openToken" />
          </VWindowItem>

          <VWindowItem value="attachments">
            <CardAttachmentsTab :card-id="cardId" :card="card" :can-edit="canEdit" :reload="loadCard" />
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCard } from "@/composables/useCard";
import CardDetailsTab from "./card-details-tab/CardDetailsTab.vue";
import CardChecklistsTab from "./card-checklists-tab/CardChecklistsTab.vue";
import CardCommentsTab from "./card-comments-tab/CardCommentsTab.vue";
import CardAttachmentsTab from "./card-attachments-tab/CardAttachmentsTab.vue";
import type { BoardMember } from "@/types/models";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    cardId: string | null;
    boardId: string;
    canEdit?: boolean;
    boardMembers?: BoardMember[];
  }>(),
  {
    canEdit: false,
    boardMembers: () => [],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "changed"): void;
}>();

const tab = ref("details");
const openToken = ref(0);

function handleDialogUpdate(value: boolean): void {
  emit("update:modelValue", value);
}

function close(): void {
  emit("update:modelValue", false);
}

function notifyChanged(): void {
  emit("changed");
}

const { card, titleDraft, descriptionDraft, dueDateDraft, loadCard, saveTitle, saveDescription, saveDueDate, handleArchive } =
  useCard({
    cardId: () => props.cardId,
    canEdit: () => props.canEdit,
    onChanged: notifyChanged,
    onClose: close,
  });

watch(
  () => [props.modelValue, props.cardId],
  ([open]) => {
    if (open && props.cardId) {
      tab.value = "details";
      openToken.value += 1;
      loadCard();
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
@import "./styles";
</style>
