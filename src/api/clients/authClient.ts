import { httpClient } from "@/api/http/httpClient";
import type { AuthSession, User } from "@/types/models";
import type { components } from "@/types/api";

export type RegisterPayload = components["schemas"]["RegisterRequest"];
export type LoginPayload = components["schemas"]["LoginRequest"];
export type UpdateProfilePayload = components["schemas"]["UpdateProfileRequest"];

export const authClient = {
  async register(payload: RegisterPayload): Promise<AuthSession> {
    const response = await httpClient.post<AuthSession>("/auth/register", payload);
    return response.data;
  },
  async login(payload: LoginPayload): Promise<AuthSession> {
    const response = await httpClient.post<AuthSession>("/auth/login", payload);
    return response.data;
  },
  async fetchMe(): Promise<User> {
    const response = await httpClient.get<User>("/users/me");
    return response.data;
  },
  async updateMe(payload: UpdateProfilePayload): Promise<User> {
    const response = await httpClient.patch<User>("/users/me", payload);
    return response.data;
  },
};
