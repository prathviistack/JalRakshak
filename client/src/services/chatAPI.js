import apiClient from "./apiClient.js";

export const startChat = (participantId, requestId) =>
  apiClient.post("/chat/start", { participantId, requestId }).then((r) => r.data);
export const getMyChats = () => apiClient.get("/chat/all").then((r) => r.data);
export const getMessages = (chatId) => apiClient.get(`/chat/${chatId}/messages`).then((r) => r.data);
export const sendMessage = (chatId, text) =>
  apiClient.post(`/chat/${chatId}/messages`, { text }).then((r) => r.data);
