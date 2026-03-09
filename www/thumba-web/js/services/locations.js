import { apiClient } from "./api-client.js";


export function getRegions() {
   return apiClient("/api/v1/regions",
        "GET",
        "json",
        true,
        false,
        {});
}

export function getDistricts(params) {
   return apiClient("/api/v1/districts",
        "GET",
        "json",
        true,
        false,
        params);
}

export function getTraditionalAuthorities(params) {
   return apiClient("/api/v1/traditional_authorities",
        "GET",
        "json",
        true,
        false,
        params);
}

export function getVillages(params) {
   return apiClient("/api/v1/villages",
        "GET",
        "json",
        true,
        false,
        params);
}


