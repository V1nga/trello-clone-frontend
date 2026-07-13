import { httpClient } from "@/api/http/httpClient";
import type { Column } from "@/types/models";
import type { components } from "@/types/api";

export type CreateColumnPayload = components["schemas"]["CreateColumnRequest"];
export type RenameColumnPayload = components["schemas"]["RenameColumnRequest"];
export type MoveColumnPayload = components["schemas"]["MoveColumnRequest"];

export const columnsClient = {
  async list(boardId: string): Promise<Column[]> {
    const response = await httpClient.get<Column[]>(`/boards/${boardId}/columns`);
    return response.data;
  },
  async create(boardId: string, payload: CreateColumnPayload): Promise<Column> {
    const response = await httpClient.post<Column>(`/boards/${boardId}/columns`, payload);
    return response.data;
  },
  async rename(columnId: string, payload: RenameColumnPayload): Promise<Column> {
    const response = await httpClient.patch<Column>(`/columns/${columnId}`, payload);
    return response.data;
  },
  async move(columnId: string, payload: MoveColumnPayload): Promise<Column> {
    const response = await httpClient.post<Column>(`/columns/${columnId}/move`, payload);
    return response.data;
  },
  async archive(columnId: string): Promise<void> {
    await httpClient.post(`/columns/${columnId}/archive`);
  },
};
