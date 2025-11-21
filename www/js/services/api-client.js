
import * as conn_data from "./config.js";

let config = conn_data.getConfigs();
let token = sessionStorage.getItem("token");

let configs = JSON.parse(localStorage.getItem("configs"));

if (typeof configs == undefined || configs === null || configs === '') {
    $.when(conn_data.getConfigs()).done(function (loaded_configs) {
        localStorage.setItem("configs", JSON.stringify(loaded_configs));
        config = loaded_configs;
    });
}

export function apiClient(path, type, dataType = "json", async = false, cache = false, data = {}) {
    const base_url = getBaseURL();
    const url = `${base_url}${path}`;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (async === false) {
        // 🔁 SYNC MODE — block and return the result directly
        let result = null;

        $.ajax({
            url,
            type,
            dataType,
            async: false, // force sync
            cache,
            data,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            success: function (res) {
                result = res;
            },
            error: function (jqXHR) {
                if (jqXHR.status === 401) {
                    sessionStorage.clear();
                    localStorage.clear();
                    console.warn("Unauthorized: Session cleared.");
                }
            },
        });

        return result;
    }

    // ✅ ASYNC MODE — return the jqXHR promise
    return $.ajax({
        url,
        type,
        dataType,
        async: true,
        cache,
        data,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).fail(function (jqXHR) {
        if (jqXHR.status === 401) {
            sessionStorage.clear();
            localStorage.clear();
            console.warn("Unauthorized: Session cleared.");
        }
    });
}


export function fileApiClient(path, type, dataType, async, cache = false, data, isFile = false) {
  let result = null;
  const base_url = getBaseURL();
  const url = `${base_url}${path}`;
  const headers = {
    Authorization: `Bearer ${token}`
  };

  if (!isFile) {
    headers["Content-Type"] = "application/json";
  }

  return $.ajax({
    url: url,
    type: type,
    async: async,
    cache: cache,
    headers: headers,
    xhrFields: {
      responseType: dataType === "binary" ? "blob" : "json" // ✅ crucial
    },
    processData: !isFile,
    contentType: isFile ? false : "application/json",
    data: isFile ? data : data ? JSON.stringify(data) : null,
    success: function (res) {
      result = res;
    },
    error: function (res) {
      if (res.status === 401) {
        sessionStorage.clear();
        localStorage.clear();
      } else {
        console.error("API error:", res);
      }
    }
  });
}

export function getConfigs() {
    $.when(conn_data.getConfigs()).done(function (loaded_configs) {
        localStorage.setItem("configs", JSON.stringify(loaded_configs));
        config = loaded_configs;
    });
}

export function getBaseURL() {

    if (config.apiPort != null && typeof config.apiPort != undefined || config.apiPort != "") {
        return `${config.apiProtocol}://${config.apiURL}:${config.apiPort}`
    } else {
        return `${config.apiProtocol}://${config.apiURL}`
    }
}
