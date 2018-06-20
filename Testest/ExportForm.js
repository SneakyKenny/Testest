$(function() {
	$("#buttonZIP").on("click", function (event) {
		event.preventDefault();
		console.log("^_^");

		$.ajax({
			type: 'POST',
			url: 'formExportController.php', // url to the php file
			data: {functionname: 'test'}, // change that
			success: function (data) {
				console.log(data);
				console.log(data.length);
			}
		});
	});
});