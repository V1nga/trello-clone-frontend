<template>
  <VDialog :model-value="modelValue" :max-width="maxWidth" @update:model-value="emit('update:modelValue', $event)">
    <VCard rounded="xl" class="dialog-card">
      <VCardTitle>{{ title }}</VCardTitle>
      <VCardText>
        <VForm class="dialog-form" @submit.prevent="emit('submit')">
          <slot />
          <VAlert v-if="error" type="error" density="compact">{{ error }}</VAlert>
          <div class="dialog-buttons">
            <VBtn variant="tonal" color="grey-darken-2" @click="emit('update:modelValue', false)">
              {{ cancelLabel }}
            </VBtn>
            <VBtn type="submit" variant="flat" color="primary" :loading="loading">{{ submitLabel }}</VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    submitLabel: string;
    maxWidth?: string | number;
    cancelLabel?: string;
    loading?: boolean;
    error?: string;
  }>(),
  {
    maxWidth: 480,
    cancelLabel: "Отмена",
    loading: false,
    error: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit"): void;
}>();
</script>

<style scoped lang="scss">
@import "./styles";
</style>
