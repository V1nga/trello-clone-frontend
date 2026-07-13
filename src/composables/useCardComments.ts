import { ref, watch } from "vue";
import { commentsClient } from "@/api";
import type { Comment } from "@/types/models";

export function useCardComments(options: { cardId: () => string | null; refreshToken: () => number }) {
  const comments = ref<Comment[]>([]);
  const newCommentText = ref("");

  async function loadComments(): Promise<void> {
    const cardId = options.cardId();
    if (!cardId) {
      return;
    }
    const page = await commentsClient.list(cardId);
    comments.value = page.content.slice().reverse();
  }

  async function addComment(): Promise<void> {
    const text = newCommentText.value.trim();
    const cardId = options.cardId();
    if (!text || !cardId) {
      return;
    }
    await commentsClient.create(cardId, { text });
    newCommentText.value = "";
    await loadComments();
  }

  watch(options.refreshToken, loadComments, { immediate: true });

  return { comments, newCommentText, loadComments, addComment };
}
