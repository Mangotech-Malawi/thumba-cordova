import * as users from "../services/users.js";
import * as form from "../utils/forms.js"
import * as contentLoader from "../actions/contentLoader.js";
import { toastNote } from "../utils/utils.js"
import * as account from "../services/account.js";
import { notify } from "../services/utils.js";

let formType;

let selectedBranches = [];

$(function () {

    selectedBranches = [];

    $("#lbl-username").text(sessionStorage.getItem("username"));

    $(document).on("click", "#inviteUser", function (e) {
        if (form.validateUserInvitationForm()) {
            $.when(users.inviter(getUserInvitationParams())).done(function (resp) {
                if (resp.created) {
                    notification(
                        true,
                        "center",
                        "success",
                        "user-invitation",
                        "User Invitation",
                        "User invitation has been added successfully",
                        true,
                        3000
                    );
                } else {
                    notification(
                        true,
                        "center",
                        "warning",
                        "user-invitation",
                        "User Invitation",
                        resp.message,
                        true,
                        3000
                    );
                }
            })


        }
    });

    $(document).on("change", 'input[name="userScope"]', function () {
        const selectedType = $(this).val();
        if (selectedType === "branch") {
            $("#branchUserSection").show();
            loadRolesAndBranches({ branch_specific: true });
        } else {
            loadRoles({ branch_specific: false });
            $("#branchUserSection").hide();
            $("#selectAllBranches").prop("checked", false);
            $("#userInvitationBranchesTable input[type='checkbox']").prop("checked", false);
        }
    });


    $(document).on("click", ".resend-invitation", function (e) {
        const { email, userType, branches, roleId } = $(this).data();
       
        const invitationParams = {
            email,
            user_type: userType,
            ...(userType === "branch" && { branches:  JSON.parse(decodeURIComponent(branches)) }),
            ...(userType === "non-branch" && { role_id: roleId })
        };


       $.when(users.inviter(invitationParams)).done(function (resp){
            notification(
                resp.created,
                "center",
                "success",
                "user-invitation",
                "User Invitation Sent",
                "User invitation has been sent successfully",
                true,
                3000
            );
        });
       
    });

    $(document).on("click", "#acceptInvitationBtn", function () {

        $.when(users.register(getRegistrationParams())).done(function (data) {
            if (data.created) {
                toastr.success('Registration Completed!', 'Success', 5000);
                window.location = "index.html";
            } else {
                toastr.error(data.message, 'Error', 5000);
            }
        });
    });

    $(document).on("click", "#add-user", function (e) {
        if (form.validateUserRegistrationForm()) {
            if (formType === 'add') {
                notification(
                    users.add(getUserParams()).created,
                    "center",
                    "success",
                    "users",
                    "Add User",
                    "User has been added successfully",
                    true,
                    3000
                );
            } else {
                notification(
                    users.edit(getUserParams()).updated,
                    "center",
                    "success",
                    "users",
                    "Edit User",
                    "User has been added successfully",
                    true,
                    3000
                );
            }
        }
    });

    $(document).on('click', '#addUserInvitationBtn', function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/user_invitation.html", "user_invitation_form")).done(
            function () {

            }
        );
    });

    $(document).on("click", "#saveUserBranchRolesBtn", function (e) {
        notification(
            users.updateUserBranchRoles({ user_id: $("#userId").val(), branches: selectedBranches }).updated,
            "center",
            "success",
            "user_branch_roles",
            "Update User Branch Roles",
            "User branch roles has been updated successfully",
            true,
            3000
        );
    });

    $(document).on("click", ".edit-user-role", function (e) {
        const opener = $(this).data();
        const branches = opener.branches;
        const roles = opener.roles;

        $.when(contentLoader.loadIndividualRecordView("views/forms/user_invitation.html", "user_invitation_form"))
            .done(function () {
                $("#cardTitle").text("Edit User Branch Roles");
                $("#inviteUser").text("Save Role").attr("id", "saveUserBranchRolesBtn");

                $.when(loadRolesAndBranches()).done(function () {

                    $("#email").val(opener.email);
                    $("#userId").val(opener.userId);

                    branches.forEach(function (branch) {
                        $(`#branch_${branch.branch_id}`).prop("checked", true);
                        $(`#role-selector${branch.branch_id}`).val(branch.role_id).trigger("change");
                        selectedBranches.push({ branch_id: branch.branch_id, role_id: branch.role_id });
                    });

                    //$("#selectAllBranches").prop("checked", true);

                });
            });
    });

    // Listen to the "Select All" checkbox
    $(document).on("change", "#selectAllBranches", function () {
        const isChecked = $(this).is(":checked");

        // Check/uncheck all individual branch checkboxes
        $(".branch-checkbox").each(function () {
            $(this).prop("checked", isChecked).trigger("change");
        });
    });

    $(document).on("change", ".branch-checkbox", function () {
        const all = $(".branch-checkbox").length;
        const checked = $(".branch-checkbox:checked").length;
        const isChecked = $(this).is(":checked")

        $("#selectAllBranches").prop("checked", all === checked);
        const data = $(this).data();
        const role_id = $(`#role-selector${data.branchId}`).val();

        if (isChecked) {
            selectedBranches.push({ branch_id: data.branchId, role_id: role_id });
        } else {
            selectedBranches = selectedBranches.filter(function (item) {
                return item.branch_id !== data.branchId;
            });
        }

    });

    $(document).on("change", ".role-selector", function () {
        const data = $(this).data();
        const isChecked = $(`#branch_${data.branchId}`).is(":checked");

        if (isChecked) {
            const role_id = $(`#role-selector${data.branchId}`).val();

            // Find the branch in the selectedBranches array and update the role_id
            const existing = selectedBranches.find(b => b.branch_id === data.branchId);
            if (existing) {
                existing.role_id = role_id;
            }
        }

    });

    $(document).on("change", "#bulkRole", function () {
        const value = $(this).val();

        if (value !== "" && value !== null) {
            $(".role-selector").val(value).trigger("change");
        } else {
            $(".role-selector").val("").trigger("change");
        }

    });

    $(document).on('show.bs.modal', '#modal-register-user', function (e) {
        clearFields()
        const opener = e.relatedTarget;
        formType = $(opener).attr('data-button-type');

        $.when(users.fetchRoles()).done(function (roles) {
            let rolesArray = []

            if (typeof roles !== undefined && roles !== null && roles !== '') {
                roles.forEach(function (role, index) {
                    rolesArray.push(
                        '<option value ="',
                        role.id,
                        '">',
                        `${role.name}`,
                        "</option>"
                    );
                });

                $("#role").html(rolesArray.join(""));

            }

        });

        $.when(account.fetchBranches()).done(function (branches) {
            let branchesArray = []

            if (typeof branches !== undefined && branches !== null && branches !== '') {

                branches.forEach(function (branch, index) {
                    branchesArray.push(
                        '<option value ="',
                        branch.id,
                        '">',
                        `${branch.name}`,
                        "</option>"
                    );
                });

                $("#branchSelector").html(branchesArray.join(""));

            }

        })


        //Checking if the button clicked was a edit or add
        /* if (formType === 'add') {
             $('.modal-title').text("Add User");
         } else {
             $('.modal-title').text("Edit User")
             let $userModal = $('#modal-register-user')
             $.each(opener.dataset, function (key, value) {
                 $userModal.find(`[id = '${key}']`).val(value).change();
             });
         }*/
    });



    $(document).on('show.bs.modal', '#modal-user-role', function (e) {
        const opener = e.relatedTarget;
        formType = $(opener).attr('data-button-type');
        const roleId = $(opener).attr('data-role-id');
        const userId = $(opener).attr('data-user-id');


        $.when(users.fetchRoles()).done(function (roles) {
            let rolesArray = []

            if (typeof roles !== undefined && roles !== null && roles !== '') {
                roles.forEach(function (role, index) {
                    rolesArray.push(
                        '<option value ="',
                        role.id,
                        '">',
                        `${role.name}`,
                        "</option>"
                    );
                });

                $("#editUserRoleForm").find('[id="role"]').html(rolesArray.join(""));

                $("#editUserRoleForm").find(`[id = 'role']`).val(roleId).trigger('change');
                $("#editUserRoleForm").find(`[id = 'userId']`).val(userId);

            }

        });
    });

    $(document).on("click", "#updateRoleBtn", function () {
        const user_id = $("#editUserRoleForm").find('[id="userId"]').val();
        const role_id = $("#editUserRoleForm").find('[id="role"]').val();

        notification(
            users.updateUserRole({ user_id: user_id, role_id: role_id }).updated,
            "center",
            "success",
            "user_role",
            "Update User Role",
            "User role has been updated successfully",
            true,
            3000
        );

    });

    $(document).on('show.bs.modal', '#modal-delete-user', function (e) {
        let opener = e.relatedTarget;
        let user_id = $(opener).attr('data-id')
        let username = $(opener).attr('data-username');

        let modal = $('#modal-delete-user');
        modal.find('[id="del-user-id"]').val(user_id);
        modal.find('[id="del-user-message"]').text("Are you sure you want to delete " + username + "?");
    });

    $(document).on('click', '#del-user-btn', function (e) {
        let user_id = $("#del-user-id").val();

        notification(
            users.delete_user({ user_id: user_id }).deleted,
            "center",
            "success",
            "delete-user",
            "Delete User",
            "User has been deleted successfully",
            true,
            3000
        );
    });

    $(document).on('click', '#settings-link', function (e) {
        $.when($("#modal-profile").modal("show")).done(function () {
            $("#profileUsername").attr('disabled', true);
            $("#profileUsername").val(sessionStorage.getItem("username"));
            $("#saveProfile").attr('disabled', true);
            // $("#newPassword").attr('disabled', true);
            $("#confirmPassword").attr('disabled', true);
        });
    });

    $(document).on('blur', '#curPassword', function (e) {
        let curPassword = $("#curPassword").val();
        let email = sessionStorage.getItem("email");
        let user_id = sessionStorage.getItem("user_id");

        $("#invalidPassword").text("");
        $("#newPassword").attr('disabled', true);

        if (curPassword !== "" && curPassword !== null) {
            $.when(users.verifyCurPasword({
                user_id: user_id,
                email: email,
                cur_password: curPassword
            })).done(function (data) {
                if (!data.valid_password) {
                    $("#invalidPassword").text(`Invalid Password`);
                } else {
                    $("#newPassword").attr('disabled', false);
                }
            });
        }
    });

    $(document).on('blur', '#newPassword', function (e) {
        let newPassword = $("#newPassword").val();
        $("#wrongPassword").text("");
        $("#confirmPassword").attr('disabled', true);

        if (newPassword !== "" && newPassword !== null) {
            if (!validatePassword(newPassword)) {
                $("#wrongPassword").text(`Password should have at 
                least 6 characters, containing at least
                 one alphanumeric character, one number, 
                 and one special character`);
            } else {
                $("#confirmPassword").attr('disabled', false);
            }
        }
    });

    $(document).on('blur', '#confirmPassword', function (e) {
        let confirmPassword = $("#confirmPassword").val();
        let newPassword = $("#newPassword").val();

        $("#wrongPasswordMatch").text("");

        if ((newPassword !== "" && newPassword !== null) && (confirmPassword !== "" && confirmPassword !== null)) {
            if (!(newPassword === confirmPassword)) {
                $("#wrongPasswordMatch").text(`Does not match with new password`);
                $("#saveProfile").attr('disabled', true);
            } else {
                $("#saveProfile").attr('disabled', false);
            }
        }
    });

    $(document).on('click', '#saveProfile', function (e) {
        let user_id = sessionStorage.getItem("user_id");
        let newPassword = $("#newPassword").val();

        $.when(users.updateProfile({ user_id: user_id, new_password: newPassword })).done(
            function (data) {
                if (data.updated) {
                    // notify("center", "success", "Updated Profile", "User has been deleted successfully", false, 1500);
                    $("#modal-profile").modal("hide");
                } else {
                    // notxify("center", "warning", "Updated Profile", "Failed to update user profile", false, 1500);
                    $("#modal-profile").modal("hide");
                }

            });
    });

    $(document).on('click', '#sendOTPBtn', function (e) {
        let email = $("#recoveryEmail").val();

        $.when(users.sendOTP({ email: email })).done(
            function (data) {
                if (data.otp_sent) {
                    localStorage.setItem("recoveryEmail", email);
                    $("#forgot-password-container").html("");

                    $("#forgot-password-container").html(`
                           <div class="card-body">
                    <p class="login-box-msg">Verify OTP ( Enter OTP Sent to your Email Address)</p>

                    <div class="input-group mb-3">
                        <input id="otpCode" type="text" class="form-control" placeholder="OTP">
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <span class="fas fa-barcode"></span>
                            </div>
                        </div>
                    </div>

                    <!-- Countdown Timer Display -->
                    <p id="countdownText" class="text-danger font-weight-bold">OTP expires in: <span id="countdown">30</span> seconds</p>

                    <div class="row">
                        <div class="col-12">
                            <button id="verifyOTPBtn" class="btn btn-success btn-block">Verify OTP</button>
                        </div>
                        <!-- /.col -->
                    </div>

                    <p class="mt-3 mb-1">
                        <a href="forgot_password.html">Resend Email</a>
                    </p>
                </div>
                        `);


                    runDownOTP();


                } else {

                }
            }
        )
    });

    $(document).on('click', '#verifyOTPBtn', function (e) {
        let otpCode = $("#otpCode").val();
        let email = localStorage.getItem("recoveryEmail");

        $.when(users.verifyOTP({
            otp_code: otpCode,
            email: email
        })).done(
            function (data) {
                if (data.valid_otp) {
                    $.when(users.saveSessionDetails(data)).done(function () {
                        window.location = "thumba.html";
                    });

                } else {

                }
            }
        )
    });

    $(document).on('click', '#saveRoleBtn', function (e) {
        if (form.validateRoleFormData()) {
            $.when(users.addRole(getRoleParams())).done(function (data) {
                if (data.created) {
                    notification(
                        true,
                        "center",
                        "success",
                        "roles",
                        "Add Role",
                        "Role has been added succesfully",
                        true,
                        3000
                    );
                }
            });
        }
    });


});

function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return regex.test(password)
}

function getUserInvitationParams() {

    const email = $("#email").val();
    const role = $("#bulkRole").val();
    const userType = $('input[name="userScope"]:checked').val();

    if (userType === "branch") {
        if (
            selectedBranches &&
            selectedBranches.length > 0 &&
            selectedBranches.every(branch => branch.role_id && branch.role_id !== "")
        ) {
            return {
                user_type: userType,
                email: email,
                branches: selectedBranches
            };
        } else {
            notify(
                "center",
                "error",
                "Cannot Proceed",
                "Please select at least one branch and assign a role to each.",
                3000,

            )
        }

    } else if (userType == "non-branch")
        if (role !== "" && typeof role !== undefined && role !== null) {
            return {
                user_type: userType,
                email: email,
                role_id: role
            }
        } else {
            notify(
                "center",
                "error",
                "Cannot Proceed",
                "Please select a role",
                3000
            )
        }

}

function getRegistrationParams() {
    const url = new URL(window.location.href);

    // Use URLSearchParams to get the token value from the query string
    const url_params = new URLSearchParams(url.search);
    const token = url_params.get('token');
    const username = $("#username").val();
    const identifier = $("#identifier").val();
    const identifierType = $("#identifierType").val();
    const firstname = $("#firstname").val();
    const lastname = $("#lastname").val();
    const password = $("#password").val();

    let params = {
        identifier: identifier,
        identifier_type_id: identifierType,
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password,
        token: token
    }

    return params;
}

function getUserParams() {
    let user_id = $("#userId").val();
    let username = $("#username").val();
    let firstname = $("#firstname").val();
    let lastname = $("#lastname").val();
    let national_id = $("#nationalId").val();
    let email = $("#email").val();
    let role = $("#role").val();

    let params = {
        user_id: user_id,
        national_id: national_id,
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        role: role
    }

    return params;
}

function getRoleParams() {
    const name = $("#roleName").val();
    const privileges = $("#privileges").val();
    const branchSpecific = $("#branchSpecific").is(":checked");

    return { name: name, privileges: privileges, branch_specific: branchSpecific };
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
            if (recordType === "user_role") {
                $.when(users.fetchUsers()).done(function () {
                    $("#modal-user-role").modal("hide");
                });
            } else if (recordType === "user-invitation") {
                $.when(users.fetchInvitations()).done(function () {
                    $("#modal-register-user").modal("hide");
                });
            } else if (recordType === "delete-user") {
                $.when(users.fetchUsers()).done(function () {
                    $("#modal-delete-user").modal("hide");
                });
            } else if (recordType === "roles") {
                $.when(users.fetchRoles()).done(function () {
                    $("#modal-role").modal("hide");
                });
            }
        });
}

function clearFields() {
    $("#username").val("");
    $("#firstname").val("");
    $("#lastname").val("");
    $("#nationalId").val("");
    $("#email").val("");

}

function runDownOTP() {
    let countdown = 30; // OTP expiration time in seconds
    const countdownElement = document.getElementById("countdown");
    const countdownText = document.getElementById("countdownText");
    const verifyButton = document.getElementById("verifyOTPBtn");

    const timer = setInterval(function () {
        if (countdown > 0) {
            countdown--;
            countdownElement.textContent = countdown;
        } else {
            clearInterval(timer);
            countdownText.innerHTML = `<span class="text-danger">Sent OTP expired</span>`;
            verifyButton.disabled = true; // Disable the Verify OTP button
        }
    }, 1000); // Runs every second
}

function loadRolesAndBranches() {
    selectedBranches = []

    $.when(account.fetchBranches("user_invitation")).done(function (branches) {
        loadRoles({ branch_specific: true });
    });
}

function loadRoles(params) {
    $.when(users.fetchRoles(params)).done(function (roles) {
        let rolesArray = []

        if (typeof roles !== undefined && roles !== null && roles !== '') {
            rolesArray.push(`<option value="">-- Select Default Role --</option>`);
            roles.forEach(function (role, index) {
                rolesArray.push(
                    '<option value ="',
                    role.id,
                    '">',
                    `${role.name}`,
                    "</option>"
                );
            });

            $("#bulkRole").html(rolesArray.join(""));
            $(".role-selector").html(rolesArray.join(""));
            $(".role-selector").select2();
        }

    });
}

