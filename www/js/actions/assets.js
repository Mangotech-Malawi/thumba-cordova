import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { setRecordText } from "../utils/utils.js";

const assetForm = "#assetForm";
let currentDataset = null;
localStorage;

$(function () {

    $(document).on("click", "#btnAssets", function (e) {
        loadAssetView();
    });

    $(document).on("click", "#assetFormBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/asset.html", "asset_form")).done(
            function () {

            }
        );
    });

    $(document).on("click", "#backBtn", function (e) {
        loadAssetView();
    });

    //Client Assets
    $(document).on("click", "#saveAssetBtn", function (e) {
        if (form.validAssetFormData()) {
            if ($("#formTitle").text().trim() === "Add Client Asset") {
                notification(
                    client.addAsset(clientAssetParams()).created,
                    "center",
                    "success",
                    "asset",
                    "Add Client Asset",
                    "Client Asset has been added successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text().trim() === "Edit Client Asset") {
                notification(
                    client.updateAsset(clientAssetParams()).updated,
                    "center",
                    "success",
                    "asset",
                    "Edit Client Asset",
                    "Client Asset has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });

    $(document).on("click", ".edit-asset", function (e) {
        //clearFields();
        const opener = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/asset.html", "asset_form")).done(
            function () {

                $("#formTitle").text("Edit Client Asset");

                $.each(opener, function (key, value) {
                    $(assetForm).find(`[id = '${key}']`).val(value);
                });
        });
    });

    $(document).on("show.bs.modal", "#modal-del-client-asset", function (e) {
        let opener = e.relatedTarget;
        $.each(opener.dataset, function (key, value) {
            $("#modal-del-client-asset").find(`[id = '${key}']`).val(value);
        });
    });

    $(document).on("click", "#delClientAssetBtn", function (e) {
        let id = $("#delAssetId").val();
        $.when(
            notification(
                client.delAsset(id).deleted,
                "center",
                "success",
                "asset",
                "Delete Client Asset",
                "Client Asset has been deleted successfully",
                true,
                3000
            )
        ).done(function () {
            $("#modal-del-client-asset").modal("hide");
        });
    });


});


function loadAssetView(){
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/assets.html", "assets")).done(
            function () {

                setRecordText(currentDataset, "recordName", "Assets");

                client.fetchClientAssets({
                    client_id: currentDataset.recordId,
                });
            }
        );
    }
}

//Params Methods ====================+++>
function clientAssetParams() {
    let id = $("#clientAssetId").val();
    let identifier = $("#identifier").val();
    let identifierType = $("#identifierType").val();
    let assetName = $("#assetName").val();
    let purchaseName = $("#purchaseName").val();
    let purchaseDate = $("#purchaseDate").val();
    let purchasePrice = $("#purchasePrice").val();
    let marketValue = $("#marketValue").val();
    let description = $("#assetDescription").val();

    let params = {
        id: id,
        client_id: currentDataset.recordId,
        identifier: identifier,
        identifier_type: identifierType,
        name: assetName,
        purchase_name: purchaseName,
        purchase_date: purchaseDate,
        purchase_price: purchasePrice,
        market_value: marketValue,
        description: description,
    };

    return params;
}


function notification(
    isDone,
    position,
    icon,
    recordType,
    title,
    text,
    showConfirmButton,
    timer
  ) {
    if (isDone)
      $.when(
        Swal.fire({
          position: position,
          icon: icon,
          title: title,
          text: text,
          showConfirmButton: showConfirmButton,
          timer: timer,
        })
      ).done(function () {
        switch (recordType) {
          case "asset":
            loadAssetView();
            break;
        }
      });
  }
  