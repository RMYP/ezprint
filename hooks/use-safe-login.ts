"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/user-store";
import type { Login } from "@/hooks/user-store";

type SafeLoginState = {
    isLogin: boolean;
    userName: string | undefined;
    userEmail: string | undefined;
    getToken: () => void;
    isLoading: boolean;
};

const initialState = {
    isLogin: useLogin.getState().loginStatus,
    userName: useLogin.getState().name,
    userEmail: useLogin.getState().email,
    getToken: useLogin.getState().setToken,
    isLoading: true,
};

export const useSafeLogin = (): SafeLoginState => {
    const [state, setState] = useState(initialState);
    const setToken = useLogin.getState().setToken;
    useEffect(() => {
        useLogin.getState().setToken();

        const initializeLogin = async () => {
            await setToken(); 

            const finalState = useLogin.getState();
            setState({
                isLogin: finalState.loginStatus,
                userName: finalState.name,
                userEmail: finalState.email,
                getToken: finalState.setToken,
                isLoading: false, 
            });
        };

        initializeLogin(); 

        const unsubscribe = useLogin.subscribe((currentState) => {
            setState({
                isLogin: currentState.loginStatus,
                userName: currentState.name,
                userEmail: currentState.email,
                getToken: currentState.setToken,
                isLoading: false,
            });
        });

        return () => unsubscribe();
    }, []);

    return state;
};
