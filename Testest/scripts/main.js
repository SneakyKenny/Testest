$(function() {
	var template = $("#Template").html();

	var Kenny = {
		name: "Kenny",
		food: "chocolate"
	};

	var Dominique = {
		name: "Dominique",
		food: "Bourger"
	};

	$("#Content").html(Mustache.render(template, Kenny));

	$("body").on("click", "#ChangePerson", function () {
		$("#Content").html(Mustache.render(template, Dominique));
	});


	$("body").on("click", "#ShowBigPicture", function (event) {
		event.preventDefault();

		var self = $(this);
		
		var fileName = String(self.attr("href"));

		swal({
			imageUrl: fileName,
			showConfirmButton: true,
			showCloseButton: false,
			focusConfirm: true,
			confirmButtonText: "Sauvegarder l'image.",
			width: '1280px'
		}).then((result) => {
		    if (result.value) {
				var link = document.createElement("a");

			    link.setAttribute("href", fileName);

			    fileName = fileName.substr(fileName.lastIndexOf('/') + 1);

			    link.setAttribute("download", fileName);

			    link.click();
			}
		});
	});
});


