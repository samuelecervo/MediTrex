$(document).ready(function () {
	$("#doctorSignUp").hide();
	$("#patientBTN").prop("disabled", true);
	$("#patientBTN").click(function () {
		$("#doctorSignUp").hide();
		$("#patientSignUp").show();
		$("#patientBTN").prop("disabled", true);
		$("#doctorBTN").prop("disabled", false);
		$("#DisDoctor").attr("name", "disabledBTN");
		$("#PisDoctor").attr("name", "isDoctor");
	});

	$("#doctorBTN").click(function () {
		$("#patientSignUp").hide();
		$("#doctorSignUp").show();
		$("#doctorBTN").prop("disabled", true);
		$("#patientBTN").prop("disabled", false);
		$("#PisDoctor").attr("name", "disabledBTN");
		$("#DisDoctor").attr("name", "isDoctor");
	});


	$("#patientSignUp").on("submit", function (event) {
		var password = $(this).find("#formSignUpPassword").val();
		var confirmPassword = $(this).find("#formSignUpConfPassword").val();
		if (password!==confirmPassword) {
			alert("Passwords don't match!");
			event.preventDefault();
		}
	});

	$("#doctorSignUp").on("submit", function (event) {
		var password = $(this).find("#formSignUpPassword").val();
		var confirmPassword = $(this).find("#formSignUpConfPassword").val();
		if (password!==confirmPassword) {
			alert("Passwords don't match!");
			event.preventDefault();
		}
	});

});