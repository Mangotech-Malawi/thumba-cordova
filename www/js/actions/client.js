import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as loadContent from "../actions/contentLoader.js";
import { loadIdentifierTypes } from "../services/users.js";
import * as locations from "./locations.js";
import { notify } from "../utils/utils.js";

let cameraFeed = document.getElementById("cameraFeed");
let cameraCanvas = document.getElementById("cameraCanvas");
let profilePicture = document.getElementById("profilePicture");
let browseBtn = document.getElementById("browseBtn");


let modalId = "#modal-register-client";
const organizationClientForm = "#organizationClientForm";
const individualClientForm = "#individualClientForm";
let clientType = null;
let currentDataset = null;
let selectedClients = null;


const otherloanModal = "#modal-client-otherloan";

localStorage;

$(function () {

  if (localStorage.getItem("clientDataSet") != null) {
    currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));
    if (currentDataset.clientType === "individual") {
      populateClientsDetails(currentDataset);
    } else if (currentDataset.clientType === "organization") {
      populateOrganizationDetails(currentDataset);
    } else if (currentDataset.clientType === "group") {
      populateGroupDetails(currentDataset);
    }
  }

  if (localStorage.getItem("clientType") != null) {
    clientType = localStorage.getItem("clientType");
  }

  $(document).on("show.bs.modal", "#modal-del-client", function (e) {
    let opener = e.relatedTarget;
    clientType = $(opener).attr("data-client-type");

    $("#modal-del-client")
      .find(`[id = 'delClientId']`)
      .val($(opener).attr("data-id"));
  });

  $(document).on("click", "#delClientBtn", function (e) {
    let client_id = $("#delClientId").val();
    let void_reason = $("#reason").val();

    $.when(
      notification(
        client.delClient(client_id, void_reason).deleted,
        "center",
        "success",
        "client",
        "Delete Client",
        "Client has been deleted successfully",
        true,
        3000
      )
    ).done(function () {
      $.when(client.fetchClientsData(clientType)).done(function () {
        $("#modal-del-client").modal("hide");
      });
    });
  });

  $(document).on("click", "#saveIndividualClientBtn", function (e) {

    if (form.validClientFormData()) {
      if ($("#cardTitle").text().trim() === "Add Client") {

        $.when(client.addClient(individualParams())).done(function (res) {
          if (res.created) {
            notification(
              res.created,
              "center",
              "success",
              "registration",
              "Add Individual Client",
              "Client has been added successfully",
              true,
              3000
            );
          } else {
            notify(
              "center",
              "error",
              "Failed to create client",
              "Please contact your adminstrator",
              true,
              3000)
          }
        })

      } else if ($("#cardTitle").text().trim() === "Edit Client") {

        $.when(client.editClient(individualParams())).done(function (res) {

          if (res.updated) {
            notification(
              res.updated,
              "center",
              "success",
              "registration",
              "Edit Individual Client",
              "Client has been updated successfully",
              true,
              3000
            );
          }
        });

      } else {
        notify(
          "center",
          "error",
          "Failed to create client",
          "Please contact your adminstrator",
          true,
          3000)
      }

    }
  });

  $(document).on("click", "#saveOrgClientBtn", function (e) {
    if (form.validOrgClientFormData()) {
      if ($("#cardTitle").text().trim() === "Add Client") {
        notification(
          client.addClient(organizationParams()),
          "center",
          "success",
          "registration",
          "Add Organization Client",
          "Client has been added successfully",
          true,
          3000
        );
      } else if ($("#cardTitle").text().trim() === "Edit Client") {
        notification(
          client.editClient(organizationParams()),
          "center",
          "success",
          "registration",
          "Edit Organization Client",
          "Client has been updated successfully",
          true,
          3000
        );
      }
    }

  });


  $(document).on("click", ".recordBtn", function (e) {
    let opener = e.relatedTarget;

    currentDataset = this.dataset;
    localStorage.setItem("clientDataSet", JSON.stringify(currentDataset));

    let clientType = this.dataset.clientType;
    localStorage.setItem("clientType", clientType);

    if (clientType === "individual") {
      loadContent.loadRecord("views/clients/individualRecord.html", "individual_records");
      $("#recordName").text(
        `${this.dataset.recordFirstname} ${this.dataset.recordLastname} Records`
      );

      populateClientsDetails(currentDataset);
    } else if (clientType === "organization") {
      loadContent.loadRecord("views/clients/organizationRecord.html", "organization_records");
      $("#recordName").text(
        `${this.dataset.orgName} Records`
      );

      populateOrganizationDetails(currentDataset);
    } else if (clientType === "group") {
      loadContent.loadRecord("views/clients/groupRecord.html", "group_records");
      $("#recordName").text(
        `${this.dataset.groupName} Records`
      );

      populateGroupDetails(currentDataset);
    }
  });


  $(document).on("click", "#addClientForm", function (e) {

    $.when(loadContent.loadIndividualRecordView("views/forms/client.html", "client_form")).done(
      function () {
        localStorage.setItem("clientType", "individual");
        loadIdentifierTypes();
        locations.loadRegions();
      }
    );
  });

  $(document).on("click", "#addOrganizationClientForm", function (e) {
    $.when(loadContent.loadIndividualRecordView("views/forms/organization.html", "client_organization_form")).done(
      function () {
        localStorage.setItem("clientType", "organization");
        loadIdentifierTypes();
      }
    );
  });

  $(document).on("click", ".edit-client", function (e) {
    const data = $(this).data();

    if (data.clientType === "individual") {

      $.when(loadContent.loadIndividualRecordView("views/forms/client.html", "client_form")).done(function () {
        // First, load static options like identifier types
        loadIdentifierTypes();

        $("#cardTitle").text("Edit Client");

        // Set the identifier type if it's available
        if (data.identifierTypeId) {
          $("#identifierType").val(data.identifierTypeId).trigger("change");
        }

        locations.loadRegions().then(() => {
          $("#homeRegion").val(data.homeRegion).trigger("change");
          $("#currentRegion").val(data.currentRegion).trigger("change");

          locations.selectLocationChain(
            data.homeRegion,
            data.homeDistrict,
            data.homeTa,
            data.homeVillage,
            "home"
          ).then(() => {
            console.log("Home location chain set");
          });

          locations.selectLocationChain(
            data.currentRegion,
            data.currentDistrict,
            data.currentTa,
            data.currentVillage,
            "current"
          ).then(() => {
            console.log("Current location chain set");
          });
        }).then(() => {
          // After everything is populated
          $.each(data, function (key, value) {
            $(individualClientForm).find(`[id='${key}']`).val(value).trigger("change");
          });
        });

      });
    } else if (data.clientType === "organization") {

      $.when(loadContent.loadIndividualRecordView("views/forms/organization.html", "client_organization_form")).done(
        function () {
          $("#cardTitle").text("Edit Client");

          $.each(data, function (key, value) {
            $(organizationClientForm).find(`[id = '${key}']`).val(value);
          });

        }
      );
    }

    localStorage.setItem("clientType", data.clientType)

  });


  $(document).on("show.bs.modal", "#modal-group-client", function (e) {
    const opener = e.relatedTarget;

    if (opener.dataset.actionType == "add") {
      selectedClients = client.getSelectedClients();

      if (typeof selectedClients != undefined && selectedClients != "" && selectedClients != null) {
        if (selectedClients.length > 1) {

        } else {
          notify(
            "center",
            "error",
            "Cannot create group",
            "More than one client should be selected",
            true,
            3000)
        }
      } else {
        notify(
          "center",
          "error",
          "Cannot create group",
          "Please select clients to create a group",
          true,
          3000)
      }
    } else if (opener.dataset.actionType == "edit") {
      $("#groupModalTitle").text("Edit Group");

      $.each(opener.dataset, function (key, value) {
        $("#modal-group-client").find(`[id = '${key}']`).val(value).change();
      });
    }


  });

  $(document).on("click", "#saveGroupBtn", function (e) {

    const clientId = $("#recordId").val();
    const groupId = $("#modal-group-client").find(`[id = 'groupId']`).val();
    const groupName = $("#groupName").val();
    const category = $("#category").val();

    const group_params = {
      client_id: clientId,
      group_id: groupId,
      group_name: groupName,
      category: category,
      group_clients: selectedClients,
      client_type: "group"
    }

    if (form.validGroupClientFormData()) {

      if ($("#groupModalTitle").text().trim() === "Add Group") {

        notification(
          client.addClient(group_params),
          "center",
          "success",
          "registration",
          "Add Group Client",
          "Client has been added successfully",
          true,
          3000
        );

        $("#modal-group-client").modal("hide");


      } else if ($("#groupModalTitle").text().trim() === "Edit Group") {
        notification(
          client.editClient(group_params),
          "center",
          "success",
          "registration",
          "Edit Group Client",
          "Group has been added successfully",
          true,
          3000
        );

        $("#modal-group-client").modal("hide");
      }
    }

  });

  $(document).on("show.bs.modal", "#modal-add-to-group", function (e) {
    $.when(client.fetchGroups()).done(function (groups) {

      let groupsArray = [];

      groups.forEach(function (group, index) {
        groupsArray.push(
          '<option value ="',
          group.id,
          '">',
          `${group.name}`,
          "</option>"
        )

        $("#groupSelector").html(groupsArray.join(""));
      });
    })
  });

  $(document).on("click", "#addToGroupBtn", function (e) {
    selectedClients = client.getSelectedClients();

    if (typeof selectedClients != undefined && selectedClients != "" && selectedClients != null) {
      if (selectedClients.length > 0) {

        const groupId = $("#groupSelector").val();

        const add_to_group_params = {
          group_id: groupId,
          clients_ids: selectedClients
        }

        notification(
          client.addClientToGroup(add_to_group_params),
          "center",
          "success",
          "registration",
          "Add Client To Group",
          "Added to group succesfully",
          true,
          3000
        );

        $("#modal-add-to-group").modal("hide");

      } else {
        notify(
          "center",
          "error",
          "Cannot add to group",
          "Please select atleast one client to proceed",
          true,
          3000)
      }
    } else {
      notify(
        "center",
        "error",
        "Cannot add to group",
        "Please select atleast one client to proceed",
        true,
        3000)
    }
  });


  $(document).on("click", "#btnDemographics", function (e) {
    $.when(loadContent.loadIndividualRecordView("views/clients/demographics.html", "demographics")).done(
      function () {
        $.each(currentDataset, function (key, value) {
          $("#demographics").find(`[id = '${key}']`).text(value);
        });

        $("#profilePicture").attr("src", `${currentDataset.profilePicture}`);

        $("#recordName").text(
          `${currentDataset.recordFirstname} ${currentDataset.recordLastname} Demographics`
        );
      }
    );
  });

  $(document).on("click", "#recordBackBtn", function () {
    const clientType = localStorage.getItem("clientType");
    if (clientType === "individual") {
      loadContent.loadRecord("views/clients/individualRecord.html", "individual_records");
      $("#recordName").text(
        `${currentDataset.recordFirstname} ${currentDataset.recordLastname} Records`
      );
      populateClientsDetails(currentDataset);
    } else if (clientType === "organization") {
      loadContent.loadRecord("views/clients/organizationRecord.html", "organization_records");
      `${currentDataset.orgName} Records`
      populateOrganizationDetails(currentDataset);
    } else if (clientType === "group") {
      loadContent.loadRecord("views/clients/groupRecord.html", "group_records");
      `${currentDataset.groupName} Records`
      populateGroupDetails(currentDataset);
    }
  });

  $(document).on("click", "#clientsBackBtn", function () {
    goBackToClientTable()
  });


  $(document).on("click", "#downloadClientRecord", function (e) {
    $.when(client.getClientRecordReport({ client_id: currentDataset.recordId })).done(function (htmlContent) {
      if (htmlContent) {
        let win = window.open("", "", "");
        win.document.write(htmlContent.html)
        win.document.close();
        win.print();
      } else {
        console.error("HTML content is null or empty.");
      }
    });
  });


  $(document).on("click", "#uploadImageBtn", async function (e) {
    e.preventDefault();

    // Get the file input
    const fileInput = document.getElementById("profilePictureInput");

    // Access the captured image file
    const files = fileInput.files; // Contains the captured image
    const imageFile = files ? files[0] : null;

    if (imageFile) {
      client.uploadImage(currentDataset.recordId, imageFile);
    } else {
      console.error("No file selected or captured.");
      alert("Please capture or select an image before uploading.");
    }
  });

});



//CLIENT REGISTRATION METHODS

function individualParams() {
  const client_id = $("#id").val();
  const identifier = $("#identifier").val();
  const identifierTypeId = $("#identifierType").val();
  const firstname = $("#firstname").val();
  const lastname = $("#lastname").val();
  const gender = $("#gender option:selected").val();
  const date_of_birth = $("#dateOfBirth").val();
  const home_region = $("#homeRegion").val();
  const home_district = $("#homeDistrict option:selected").val();
  const home_ta = $("#homeTa").val();
  const home_village = $("#homeVillage").val();
  const current_district = $("#currentDistrict option:selected").val();
  const current_region = $("#currentRegion").val();
  const current_ta = $("#currentTa").val();
  const current_village = $("#currentVillage").val();
  const nearest_landmark = $("#nearestLandmark option:selected").val();
  const clientType = localStorage.getItem("clientType");
  const selectedBranchId = sessionStorage.getItem("selected_branch_id");

  let params = {
    client_id: client_id,
    branch_id: selectedBranchId,
    client_type: clientType,
    identifier: identifier,
    identifier_type_id: identifierTypeId,
    firstname: firstname,
    lastname: lastname,
    gender: gender,
    date_of_birth: date_of_birth,
    home_region: home_region,
    home_district: home_district,
    home_ta: home_ta,
    home_village: home_village,
    current_region: current_region,
    current_district: current_district,
    current_ta: current_ta,
    current_village: current_village,
    nearest_landmark: nearest_landmark,
  };

  return params;
}

function organizationParams(type) {
  let clientId = $("#id").val();
  let name = $("#name").val();
  let category = $("#orgCategory").val();
  let startDate = $("#busStartDate").val();
  let purpose = $("#purpose").val();
  let emailAddress = $("#emailAddress").val();
  let phoneNumber = $("#phoneNumber").val();
  let officeLocation = $("#officeLocation").val();
  let postalAddress = $("#postalAddress").val();
  let registered = $("#registered").val();
  const clientType = localStorage.getItem("clientType");
  const selectedBranchId = sessionStorage.getItem("selected_branch_id");

  let params = {
    branch_id: selectedBranchId,
    client_id: clientId,
    client_type: clientType,
    name: name,
    category: category,
    start_date: startDate,
    purpose: purpose,
    email_address: emailAddress,
    phone_number: phoneNumber,
    office_location: officeLocation,
    postal_address: postalAddress,
    registered: registered,
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
        case "registration":
          goBackToClientTable();
          break;
        case "job":
          $.when(
            client.fetchClientJobs({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $(jobModal).modal("hide");
          });
          break;
        case "delete-job":
          $.when(
            client.fetchClientJobs({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $("#modal-del-client-job").modal("hide");
          });
          break;
        case "dependant":
          $.when(
            client.fetchClientDependants({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $(dependantModal).modal("hide");
          });
          break;
        case "delete-dependant":
          $.when(
            client.fetchClientDependants({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $("#modal-del-client-dependant").modal("hide");
          });
          break;
        case "business":
          $.when(
            client.fetchClientBusinesses({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $(businessModal).modal("hide");
          });
          break;
        case "asset":
          $.when(
            client.fetchClientAssets({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $(assetModal).modal("hide");
          });
          break;
        case "otherloan":
          $.when(
            client.fetchClientOtherLoans({
              client_id: currentDataset.recordId,
            })
          ).done(function () {
            $(otherloanModal).modal("hide");
          });
          break;
      }
    });
}

function clearFields(formId) {
  $(":input", formId)
    .not(":button, :submit, :reset")
    .val("")
    .prop("checked", false)
    .prop("selected", false);
}

function populateGroupDetails(currentDataset) {
  $.each(currentDataset, function (key, value) {
    $("#groupDetails").find(`[id = '${key}']`).text(value);
  });
}

function populateOrganizationDetails(currentDataset) {
  $.each(currentDataset, function (key, value) {
    $("#organizationDetails").find(`[id = '${key}']`).text(value);
  });
}

function populateClientsDetails(currentDataset) {
  $.each(currentDataset, function (key, value) {
    $("#clientDetails").find(`[id = '${key}']`).text(value);
  });
}

function goBackToClientTable() {
  const clientType = localStorage.getItem("clientType");

  if (clientType === "individual") {
    $.when(loadContent.loadRecord("views/clients/individuals.html", "individual")).done(function () {
      client.fetchClientsData(clientType);
    });
  } else if (clientType === "organization") {
    $.when(loadContent.loadRecord("views/clients/organizations.html", "organization")).done(function () {
      client.fetchClientsData(clientType);
    });
  } else if (clientType === "group") {
    $.when(loadContent.loadRecord("views/clients/groups.html", "group")).done(function () {
      client.fetchClientsData(clientType);
    });
  }
}









