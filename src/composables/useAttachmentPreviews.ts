import { onUnmounted, reactive, watch } from "vue";
import { attachmentsClient } from "@/api";
import type { Attachment } from "@/types/models";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];

export function extension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

export function isImage(attachment: Attachment): boolean {
  if (attachment.contentType?.startsWith("image/")) {
    return true;
  }
  return IMAGE_EXTENSIONS.includes(extension(attachment.filename).toLowerCase());
}

const DEFAULT_FILE_COLOR = "#6b7280";

const FILE_TYPE_COLORS: Record<string, string> = {
  docx: "#2563eb",
  doc: "#2563eb",
  xlsx: "#16a34a",
  xls: "#16a34a",
  csv: "#16a34a",
  pdf: "#dc2626",
  pptx: "#f97316",
  ppt: "#f97316",
};

export function placeholderColor(filename: string): string {
  const ext = extension(filename).toLowerCase();
  return FILE_TYPE_COLORS[ext] || DEFAULT_FILE_COLOR;
}

export function useAttachmentPreviews(attachments: () => Attachment[]) {
  const previewUrls = reactive<Record<string, string>>({});

  async function sync(): Promise<void> {
    const list = attachments();
    const currentIds = new Set(list.map((a) => a.id));
    for (const id of Object.keys(previewUrls)) {
      if (!currentIds.has(id)) {
        URL.revokeObjectURL(previewUrls[id]);
        delete previewUrls[id];
      }
    }
    await Promise.all(
      list
        .filter((a) => isImage(a) && !previewUrls[a.id])
        .map(async (a) => {
          previewUrls[a.id] = await attachmentsClient.getPreviewUrl(a.id);
        }),
    );
  }

  watch(attachments, sync, { immediate: true });

  onUnmounted(() => {
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
  });

  return { previewUrls, sync };
}
