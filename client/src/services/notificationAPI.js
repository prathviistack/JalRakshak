import apiClient from "./apiClient.js";

export const getNotifications = () => apiClient.get("/notification/all").then((r) => r.data);
export const markAsRead = (id) => apiClient.put(`/notification/${id}/read`).then((r) => r.data);
export const markAllAsRead = () => apiClient.put("/notification/read-all").then((r) => r.data);
