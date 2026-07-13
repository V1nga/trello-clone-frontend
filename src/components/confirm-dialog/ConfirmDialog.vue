<template>
  <VDialog :model-value="Boolean(confirmRequest)" max-width="420" @update:model-value="handleCancel">
    <VCard v-if="confirmRequest" rounded="xl" class="confirm-card">
      <VCardTitle class="confirm-title">
        <VIcon icon="mdi-alert-circle-outline" color="error" size="22" />
        Подтверждение
      </VCardTitle>
      <VCardText class="confirm-message">{{ confirmRequest.message }}</VCardText>
      <div class="confirm-buttons">
        <VBtn variant="tonal" color="grey-darken-2" @click="handleCancel">Отмена</VBtn>
        <VBtn variant="flat" color="error" @click="handleConfirm">Подтвердить</VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { confirmRequest, resolveConfirmation } from "@/composables/confirmDialogState";

function handleConfirm(): void {
  resolveConfirmation(true);
}

function handleCancel(): void {
  resolveConfirmation(false);
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
