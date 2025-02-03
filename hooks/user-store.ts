import { create } from "zustand";
import { getCookie } from "cookies-next";

interface Login {
  token: string | undefined;
  loginStatus: boolean;
  setToken: () => void;
}

export const useLogin = create<Login>((set) => ({
  token: undefined,
  loginStatus: false,
  setToken: async () => {
    const cookies = getCookie("_token") as string | undefined;
    if (cookies) {
      set(() => ({ token: cookies, loginStatus: true }));
    } else {
      set(() => ({ loginStatus: false }));
    }
  },
}));
