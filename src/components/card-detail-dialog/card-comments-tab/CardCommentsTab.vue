<template>
  <TabEmptyState v-if="!comments.length" text="Нет комментариев" />
  <div v-for="comment in comments" :key="comment.id" class="comment-block">
    <UserAvatar :name="comment.authorDisplayName" size="28" class="comment-avatar" />
    <div class="comment-body">
      <div class="comment-author">
        {{ comment.authorDisplayName }}
        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
      </div>
      <div class="comment-text">{{ comment.text }}</div>
    </div>
  </div>
  <template v-if="canEdit">
    <VTextarea v-model="newCommentText" class="comment-field" label="Комментарий" rows="2" density="compact" />
    <div class="comment-actions">
      <VBtn color="primary" prepend-icon="mdi-send" @click="addComment">Отправить</VBtn>
    </div>
  </template>
</template>

<script setup lang="ts">
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import TabEmptyState from "@/components/card-detail-dialog/tab-empty-state/TabEmptyState.vue";
import { useCardComments } from "@/composables/useCardComments";

const props = defineProps<{
  cardId: string | null;
  canEdit: boolean;
  refreshToken: number;
}>();

const { comments, newCommentText, addComment } = useCardComments({
  cardId: () => props.cardId,
  refreshToken: () => props.refreshToken,
});

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
