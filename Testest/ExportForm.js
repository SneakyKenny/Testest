if (!window.jQuery)
{
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = "scripts/jquery-1.9.1.min.js";
    document.getElementsByTagName("head")[0].appendChild(script);
}

jQuery("body").on("click", ".buttonZIP", function (event) {
    event.preventDefault();
    $.ajax({
        method: "POST",
        url: "webservice/php/formExportController.php",
        data: {nomenclature: jsNomenclature, appelAjax: 'oui', exportFormat: jQuery(this).attr("rel")}
    }).done(function (data) {
        
    });
    return false;
});