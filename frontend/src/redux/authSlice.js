import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null,
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload; // expecting only user object
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.suggestedUsers = [];
            state.userProfile = null;
            state.selectedUser = null;
        },
    },
});

export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setSelectedUser,
    logout,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectSuggestedUsers = (state) => state.auth.suggestedUsers;
export const selectUserProfile = (state) => state.auth.userProfile;
export const selectSelectedUser = (state) => state.auth.selectedUser;
