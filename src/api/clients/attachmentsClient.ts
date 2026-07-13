import { httpClient } from "@/api/http/httpClient";
import type { Attachment } from "@/types/models";

async function fetchBlob(attachmentId: string): Promise<Blob> {
  const response = await httpClient.get(`/attachments/${attachmentId}`, { responseType: "blob" });
  return response.data;
}

export const attachmentsClient = {
  async upload(cardId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post<Attachment>(`/cards/${cardId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  async download(attachment: Attachment): Promise<void> {
    const blob = await fetchBlob(attachment.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  async getPreviewUrl(attachmentId: string): Promise<string> {
    const blob = await fetchBlob(attachmentId);
    return window.URL.createObjectURL(blob);
  },
  async remove(attachmentId: string): Promise<void> {
    await httpClient.delete(`/attachments/${attachmentId}`);
  },
};
