import * as validator from "./validator.js";
import { startApiHealthChecker, isApiHealthy, getApiHealthStatus, apiClient } from "./api-client.js";
import * as offlineUsers from "../offline/users.js";

let token = sessionStorage.getItem("token");

// Start the endless API health checker (checks every 30 seconds)
startApiHealthChecker(30000);


if (isApiHealthy()) {
  //Keeping identifier types in localstorage 
  let identifier_types = JSON.parse(sessionStorage.getItem("identifier_types"));

  if (typeof identifier_types == undefined || identifier_types === null
    || identifier_types === '') {
    $.when(getIdentifierTypes()).done(function (data) {
      sessionStorage.setItem("identifier_types", JSON.stringify(data));
      loadIdentifierTypes();
    });
  } else {
    loadIdentifierTypes();
  }
}


export function add(params) {
  return apiClient("/api/v1/new_user", "POST", "json", false, false, params);
}

export function edit(params) {

  return apiClient(
    "/api/v1/edit_user",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function login(params) {

  // Check if API is healthy 

  if (isApiHealthy()) {
    $.when(
      apiClient("/api/v1/auth/login", "POST", "json", false, false, params)
    ).done(function (data) {
      if (data != null) {

        $.when(saveSessionDetails(data, params.password)).done(
          function () {

            const token = sessionStorage.getItem("token")
            const branch_user_roles = JSON.parse(sessionStorage.getItem("branch_user_roles"));
            const branch_role_id = sessionStorage.getItem("selected_branch_id");

            if (token && branch_role_id &&
              branch_user_roles.length > 0) {
              window.location = "branch_selection.html";

            } else {
              window.location = "thumba.html";
            }
          });

      } else {
        //Display an error here
        $("#invalidCredentials").text("Invalid Credentials");
      }
    });
  } else {
    // Offline mode - use IndexDB
    offlineAuthLogin(params);
  }

}

async function offlineAuthLogin(params) {
  try {
    const passwordHash = await hashPassword(params.password);
    const offlineUser = await offlineUsers.offlineLogin(params.username, passwordHash);

    if (offlineUser) {
      // Offline login successful
      saveOfflineSessionDetails(offlineUser);

      Swal.fire({
        icon: 'info',
        title: 'Offline Mode',
        text: 'You are logged in offline. Limited functionality available.',
        confirmButtonText: 'OK'
      }).then(() => {
        // Single navigation point
        if (offlineUser.branch_user_roles && offlineUser.branch_user_roles.length > 0) {
          window.location = "branch_selection.html";
        } else {
          window.location = "thumba.html";
        }
      });

    } else {
      $("#invalidCredentials").text("Invalid Credentials (Offline Mode)");
    }
  } catch (error) {
    console.error("Offline login failed:", error);
    $("#invalidCredentials").text("Offline login failed. Please try again.");
  }
}

export function inviter(params) {
  return apiClient("/api/v1//invitations/new",
    "POST", "json", false, false, params);
}

export function register(params) {
  return apiClient("/api/v1/invitations/register",
    "POST", "json", false, false, params);
}

export function verifyCurPasword(params) {
  return apiClient("/api/v1/verify_password",
    "POST", "json", false, false,
    params);
}

export function updateProfile(params) {
  return apiClient("/api/v1/update_profile",
    "POST", "json", false, false,
    params);
}

export function delete_user(params) {
  return apiClient("/api/v1/delete_user", "POST", "json", false, false,
    params,
  );
}

export function updateUserRole(params) {
  return apiClient("/api/v1/update_user_role", "POST", "json", false, false,
    params,
  );
}

export function updateUserBranchRoles(params) {
  return apiClient("/api/v1/update_user_branch_roles", "POST", "json", false, false,
    params,
  );
}

export function sendOTP(params) {
  return apiClient("/api/v1/auth/send_otp", "POST", "json", false, false,
    params
  );
}

export function verifyOTP(params) {
  return apiClient("/api/v1/auth/verify_otp", "POST", "json", false, false,
    params
  );
}

function getIdentifierTypes() {
  return apiClient("/api/v1/identifier_types", "GET", "json", false, false, {});
}

export function fetchRoles(params) {
  let data = apiClient("/api/v1/roles", "GET", "json", false, false, params);

  if (data != null) {
    loadRolesTable(data)
  }

  return data;
}

export function addRole(params) {
  return apiClient("/api/v1/role", "POST", "json", false, false, params)
}

export function fetchUsers() {

  let data = apiClient("/api/v1/users", "GET", "json", false, false, {});

  if (data != null) {
    loadUsersTable(data);
  }

  return data;
}

export function fetchRoleUsers(params) {
  return apiClient("/api/v1/role_users", "GET", "json", false, false, params)
}

function loadUsersTable(dataset) {
  $("#usersTable").DataTable({
    destroy: true,
    responsive: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    bfilter: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "identifier" },
      { data: "username" },
      { data: "firstname" },
      { data: "lastname" },
      { data: "email" },
      { data: null },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        targets: [6],
        render: function (data, type, row) {
          return `<span class="badge badge-primary">${data.branches.length} branches</span> `;
        }
      },
      {
        render: getEditButton,
        data: null,
        targets: [7],
      },
      {
        render: getDelButton,
        data: null,
        targets: [8],
      },
    ],
  });
}

function getDelButton(data, type, row, meta) {
  return `<button  type="button"  class="btn btn-block btn-danger"
    data-toggle="modal" data-target = "#modal-delete-user"
    data-id = "${data.id}"
    data-username = "${data.username}">
   <i class="fas fa-trash"></i></button>`;
}

function getEditButton(data, type, row, meta) {
  return `<button  type="button"  class="btn btn-block btn-default edit-user-role"
    data-user-id = "${data.id}"
    data-national-id = "${data.identifier}"
    data-username = "${data.username}"
    data-firstname = "${data.firstname}"
    data-lastname = "${data.lastname}"
    data-email = "${data.email}"
    data-branches = '${JSON.stringify(data.branches)}'
    data-role-id = "${data.role_id}"
    data-role = "${data.role}"
    data-button-type = "edit">
   <i class="fas fa-edit"></i></button>`;
}

export function fetchInvitations() {

  let data = apiClient("/api/v1/invitations", "GET", "json", false, false, {});

  if (data != null) {
    loadInvitationsTable(data);
  }

  return data;
}

function loadInvitationsTable(dataset) {
  $("#pendingInvitesTable").DataTable({
    destroy: true,
    responsive: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    bfilter: false,
    info: true,
    data: dataset,
    columns: [
      { data: "email" },
      { data: "accepted" },
      { data: "expires_at" },
      { data: "created_at" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getResendInvitationButton,
        data: null,
        targets: [4],
      },
      {
        render: getDelInvitationButton,
        data: null,
        targets: [5],
      },
    ],
  });
}

function getResendInvitationButton(data, type, row, meta) {
  const encodedBranches = encodeURIComponent(JSON.stringify(data.branches));

  return `<button  type="button"  class="btn btn-block btn-primary
    resend-invitation"
    data-id = "${data.id}"
    data-branches = "${encodedBranches}"
    data-role-id = "${data.role_id}"
    data-user-type = "${data.user_type}"
    data-email = "${data.email}">
   <i class="fas fa-envelope"></i> Resend</button>`;
}

function getDelInvitationButton(data, type, row, meta) {
  return `<button  type="button"  class="btn btn-block btn-danger"
    data-toggle="modal" data-target = "#modal-register-user"
    data-id = "${data.id}"
    data-button-type = "edit">
   <i class="fas fa-edit"></i></button>`;
}

function loadRolesTable(data) {
  let dataset = data.map(role => {
    return {
      name: role.name,
      description: role.description,
      system_default: role.system_default ? "Yes" : "No",
      manages_users: role.privileges.some(p => p.name === "manages_users"),
      manages_clients: role.privileges.some(p => p.name === "manages_clients"),
      manages_applications: role.privileges.some(p => p.name === "manages_applications"),
      manages_finances: role.privileges.some(p => p.name === "manages_finances"),
      manages_products: role.privileges.some(p => p.name === "manages_products"),
      client_portal_access: role.privileges.some(p => p.name === "client_portal_access"),
      manages_settings: role.privileges.some(p => p.name === "manages_settings"),
      manages_shares: role.privileges.some(p => p.name === "manages_shares"),
      system_default_flag: role.system_default
    };
  });

  $("#rolesTable").DataTable({
    destroy: true,
    responsive: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    bfilter: false,
    info: true,
    data: dataset,
    columns: [
      { data: "name" },
      { data: "description" },
      { data: "system_default" },
      { data: "manages_users", render: renderCheckbox },
      { data: "manages_clients", render: renderCheckbox },
      { data: "manages_applications", render: renderCheckbox },
      { data: "manages_finances", render: renderCheckbox },
      { data: "manages_products", render: renderCheckbox },
      { data: "client_portal_access", render: renderCheckbox },
      { data: "manages_settings", render: renderCheckbox },
      { data: "manages_shares", render: renderCheckbox },
      { data: null, render: getDelRolesButton }
    ]
  });
}

function renderCheckbox(data, type, row) {
  let isChecked = data ? "checked" : "";
  let isDisabled = row.system_default_flag ? "disabled" : "";
  let checkClass = data ? "icheck-success" : "icheck-primary";
  return `<div class="checkbox ${checkClass}  small"><input type='checkbox' ${isChecked} ${isDisabled}><label></label></div>`;
}

function getDelRolesButton(data, type, row) {
  return row.system_default_flag ? "" : '<button class="btn btn-danger btn-sm"><i class="fa fa-trash"></i></button>';
}

export function saveSessionDetails(data, password) {

  token = data.token;
  sessionStorage.setItem("user_id", data.user_id)
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("username", data.username);
  sessionStorage.setItem("email", data.email);
  sessionStorage.setItem("role", data.role);
  sessionStorage.setItem("account_name", data.account_name);
  sessionStorage.setItem("account_address", data.account_address);
  sessionStorage.setItem("account_email", data.account_email);
  sessionStorage.setItem("account_phone_number", data.account_phone_number);
  sessionStorage.setItem("account_id", data.account_id);
  sessionStorage.setItem("account_logo", data.account_logo);
  sessionStorage.setItem("privileges", JSON.stringify(data.privileges));
  sessionStorage.setItem("branch_user_roles", JSON.stringify(data.branch_user_roles));
  sessionStorage.setItem("offline_mode", "false");

  // ✅ Now password is available
  if (data.role === "debt-collector") {
    saveOfflineUser(data, password);
  }

  localStorage.clear();

  if (data.role === "admin") {
    localStorage.setItem("state", "admin_dashboard");
  }
  else if (data.role === "investor") {
    localStorage.setItem("state", "investor_dashboard");
  } else if (data.role === "co-owner") {
    localStorage.setItem("state", "admin_dashboard");
  }
}

// ✅ NEW FUNCTION: Save session details for offline users
function saveOfflineSessionDetails(offlineUser) {
  sessionStorage.setItem("user_id", offlineUser.user_id);
  sessionStorage.setItem("username", offlineUser.username);
  sessionStorage.setItem("email", offlineUser.email);
  sessionStorage.setItem("role", offlineUser.role);
  sessionStorage.setItem("firstname", offlineUser.firstname);
  sessionStorage.setItem("lastname", offlineUser.lastname);
  sessionStorage.setItem("branch_user_roles", JSON.stringify(offlineUser.branch_user_roles));
  sessionStorage.setItem("account_id", offlineUser.account_id);
  sessionStorage.setItem("privileges", JSON.stringify(offlineUser.privileges));
  sessionStorage.setItem("offline_mode", "true");

  localStorage.clear();
  localStorage.setItem("state", "debt_collector_dashboard");
}

export function loadIdentifierTypes() {
  const identifier_types = JSON.parse(sessionStorage.getItem("identifier_types"));

  let identifierTypesArray = []

  identifier_types.forEach(function (identifier_type, index) {
    identifierTypesArray.push(
      '<option value ="',
      identifier_type.id,
      '">',
      `${identifier_type.name}`,
      "</option>"
    )

    $("#identifierType").html(identifierTypesArray.join(""));
  });

}

async function saveOfflineUser(data, password) {
  try {
    const passwordHash = await hashPassword(password);

    const offlineUser = {
      user_id: data.user_id,
      username: data.username,
      email: data.email,
      password_hash: passwordHash,
      role: data.role,
      firstname: data.firstname,
      lastname: data.lastname,
      branch_user_roles: data.branch_user_roles,
      account_id: data.account_id,
      last_sync: new Date().toISOString(),
      privileges: data.privileges
    };

    await offlineUsers.addOfflineUser(offlineUser);
    console.log("Debt-collector user saved to offline storage");
  } catch (error) {
    console.error("Failed to save debt-collector user offline:", error);
  }
}



async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}



