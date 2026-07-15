import type { AuthResponse } from "./types";
import { request } from "./request";

export const authApi = {
  register(body: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }): Promise<AuthResponse> {
    return request("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: { username: string; password: string }): Promise<AuthResponse> {
    return request("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  logout(token: string): Promise<void> {
    return request("/v1/auth/logout", { method: "POST" }, token);
  },
};
