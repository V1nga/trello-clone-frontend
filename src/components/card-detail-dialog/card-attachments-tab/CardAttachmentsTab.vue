<template>
  <div v-if="card.attachments.length" class="attachments-list">
    <div v-for="attachment in card.attachments" :key="attachment.id" class="attachment-row">
      <img
        v-if="isImage(attachment) && previewUrls[attachment.id]"
        v-fullscreen-image="{ imageUrl: previewUrls[attachment.id], imageAlt: attachment.filename }"
        :src="previewUrls[attachment.id]"
        :alt="attachment.filename"
        class="attachment-thumb"
      />
      <div v-else-if="isImage(attachment)" class="attachment-placeholder" style="background: #6b7280">
        <VProgressCircular indeterminate size="18" width="2" color="white" />
      </div>
      <div v-else class="attachment-placeholder" :style="{ background: placeholderColor(attachment.filename) }">
        {{ extension(attachment.filename) }}
      </div>

      <span class="attachment-filename" :title="attachment.filename">{{ attachment.filename }}</span>

      <div class="attachment-row-actions">
        <VBtn icon variant="text" size="small" color="primary" @click="downloadAttachment(attachment)">
          <VIcon icon="mdi-download" size="18" />
        </VBtn>
        <VBtn v-if="canEdit" icon variant="text" size="small" color="error" @click="deleteAttachment(attachment)">
          <VIcon icon="mdi-delete-outline" size="18" />
        </VBtn>
      </div>
    </div>
  </div>
  <p v-else class="attachments-empty">Нет вложений</p>

  <input v-if="canEdit" ref="fileInputRef" type="file" class="hidden-file-input" @change="handleFileInputChange" />
  <div class="attachments-actions">
    <VBtn
      v-if="canEdit"
      variant="tonal"
      color="primary"
      prepend-icon="mdi-paperclip"
      class="attach-btn"
      @click="triggerFileInput"
    >
      Прикрепить файл
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { attachmentsClient } from "@/api";
import { useAttachmentPreviews, isImage, extension, placeholderColor } from "@/composables/useAttachmentPreviews";
import { useConfirmAction } from "@/composables/useConfirmAction";
import type { Attachment, CardDetail } from "@/types/models";

const props = defineProps<{
  cardId: string | null;
  card: CardDetail;
  canEdit: boolean;
  reload: () => Promise<void>;
}>();

const { previewUrls } = useAttachmentPreviews(() => props.card.attachments);
const { confirmAction } = useConfirmAction();

const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput(): void {
  fileInputRef.value?.click();
}

async function handleFileInputChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !props.cardId) {
    return;
  }
  await attachmentsClient.upload(props.cardId, file);
  input.value = "";
  await props.reload();
}

function downloadAttachment(attachment: Attachment): void {
  attachmentsClient.download(attachment);
}

async function deleteAttachment(attachment: Attachment): Promise<void> {
  await confirmAction(`Удалить файл "${attachment.filename}"?`, async () => {
    await attachmentsClient.remove(attachment.id);
    await props.reload();
  });
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
