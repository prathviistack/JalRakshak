import apiClient from "./apiClient.js";

export const uploadRequestMedia = (id, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  return apiClient
    .post(`/request/${id}/media`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};
