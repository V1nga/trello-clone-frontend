import { httpClient } from "@/api/http/httpClient";
import type { Page, User } from "@/types/models";

export const usersClient = {
  async search(query: string, page = 0, size = 20): Promise<Page<User>> {
    const response = await httpClient.get<Page<User>>("/users/search", { params: { query, page, size } });
    return response.data;
  },
};
