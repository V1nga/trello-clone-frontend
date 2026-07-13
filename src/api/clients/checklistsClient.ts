import { httpClient } from "@/api/http/httpClient";
import type { Checklist, ChecklistItem } from "@/types/models";
import type { components } from "@/types/api";

export type CreateChecklistPayload = components["schemas"]["CreateChecklistRequest"];
export type CreateChecklistItemPayload = components["schemas"]["CreateChecklistItemRequest"];
export type UpdateChecklistItemPayload = components["schemas"]["UpdateChecklistItemRequest"];

export const checklistsClient = {
  async create(cardId: string, payload: CreateChecklistPayload): Promise<Checklist> {
    const response = await httpClient.post<Checklist>(`/cards/${cardId}/checklists`, payload);
    return response.data;
  },
  async addItem(checklistId: string, payload: CreateChecklistItemPayload): Promise<ChecklistItem> {
    const response = await httpClient.post<ChecklistItem>(`/checklists/${checklistId}/items`, payload);
    return response.data;
  },
  async updateItem(itemId: string, payload: UpdateChecklistItemPayload): Promise<ChecklistItem> {
    const response = await httpClient.patch<ChecklistItem>(`/checklist-items/${itemId}`, payload);
    return response.data;
  },
};
