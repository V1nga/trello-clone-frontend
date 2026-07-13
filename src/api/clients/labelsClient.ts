import { httpClient } from "@/api/http/httpClient";
import type { Label } from "@/types/models";
import type { components } from "@/types/api";

export type CreateLabelPayload = components["schemas"]["CreateLabelRequest"];

export const labelsClient = {
  async list(boardId: string): Promise<Label[]> {
    const response = await httpClient.get<Label[]>(`/boards/${boardId}/labels`);
    return response.data;
  },
  async create(boardId: string, payload: CreateLabelPayload): Promise<Label> {
    const response = await httpClient.post<Label>(`/boards/${boardId}/labels`, payload);
    return response.data;
  },
  async remove(labelId: string): Promise<void> {
    await httpClient.delete(`/labels/${labelId}`);
  },
};
