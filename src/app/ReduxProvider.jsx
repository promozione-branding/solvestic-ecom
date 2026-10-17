"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import axios from "axios";

import { store } from "@/redux/store";
import {
    setUser,
    setAuthLoading,
    clearUser,
} from "@/redux/authSlice";

function AuthInitializer({ children }) {
    const dispatch = useDispatch();

    useEffect(() => {
        let mounted = true;

        const fetchUser = async () => {
            dispatch(setAuthLoading(true));

            try {
                const { data } = await axios.get("/api/user/me");

                if (!mounted) return;

                const user = data.user ?? data.data?.user ?? data.data ?? null;

                dispatch(setUser(user));
            } catch (error) {
                if (!mounted) return;

                dispatch(clearUser());
            }
        };

        fetchUser();

        return () => {
            mounted = false;
        };
    }, [dispatch]);

    return children;
}

export default function ReduxProvider({ children }) {
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}