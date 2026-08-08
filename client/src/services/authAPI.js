import apiClient from "./apiClient.js";

export const register = (payload) => apiClient.post("/auth/register", payload).then((r) => r.data);
export const login = (payload) => apiClient.post("/auth/login", payload).then((r) => r.data);
export const logout = () => apiClient.post("/auth/logout").then((r) => r.data);
export const fetchProfile = () => apiClient.get("/auth/profile").then((r) => r.data);
export const updateProfile = (payload) => apiClient.put("/auth/profile", payload).then((r) => r.data);
