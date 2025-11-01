import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

interface Login {
    token: string | undefined;
    loginStatus: boolean;
    userId: string | undefined;
    email: string | undefined;
    name: string | undefined;
    phoneNum: string | undefined;
    verifyStatus: boolean;
    setName: (name: string) => void;
    setPhoneNum: (phoneNum: string) => void;
    setToken: () => void;
    refreshToken: () => void;
}

interface Jsonwebtoken {
    id: string;
    exp: number;
    email: string;
    user: string;
    phone: string | undefined;
}

export const useLogin = create<Login>()(
    persist(
        (set, get) => ({
            token: undefined,
            loginStatus: false,
            userId: undefined,
            email: undefined,
            name: undefined,
            phoneNum: undefined,
            verifyStatus: false,

            setName: (name: string) => ({ name }),
            setPhoneNum: (phoneNum: string) => ({ phoneNum }),

            setToken: async () => {
                const { token } = get();

                const cachedToken = sessionStorage.getItem("jwt");
                if (cachedToken) {
                    try {
                        const decodedToken = jwtDecode(
                            cachedToken
                        ) as Jsonwebtoken;
                        const isTokenValid =
                            decodedToken.exp * 1000 > Date.now();
                        if (isTokenValid) {
                            set({
                                token: cachedToken,
                                loginStatus: true,
                                userId: decodedToken.id,
                                email: decodedToken.email,
                                name: decodedToken.user,
                                phoneNum: decodedToken.phone,
                            });
                            console.log("Loaded token from cache");
                            return;
                        } else {
                            sessionStorage.removeItem("jwt");
                        }
                    } catch (err) {
                        console.error("Failed to decode cached token:", err);
                    }
                }

                try {
                    const response = await fetch("/api/v1/auth/status");
                    const data = await response.json();
                    if (data.loggedIn) {
                        const decodedToken = jwtDecode(
                            data.token
                        ) as Jsonwebtoken;
                        sessionStorage.setItem("jwt", data.token);
                        set({
                            token: data.token,
                            loginStatus: true,
                            userId: decodedToken.id,
                            email: decodedToken.email,
                            name: decodedToken.user,
                            phoneNum: decodedToken.phone,
                        });
                    } else {
                        set({ token: undefined, loginStatus: false });
                        sessionStorage.removeItem("jwt");
                    }
                } catch (err) {
                    set({ token: undefined, loginStatus: false });
                    sessionStorage.removeItem("jwt");
                }
            },

            refreshToken: async () => {
                try {
                    const response = await fetch("/api/v1/auth/status");
                    const data = await response.json();

                    if (data.loggedIn) {
                        const decodedToken = jwtDecode(
                            data.token
                        ) as Jsonwebtoken;
                        sessionStorage.setItem("jwt", data.token);
                        set({
                            token: data.token,
                            loginStatus: true,
                            userId: decodedToken.id,
                            email: decodedToken.email,
                            name: decodedToken.user,
                            phoneNum: decodedToken.phone,
                        });
                    } else {
                        set({ token: undefined, loginStatus: false });
                        sessionStorage.removeItem("jwt");
                    }
                } catch (err) {
                    set({ token: undefined, loginStatus: false });
                    sessionStorage.removeItem("jwt");
                }
            },
        }),
        {
            name: "login-storage", // nama key di local/session storage
        }
    )
);
