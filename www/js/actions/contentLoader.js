
export function loadContent(containerId, newState, urlPath, ...args) {
  $.ajax({
    url: urlPath,
    type: "GET",
    async: false,
    success: function (resp) {
      const targetContainer = $(`#${containerId}`);

      // Clear container if newState is provided and not empty
      if (newState && newState !== "") {
        targetContainer.html("");
      }

      targetContainer.append(resp);

      // Set localStorage based on args[0] existence
      const localStorageKey = args[0] !== undefined && args[0] !== null ? "homeState" : "state";
      if (newState !== "") {
        localStorage.setItem(localStorageKey, newState);
      }

      $("#body").removeClass("sidebar-open");
    },
    error: function () {
      // Handle error, e.g., display an error message
      console.error(`Failed to load content from ${urlPath}`);
    },
  });
}

//FORMS AND CLIENT RECORDS METHODS
export function loadForm(id, path) {
  $.when(loadContent(id, "contentRecord", path)).done(function () { });
}

export function loadIndividualRecordView(path, state) {
  $.when(loadContent("mainContent", state, path)).done(function () { });
}

export function loadRecord(path, state) {
  $.when(loadContent("mainContent", state, path)).done(function () { });
}

export function loadInvestmentView(path, state) {
  $.when(loadContent("investmentContainer", state, path)).done(function () {});
}

