import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = Boolean(action.payload);
            state.isLoading = false;
        },

        setAuthLoading(state, action) {
            state.isLoading = action.payload;
        },

        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
    },
});

export const { setUser, setAuthLoading, clearUser } = authSlice.actions;
export default authSlice.reducer;