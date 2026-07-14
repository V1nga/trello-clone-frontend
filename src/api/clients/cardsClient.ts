import { httpClient } from "@/api/http/httpClient";
import type { CardDetail, CardSummary, Page } from "@/types/models";
import type { components } from "@/types/api";

export type CreateCardPayload = components["schemas"]["CreateCardRequest"];
export type MoveCardPayload = components["schemas"]["MoveCardRequest"];

export type UpdateCardPayload = Omit<components["schemas"]["UpdateCardRequest"], "description" | "dueDate"> & {
  description: string | null;
  dueDate: string | null;
};

export const cardsClient = {
  async list(columnId: string): Promise<CardSummary[]> {
    const response = await httpClient.get<CardSummary[]>(`/columns/${columnId}/cards`);
    return response.data;
  },
  async create(columnId: string, payload: CreateCardPayload): Promise<CardSummary> {
    const response = await httpClient.post<CardSummary>(`/columns/${columnId}/cards`, payload);
    return response.data;
  },
  async get(cardId: string): Promise<CardDetail> {
    const response = await httpClient.get<CardDetail>(`/cards/${cardId}`);
    return response.data;
  },
  async search(boardId: string, query: string, page = 0, size = 20): Promise<Page<CardSummary>> {
    const response = await httpClient.get<Page<CardSummary>>(`/boards/${boardId}/cards/search`, {
      params: { query, page, size },
    });
    return response.data;
  },
  async update(cardId: string, payload: UpdateCardPayload): Promise<CardDetail> {
    const response = await httpClient.patch<CardDetail>(`/cards/${cardId}`, payload);
    return response.data;
  },
  async move(cardId: string, payload: MoveCardPayload): Promise<CardDetail> {
    const response = await httpClient.post<CardDetail>(`/cards/${cardId}/move`, payload);
    return response.data;
  },
  async archive(cardId: string): Promise<void> {
    await httpClient.post(`/cards/${cardId}/archive`);
  },
  async addAssignee(cardId: string, userId: string): Promise<void> {
    await httpClient.put(`/cards/${cardId}/assignees/${userId}`);
  },
  async removeAssignee(cardId: string, userId: string): Promise<void> {
    await httpClient.delete(`/cards/${cardId}/assignees/${userId}`);
  },
  async addLabel(cardId: string, labelId: string): Promise<void> {
    await httpClient.post(`/cards/${cardId}/labels/${labelId}`);
  },
  async removeLabel(cardId: string, labelId: string): Promise<void> {
    await httpClient.delete(`/cards/${cardId}/labels/${labelId}`);
  },
};
