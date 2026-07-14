<template>
  <VCard width="280" min-width="280" class="column-card" :class="{ 'column-card--readonly': readonly }" rounded="lg">
    <VCardTitle class="column-title-row">
      <VTextField
        v-if="isEditingName"
        :model-value="editingNameValue"
        density="compact"
        hide-details
        autofocus
        autocomplete="off"
        @update:model-value="emit('update:editingNameValue', String($event))"
        @keyup.enter="emit('save-rename')"
        @blur="emit('save-rename')"
      />
      <span v-else class="column-name" @click="!readonly && emit('start-rename')">{{ name }}</span>
      <VBtn v-if="showArchiveButton" icon variant="text" size="x-small" @click="emit('archive')">
        <VIcon icon="mdi-archive-outline" size="16" />
      </VBtn>
      <VBtn
        v-if="showRestoreButton"
        icon
        variant="text"
        size="x-small"
        class="restore-column-btn"
        :loading="restoring"
        @click="emit('restore')"
      >
        <VIcon icon="mdi-arrow-u-left-top" size="16" />
      </VBtn>
    </VCardTitle>
    <VCardText>
      <slot />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string;
    readonly?: boolean;
    isEditingName?: boolean;
    editingNameValue?: string;
    showArchiveButton?: boolean;
    showRestoreButton?: boolean;
    restoring?: boolean;
  }>(),
  {
    readonly: false,
    isEditingName: false,
    editingNameValue: "",
    showArchiveButton: false,
    showRestoreButton: false,
    restoring: false,
  },
);

const emit = defineEmits<{
  (e: "update:editingNameValue", value: string): void;
  (e: "start-rename"): void;
  (e: "save-rename"): void;
  (e: "archive"): void;
  (e: "restore"): void;
}>();
</script>

<style scoped lang="scss">
@import "./styles";
</style>
