import * as account from "../services/account.js";
import * as form from "../utils/forms.js"
import { toastNote } from "../utils/utils.js"
import * as contentLoader from "../actions/contentLoader.js";
import * as users from "../services/users.js";

$(document).ready(function () {

    $(document).on("click", "#btnBranchBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/branches.html", "branches_form")).done(
            function () {
                populateUsers();
            }
        );
    });

    $(document).on("click", "#branchBackBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/settings/branches.html", "branches")).done(
            function () {
              account.fetchBranches("account");
            }
        );
    });

    $(document).on("click", "#registerBtn", function (e) {
        e.preventDefault();

        if (account.register(registerAccountParams()).created) {
            $("#registration-container").html("");

            $("#registration-container").append(
                `<h4 class="login-box-msg" style="opacity: 0;">Account Registered Successfully</h4>
             <img src="dist/img/tick.png" class="tick_image" alt="some image" style="opacity: 0;">`
            );

            // Custom animation
            $(".login-box-msg").animate({ opacity: 1, marginTop: "10px" }, 200);
            $(".tick_image").delay(100).animate({ opacity: 1, marginTop: "100px" }, 200)
                .animate({ marginTop: "40px" }, 400);

        }

    });

    $(document).on('blur', '#password', function (e) {
        let password = $("#password").val();

        $("#wrongPassword").text("");

        if (password !== "" && password !== null) {
            if (!validatePassword(password)) {
                $("#wrongPassword").text(`Password should have at 
                least 6 characters, containing at least
                 one alphanumeric character, one number, 
                 and one special character`);
            } else {
                $("#registerBtn").attr('disabled', false);
            }
        } else {
            $("#registerBtn").attr('disabled', true);
        }

    });

    $(document).on('blur', '#confirmPassword', function (e) {
        let confirmPassword = $("#confirmPassword").val();
        let password = $("#password").val();

        $("#wrongPasswordMatch").text("");

        if ((password !== "" && password !== null) && (confirmPassword !== "" && confirmPassword !== null)) {
            if (!(password === confirmPassword)) {
                $("#wrongPasswordMatch").text(`Does not match with new password`);
                $("#registerBtn").attr('disabled', true);
            } else {
                $("#registerBtn").attr('disabled', false);
            }
        } else {
            $("#registerBtn").attr('disabled', true);
        }

    });

    $(document).on('change', '.account-status', function (e) {
        // Get the value of the data-active attribute from the checkbox
        let checkbox = $(this);
        let data = checkbox.data();

        notification(
            account.changeAccountStatus({ id: data.id }).updated,
            "center",
            "success",
            "accounts",
            "Account Status",
            "Account status has been changed succesfully",
            true,
            3000
        )
    });

    $(document).on('change', '#logoUpload', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('logoPreview').src = e.target.result;
                document.getElementById('logoPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    $(document).on('click', '#uploadLogoButton', function (e) {
        e.preventDefault();

        const fileInput = document.getElementById("logoUpload");
        const account_id = sessionStorage.getItem("account_id");

        // Access the captured image file
        const files = fileInput.files; // Contains the captured image
        const imageFile = files ? files[0] : null;

        if (imageFile) {
            account.uploadLogo(account_id, imageFile);
        } else {
            console.error("No file selected or captured.");
            alert("Please capture or select an image before uploading.");
        }
    });

    $(document).on('click', '#accountSettingsBtn', function () {

        if (form.validateAccountSettingsForm()) {
            $.when(account.update(accountSettingsParams())).done(function (data) {
                notification(
                    data.updated,
                    "center",
                    "success",
                    "account_settings",
                    "Account Settings",
                    "Account Settings have been saved successfully",
                    true,
                    3000,
                    data
                );
            });


        }
    });

    $(document).on('click', '.edit-branch', function () {
        const data = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/branches.html", "branches_form")).done(
                function () {
                $("#cardTitle").text("Update Branch");

                $.when(populateUsers()).done( function(){
                    $.each(data, function (key, value) {
                        $("#branchForm").find(`[id = '${key}']`).val(value);
                        $("#branchForm").find(`[id = '${key}']`).val(value).trigger("change");
                    });
                });
            }
        );
    });

    $(document).on('click', '#saveBranchBtn', function () {
       if(form.validateBranchForm()){

            if($("#cardTitle").text().trim() === "Add Branch") {
                $.when(account.addBranch(branchParams())).done(function (data) {
                    notification(
                        data.created,
                        "center",
                        "success",
                        "branch",
                        "Add Branch",
                        "Branch has been saved successfully",
                        true,
                        3000,
                        data
                    );
                });

            } else if ($("#cardTitle").text().trim() === "Update Branch") {
                $.when(account.updateBranch(branchParams())).done(function (data) {
                    notification(
                        data.updated,
                        "center",
                        "success",
                        "branch",
                        "Update Branch",
                        "Branch has been saved successfully",
                        true,
                        3000,
                        data
                    );
                });

            }

       }
    });


});


function registerAccountParams() {
    const name = $("#name").val();
    const address = $("#address").val();
    const email = $("#email").val();
    const phoneNumber = $("#phoneNumber").val();
    const username = $("#username").val();
    const userEmail = $("#userEmail").val();
    const identifier = $("#identifier").val();
    const identifierType = $("#identifierType").val();
    const firstname = $("#firstname").val();
    const lastname = $("#lastname").val();
    const password = $("#password").val();

    let params = {
        name: name,
        address: address,
        email: email,
        phone_number: phoneNumber,
        password: password,
        username: username,
        user_email: userEmail,
        firstname: firstname,
        lastname: lastname,
        identifier: identifier,
        identifier_type_id: identifierType
    }

    return params
}

function accountSettingsParams() {
    const name = $("#accountName").val();
    const address = $("#accountAddress").val();
    const email = $("#accountEmail").val();
    const phone_number = $("#accountPhoneNumber").val();
    const account_id = sessionStorage.getItem("account_id");

    let params = {
        account_id: account_id,
        name: name,
        address: address,
        email: email,
        phone_number: phone_number
    }

    return params;
}

function branchParams(){
    const branchId = $("#branchId").val();
    const name = $("#name").val();
    const branchType = $("#branchType").val();
    const location = $("#location").val();
    const emailAddress = $("#emailAddress").val();
    const phoneNumber = $("#phoneNumber").val();
    const manager = $("#managerSelector").val();
    const postalAddress =$("#postalAddress").val();

    let params = {
        id: branchId,
        name: name,
        branch_type: branchType,
        location: location,
        email_address: emailAddress,
        phone_number: phoneNumber,
        manager: manager,
        postal_address: postalAddress
    }

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
    timer,
    data = null
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
                case "accounts":
                    $.when(account.fetchAccounts()).done(function () {

                    });
                    break;
                case "account_settings":
                    sessionStorage.setItem("account_name", data.account.name);
                    sessionStorage.setItem("account_address", data.account.address);
                    sessionStorage.setItem("account_email", data.account.email);
                    sessionStorage.setItem("account_phone_number", data.account.phone_number);
                    populateAccountDetails();
                    break;
                case "branch":

            }
        });
}


function populateUsers(){
    $.when(users.fetchUsers()).done(function (users){

        let usersArray = [];

        users.forEach(function (user, index) {
            usersArray.push(
                '<option value ="',
                user.id,
                '">',
                `Username: ${user.username} | Name: ${user.firstname} ${user.lastname}`,
                "</option>"
            )
        });

        $("#managerSelector").html(usersArray.join(""));
    })
}

function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    return regex.test(password)
}

// Set the details of the account like Name
export function populateAccountDetails() {
    $("#account-name").text(sessionStorage.getItem("account_name"));
    $("#accountName").val(sessionStorage.getItem("account_name"));
    $("#accountAddress").val(sessionStorage.getItem("account_address"));
    $("#accountEmail").val(sessionStorage.getItem("account_email"));
    $("#accountPhoneNumber").val(sessionStorage.getItem("account_phone_number"));
    $("#logoPreview").attr("src", sessionStorage.getItem("account_logo"));
}