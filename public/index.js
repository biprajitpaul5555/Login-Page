$(".eye-icon").click(() => {
    if ($(".eye-icon").hasClass("fa-eye-slash")) {
        $(".eye-icon").removeClass("fa-eye-slash").addClass("fa-eye");
        $(".pass").attr("type", "text");
    } else {
        $(".eye-icon").removeClass("fa-eye").addClass("fa-eye-slash");
        $(".pass").attr("type", "password");
    }
});

let username = document.getElementsByName("username")[0];
let password = document.getElementsByName("password")[0];
let confirmPassword = document.getElementsByName("confirmPassword")[0];
let flag1 = true;
let flag2 = true;
let flag3 = true;

let validateForm = () => {
    if (username.value === "") {
        $("#userError").text("Email was not given!!!");
        flag1 = false;
    } else {
        $("#userError").text("");
        flag1 = true;
    }
    if (password.value.length < 8) {
        $("#passError").text("Minimum length of password is 8 !!!");
        flag2 = false;
    } else {
        $("#passError").text("");
        flag2 = true;
    }
    if (confirmPassword !== undefined && confirmPassword.value !== password.value) {
        $("#cPassError").text("Passwords do not match!!!");
        flag3 = false;
    } else {
        $("#cPassError").text("");
        flag3 = true;
    }
    return flag1 && flag2 && flag3;
};
