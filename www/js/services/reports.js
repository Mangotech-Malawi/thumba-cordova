import { apiClient  } from "./api-client.js";

export function users(params) {
    return apiClient("/api/v1/report/users", "GET", "json", false, false, params);
}