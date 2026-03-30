import type { User } from "../types/auth.types";

const USER_KEY = "gymmate_user";
const TOKEN_KEY = "gymmate_token";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const userStorage = {
  get(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },
  set(user: User) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch { }
  },
  clear() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch { }
  },
};
