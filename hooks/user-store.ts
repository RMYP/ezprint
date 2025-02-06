import { create } from "zustand";

interface Login {
  token: string | undefined;
  loginStatus: boolean;
  setToken: () => void;
}

export const useLogin = create<Login>((set) => ({
  token: undefined,
  loginStatus: false,
  setToken: async () => {
    try {
      const response = await fetch("/api/v1/auth/status");
      const data = await response.json();

      if (data.loggedIn) {
        set({ token: data.token, loginStatus: true });
      } else {
        set({ loginStatus: false });
      }
    } catch (err) {
      set({ loginStatus: false });
    }
  },
}));
