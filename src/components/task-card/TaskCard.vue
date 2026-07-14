<template>
  <VCard class="card-item" rounded="lg" @click="emit('click')">
    <VCardText class="card-text">
      <div class="card-title">{{ card.title }}</div>
      <div v-if="card.labels && card.labels.length" class="card-row">
        <VChip v-for="label in card.labels" :key="label.id" :color="label.color" size="small" label>
          {{ label.name }}
        </VChip>
      </div>
      <div v-if="(card.assignees && card.assignees.length) || card.dueDate" class="card-footer">
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
        <div v-if="card.dueDate" class="due-date">{{ formatDate(card.dueDate) }}</div>
      </div>
      <VBtn
        v-if="showRestore"
        variant="flat"
        prepend-icon="mdi-arrow-u-left-top"
        class="restore-card-btn"
        block
        :loading="restoring"
        @click.stop="emit('restore')"
      >
        Восстановить
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import type { CardSummary } from "@/types/models";

withDefaults(
  defineProps<{
    card: CardSummary;
    showRestore?: boolean;
    restoring?: boolean;
  }>(),
  {
    showRestore: false,
    restoring: false,
  },
);

const emit = defineEmits<{
  (e: "click"): void;
  (e: "restore"): void;
}>();

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
