import { httpClient } from "@/api/http/httpClient";
import type { Board, BoardMember, Page } from "@/types/models";
import type { components } from "@/types/api";

export type CreateBoardPayload = components["schemas"]["CreateBoardRequest"];
export type UpdateBoardPayload = components["schemas"]["UpdateBoardRequest"];
export type InviteMemberPayload = components["schemas"]["InviteMemberRequest"];
export type UpdateMemberRolePayload = components["schemas"]["UpdateMemberRoleRequest"];

export const boardsClient = {
  async list(page = 0, size = 20): Promise<Page<Board>> {
    const response = await httpClient.get<Page<Board>>("/boards", { params: { page, size } });
    return response.data;
  },
  async create(payload: CreateBoardPayload): Promise<Board> {
    const response = await httpClient.post<Board>("/boards", payload);
    return response.data;
  },
  async get(boardId: string): Promise<Board> {
    const response = await httpClient.get<Board>(`/boards/${boardId}`);
    return response.data;
  },
  async update(boardId: string, payload: UpdateBoardPayload): Promise<Board> {
    const response = await httpClient.patch<Board>(`/boards/${boardId}`, payload);
    return response.data;
  },
  async remove(boardId: string): Promise<void> {
    await httpClient.delete(`/boards/${boardId}`);
  },
  async listMembers(boardId: string): Promise<BoardMember[]> {
    const response = await httpClient.get<BoardMember[]>(`/boards/${boardId}/members`);
    return response.data;
  },
  async inviteMember(boardId: string, payload: InviteMemberPayload): Promise<BoardMember> {
    const response = await httpClient.post<BoardMember>(`/boards/${boardId}/members`, payload);
    return response.data;
  },
  async updateMemberRole(boardId: string, userId: string, payload: UpdateMemberRolePayload): Promise<BoardMember> {
    const response = await httpClient.patch<BoardMember>(`/boards/${boardId}/members/${userId}`, payload);
    return response.data;
  },
  async removeMember(boardId: string, userId: string): Promise<void> {
    await httpClient.delete(`/boards/${boardId}/members/${userId}`);
  },
};
