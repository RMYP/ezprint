import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

interface Login {
  token: string | undefined;
  loginStatus: boolean;
  email: string | undefined;
  name: string | undefined;
  phoneNum: string | undefined;
  verifyStatus: boolean;
  setToken: () => void;
  refreshToken: () => void;
}

interface Jsonwebtoken {
  exp: number;
  email: string;
  name: string;
  phoneNum: string | undefined;
}

export const useLogin = create<Login>((set, get) => ({
  token: undefined,
  loginStatus: false,
  email: undefined,
  name: undefined,
  phoneNum: undefined,
  verifyStatus: false,
  // this code will be use to check if token still valid or not
  setToken: async () => {
    const { token } = get();

    if (token) {
      try {
        const decodedToken = jwtDecode(token) as Jsonwebtoken;
        const isTokenValid = decodedToken.exp * 1000 > Date.now();

        if (isTokenValid) {
          console.log("Token is still valid, skipping API call.");
          return;
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }

    try {
      console.log("Calling API to validate token...");
      const response = await fetch("/api/v1/auth/status");
      const data = await response.json();
      if (data.loggedIn) {
        console.log(data.token)
        const decodedToken = jwtDecode(data.token) as Jsonwebtoken;
        set({
          token: data.token,
          loginStatus: true,
          email: decodedToken.email,
          name: decodedToken.name,
          phoneNum: decodedToken.phoneNum,
        });
        console.log(token)
      } else {
        set({ token: undefined, loginStatus: false });
      }
    } catch (err) {
      set({ token: undefined, loginStatus: false });
    }
  },
  // this will force the fe to refresh the token when user make a change in profile
  // do this so the token from be will always be syncrone with fe
  refreshToken: async () => {
    console.log("ini");
    try {
      const response = await fetch("/api/v1/auth/status");
      const data = await response.json();

      if (data.loggedIn) {
        set({ token: data.token, loginStatus: true });
      } else {
        set({ token: undefined, loginStatus: false });
      }
    } catch (err) {
      set({ token: undefined, loginStatus: false });
    }
  },
}));
