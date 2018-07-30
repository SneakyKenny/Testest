var h, m, s;
var host = "kimai.localhost/core/processor_ext.php";
var isTimerActive = false;

(function() {

    TryAutoLogin();

    var sc = document.createElement("script");
    sc.setAttribute("src", "jquery-1.9.1.min.js");
    sc.setAttribute("type", "text/javascript");
    document.head.appendChild(sc);

    AddDemListeners();

    h = 0; m = 0; s = 0;

})();

function AddDemListeners() {
    document.getElementById('kimai_login_button').addEventListener('click', ConnectToKimai);
    document.getElementById('start_registration').addEventListener('click', StartRegistratingTime);
    document.getElementById('end_registration').addEventListener('click', EndRegistratingTime);
    document.getElementById('logout').addEventListener('click', Logout);
}

function TryAutoLogin() {

    $("#loading").show();

    var http = new XMLHttpRequest();
    var url = 'http://' + host + '?axAction=autologin';
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var respData = http.response;

            var res = $.parseJSON(respData);

            if (res.success) {
                console.log(res);

                $("#login").show();

                if(res.project_running)
                {
                    $("#start_registration").hide();
                    $("#end_registration").show();

                    $("#dropdowns").hide();
                    $("#alt_to_dropdowns").show();

                    $("#current_pct").text('Projet: ' + res.project_running.pct_name);
                    $("#current_evt").text('Poste: ' + res.project_running.evt_name);

                    isTimerActive = true;
                    SetTimerValue(Math.floor(new Date().getTime() / 1000) - res.project_running.zef_in );
                    TimerIncrement();

                } else {
                    $("#start_registration").show();
                    $("#end_registration").hide();
                }

                $("#login_form_container").hide();
                $("#login_failed_container").hide();
                $("#time_registration_form_container").show();

                SetProjects(res.pct_arr);

                ApplySumoSelect();
            } else {
                ShowError('error when trying to autologin:', res.error);
                $("#login_form_container").show();
            }
        }
        $("#loading").hide();
    };
    http.send(null);

}

function ConnectToKimai () {

    $( "#kimai_login_button" ).prop( "disabled", true );
    $("#loading").show();

    var login = $("#kimai_login_login").val();
    var password = $("#kimai_login_password").val();

    var http = new XMLHttpRequest();
    var url = 'http://' + host + '?axAction=login';
    var params = 'name=' + login + '&password=' + password;
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var respData = http.response;

            var res = $.parseJSON(respData);

            if ( res.success ) {

                $("#login").show();

                if( res.project_running )
                {
                    $("#start_registration").hide();
                    $("#end_registration").show();

                    $("#dropdowns").hide();
                    $("#alt_to_dropdowns").show();

                    $("#current_pct").text('Projet: ' + res.project_running.pct_name);
                    $("#current_evt").text('Poste: ' + res.project_running.evt_name);

                    isTimerActive = true;
                    SetTimerValue(Math.floor(new Date().getTime() / 1000) - res.project_running.zef_in );
                    TimerIncrement();

                } else {
                    $("#start_registration").show();
                    $("#end_registration").hide();
                }

                $("#login_form_container").hide();
                $("#login_failed_container").hide();
                $("#time_registration_form_container").show();

                SetProjects(res.pct_arr);

                $("#some").html('');

                ApplySumoSelect();
            } else {
                ShowError('error connecting:', res.error);

                $("#login_failed_container").show();
            }
        }
        $("#loading").hide();
        $( "#kimai_login_button" ).prop( "disabled", false );
    };
    http.send(params);

}

function SetProjects(pcts) {
    var sel = $("#kimai_pct_sel");

    $.each(pcts, function (i, e) {
        sel.append('<option value = "' + e.pct_ID + '">' + e.pct_name + '</option>');
    });
}

function ApplySumoSelect() {

}

$('body').on('change', '.kimai_input', function () {
    $("#login_failed_container").hide();
});

$(document).keypress(function(e) {
    if(e.which == 13 && $("#login_form_container").css('display') != 'none') {
        ConnectToKimai();
    }
});

$("#kimai_pct_sel").on("change", function (eventTriggered) {
    $("#evt_dropdown").show();

    var pct_id = getPctId();

    var http = new XMLHttpRequest();
    var url = 'http://' + host + '?axAction=get_evts_for_pct';
    var params = 'pct=' + pct_id;
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {

            var respData = http.response;

            var res = $.parseJSON(respData);

            if (res.success)
                SetEvents(res.evt_arr);
            else
                ShowError('error selecting a project:', res.error);
        }
    };
    http.send(params);
});

function SetEvents(evts) {
    var sel = $("#kimai_evt_sel");

    sel.html('');
    $.each(evts, function (i, e) {
        console.log(e.evt_name);
        sel.append('<option value = "' + e.evt_ID + '">' + e.evt_name + '</option>');
    });
}

function StartRegistratingTime() {
    var pctid = getPctId();
    var evtid = getEvtId();
    if (!pctid || !evtid) {
        console.log("NOOOOOO", pctid, evtid);
        ShowError("Timer", "Le timer ne peut etre lancé si les menus deroulants n'ont pas de valeurs !");
        return;
    }

    var http = new XMLHttpRequest();
    var url = 'http://' + host + '?axAction=start_timer';
    var params = 'pct_id=' + getPctId() + "&evt_id=" + getEvtId();
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var respData = http.response;

            var res = $.parseJSON(respData);

            if (res.success) {

                $("#start_registration").hide();
                $("#end_registration").show();

                $("#dropdowns").hide();
                $("#alt_to_dropdowns").show();

                $("#current_pct").text('Projet: ' + getPctName());
                $("#current_evt").text('Poste: ' + getEvtName());

                $("#timer").show();

                isTimerActive = true;

                TimerIncrement();

            } else {
                ShowError('error starting time registration:', res.error);
            }
        }
    };
    http.send(params);
}

function EndRegistratingTime() {
    var http = new XMLHttpRequest();
    var url = 'http://' + host + '?axAction=stop_timer';
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var respData = http.response;

            var res = $.parseJSON(respData);

            if (res.success) {

                $("#start_registration").show();
                $("#end_registration").hide();

                $("#dropdowns").show();
                $("#alt_to_dropdowns").hide();

                $("#timer").hide();

                isTimerActive = false;

                h = 0; m = 0; s = 0;

            } else {
                ShowError('error ending time registration:', res.error);
            }
        }
    };
    http.send(null);
}

function Logout() {
    var http = new XMLHttpRequest();
    var url = 'http://' + host + '?axAction=logout';
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            var respData = http.response;

            var res = $.parseJSON(respData);

            if (res.success) {

                $("#start_registration").hide();
                $("#end_registration").hide();

                $("#dropdowns").hide();
                $("#alt_to_dropdowns").hide();

                $("#timer").hide();

                $("#login_form_container").show();
                $("#login_failed_container").hide();
                $("#time_registration_form_container").hide();

            } else {
                ShowError('Erreur inconnue', res.error);
            }
        }
    };
    http.send(null);

    $("#login").hide();
}

function getPctId() {
    return $("#kimai_pct_sel").find(":selected").attr('value');
}

function getEvtId() {
    return $("#kimai_evt_sel").find(":selected").attr('value');
}

function getPctName() {
    return $("#kimai_pct_sel").find(":selected")[0].label;
}

function getEvtName() {
    return $("#kimai_evt_sel").find(":selected")[0].label;
}

function ShowError(type, error) {
    // $("#some").html(type + '<br />' + error);
}

function TimerIncrement() {
    s++;

    if (s == 60) {
        s = 0;
        m++;

        if (m == 60) {
            m = 0;
            h++;
        }
    }

    var ss = s.toString().length == 1 ? '0' + s : s;
    var sm = m.toString().length == 1 ? '0' + m : m;
    var sh = h.toString().length == 1 ? '0' + h : h;

    $("#timer").text(sh + ':' + sm + ':' + ss);

    console.log(h, m, s);

    if (isTimerActive) {
        setTimeout(TimerIncrement, 1000);
    }

}

function SetTimerValue(seconds) {
    var fullMin = seconds / 60;
    s = Math.round(seconds % 60);
    h = Math.round(fullMin / 60);
    m = Math.round(fullMin % 60);
}