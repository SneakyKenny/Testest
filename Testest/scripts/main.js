$( function () {
	$( "body" ).on ( "click", "#ShowBigPicture", function ( event ) {
		event.preventDefault ();

		var self = $( this );
		
		var fileName = String ( self.attr ( "href" ) );

		var mobileSwal = {
			imageUrl: fileName,
			showConfirmButton: true,
			focusConfirm: true,
			confirmButtonText: "Sauvegarder l'image.",
			showCloseButton: true,
			grow: 'fullscreen'
		};

		var pcSwal = {
			imageUrl: fileName,
			showConfirmButton: true,
			focusConfirm: true,
			confirmButtonText: "Sauvegarder l'image.",
			showCloseButton: true,
			showCancelButton: true,
			cancelButtonText: "Annuler.",
			cancelButtonColor: '#d33',
			width: $(window).width() * 2 / 3
		};

		var swalUsed = $( window ).width () <= 720 ? mobileSwal : pcSwal;
		
		swal( swalUsed ).then( ( result ) => {
		    if ( result.value ) {
				var link = document.createElement( "a" );

			    link.setAttribute( "href", fileName );

			    fileName = fileName.substr ( fileName.lastIndexOf ( '/' ) + 1 );

			    link.setAttribute ( "download", fileName );

			    link.click ();
			}
		});
	});
});