import { defineStore } from "pinia";
import { authClient, TOKEN_STORAGE_KEY, type LoginPayload, type RegisterPayload, type UpdateProfilePayload } from "@/api";
import type { User } from "@/types/models";

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem(TOKEN_STORAGE_KEY) || null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },

  actions: {
    setSession(accessToken: string, user: User) {
      this.token = accessToken;
      this.user = user;
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    },

    async register(payload: RegisterPayload) {
      const data = await authClient.register(payload);
      this.setSession(data.accessToken, data.user);
    },

    async login(payload: LoginPayload) {
      const data = await authClient.login(payload);
      this.setSession(data.accessToken, data.user);
    },

    async fetchProfile() {
      this.user = await authClient.fetchMe();
    },

    async updateProfile(payload: UpdateProfilePayload) {
      this.user = await authClient.updateMe(payload);
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
  },
});
