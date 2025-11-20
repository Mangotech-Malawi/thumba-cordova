import * as locations from "../services/locations.js";

$(function () {
    $(document).on("change", ".region", function () {
        const regionId = $(this).val();
        const isHome = $(this).attr("id") === "homeRegion";
        const districtId = isHome ? "homeDistrict" : "currentDistrict";
        const taId = isHome ? "homeTa" : "currentTa";
        const villageId = isHome ? "homeVillage" : "currentVillage";

        clearSelects([districtId, taId, villageId]);
        loadDistricts(regionId, districtId)
            .then(() => $(`#${districtId}`).trigger("change"));
    });

    $(document).on("change", ".district", function () {
        const districtId = $(this).val();
        const isHome = $(this).attr("id") === "homeDistrict";
        const taId = isHome ? "homeTa" : "currentTa";
        const villageId = isHome ? "homeVillage" : "currentVillage";

        clearSelects([taId, villageId]);
        loadTraditionalAuthorities(districtId, taId)
            .then(() => $(`#${taId}`).trigger("change"));
    });

    $(document).on("change", ".ta", function () {
        const taId = $(this).val();
        const isHome = $(this).attr("id") === "homeTa";
        const villageId = isHome ? "homeVillage" : "currentVillage";

        clearSelects([villageId]);
        loadVillages(taId, villageId);
    });
});

// Utility to clear selects
function clearSelects(ids) {
    ids.forEach(id => $(`#${id}`).html('<option value="">-- Select --</option>'));
}

// 🔁 All loaders now return Promises

export function loadRegions() {
    return locations.getRegions().then((regions) => {
        const options = buildOptions(regions);
        $("#homeRegion").html(options);
        $("#currentRegion").html(options);

        // Trigger cascade
        $("#homeRegion").trigger("change");
        $("#currentRegion").trigger("change");



        return waitFor(800); // Let dependent dropdowns resolve
    });
}

export function loadDistricts(regionId, elementId) {
    return locations.getDistricts({ region_id: regionId }).then((districts) => {
        const options = buildOptions(districts);
        $(`#${elementId}`).html(options);
    });
}

export function loadTraditionalAuthorities(districtId, elementId) {
    return locations.getTraditionalAuthorities({ district_id: districtId }).then((tas) => {
        const options = buildOptions(tas);
        $(`#${elementId}`).html(options);
    });
}

export function loadVillages(taId, elementId) {
    return locations.getVillages({ traditional_authority_id: taId }).then((villages) => {
        const options = buildOptions(villages);
        $(`#${elementId}`).html(options);
    });
}

// 🔨 Helpers

function buildOptions(items) {
    return items.map(item => `<option value="${item.id}">${item.name}</option>`).join("");
}

function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function selectLocationChain(regionId, districtId, taId, villageId, prefix) {
    // Set region and trigger change first
    $(`#${prefix}Region`).val(regionId).trigger("change");

    return new Promise((resolve) => {
        setTimeout(() => {
            locations.getDistricts({ region_id: regionId }).then((districts) => {
                const districtOptions = districts.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
                $(`#${prefix}District`).html(districtOptions).val(districtId).trigger("change");

                setTimeout(() => {
                    locations.getTraditionalAuthorities({ district_id: districtId }).then((tas) => {
                        const taOptions = tas.map(ta => `<option value="${ta.id}">${ta.name}</option>`).join("");
                        $(`#${prefix}Ta`).html(taOptions).val(taId).trigger("change");

                        setTimeout(() => {
                            locations.getVillages({ traditional_authority_id: taId }).then((villages) => {
                                const villageOptions = villages.map(v => `<option value="${v.id}">${v.name}</option>`).join("");
                                $(`#${prefix}Village`).html(villageOptions).val(villageId);
                                resolve(); // Done loading full location chain
                            });
                        }, 300);
                    });
                }, 300);
            });
        }, 300);
    });
}