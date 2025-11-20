
import * as user from "../services/users.js";

$(document).ready(function () {
     sessionStorage.clear();

    $('#loginBtn').on('click', function(e){
        const username = $('#email').val();
        const password = $('#password').val();
        const params = { username: username, password: password }
        user.login(params);
    });

    $(document).on('click', '#passwordVisibility', function(e){
        if($("#passwordVisibility").hasClass("fa-eye"))
            passwordVisibility("text","fa-eye", "fa-eye-slash");
        else
            passwordVisibility("password","fa-eye-slash", "fa-eye");
    
    });

    $('#homeBtn').on('click', function(e){
        window.location = "index.html";
    });

    $(document).on('keyup', '#email', function (e) {
        $("#invalidCredentials").text("");
    });

    $(document).on('keyup', '#password', function (e) {
        $("#invalidCredentials").text("");
    });

});

function passwordVisibility(attr, oldIconClass, newIconClass){
    $("#password").attr("type", attr);
    $("#passwordVisibility").removeClass(oldIconClass).addClass(newIconClass);

}
