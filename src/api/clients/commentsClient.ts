import { httpClient } from "@/api/http/httpClient";
import type { Comment, Page } from "@/types/models";
import type { components } from "@/types/api";

export type CreateCommentPayload = components["schemas"]["CreateCommentRequest"];

const COMMENTS_PAGE_SIZE = 50;

export const commentsClient = {
  async list(cardId: string): Promise<Page<Comment>> {
    const response = await httpClient.get<Page<Comment>>(`/cards/${cardId}/comments`, {
      params: { size: COMMENTS_PAGE_SIZE },
    });
    return response.data;
  },
  async create(cardId: string, payload: CreateCommentPayload): Promise<Comment> {
    const response = await httpClient.post<Comment>(`/cards/${cardId}/comments`, payload);
    return response.data;
  },
};
