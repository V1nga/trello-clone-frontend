<template>
  <template v-for="(checklist, index) in card.checklists" :key="checklist.id">
    <VDivider v-if="index > 0" class="checklist-divider" />
    <div class="checklist-block">
      <div class="checklist-header">
        <span class="checklist-title">{{ checklist.title }}</span>
        <span class="checklist-progress">{{ doneCount(checklist) }}/{{ checklist.items.length }}</span>
      </div>
      <VCheckbox
        v-for="item in checklist.items"
        :key="item.id"
        :model-value="item.done"
        :readonly="!canEdit"
        :class="{ 'checklist-item--readonly': !canEdit }"
        :label="item.text"
        density="compact"
        hide-details
        @update:model-value="(done) => toggleItem(item, Boolean(done))"
      />
      <VTextField
        v-if="canEdit"
        v-model="newItemText[checklist.id]"
        class="checklist-item-field"
        density="compact"
        variant="plain"
        placeholder="+ Добавить пункт"
        hide-details
        @keyup.enter="addItem(checklist)"
      />
    </div>
  </template>
  <div class="checklist-actions">
    <VBtn
      v-if="canEdit"
      variant="tonal"
      color="primary"
      prepend-icon="mdi-plus"
      class="add-checklist-trigger"
      @click="checklistDialogOpen = true"
    >
      Добавить чек-лист
    </VBtn>
  </div>

  <FormDialog
    v-model="checklistDialogOpen"
    max-width="360"
    title="Новый чек-лист"
    submit-label="Добавить"
    @submit="createChecklist"
  >
    <VTextField v-model="newChecklistTitle" label="Название чек-листа" autofocus hide-details />
  </FormDialog>
</template>

<script setup lang="ts">
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import { useCardChecklists } from "@/composables/useCardChecklists";
import type { CardDetail } from "@/types/models";

const props = defineProps<{
  cardId: string | null;
  card: CardDetail;
  canEdit: boolean;
  reload: () => Promise<void>;
}>();

const { newChecklistTitle, newItemText, checklistDialogOpen, doneCount, toggleItem, addItem, createChecklist } =
  useCardChecklists({
    cardId: () => props.cardId,
    canEdit: () => props.canEdit,
    reload: props.reload,
  });
</script>

<style scoped lang="scss">
@import "./styles";
</style>
