// TODO (aucun rapport) : lien grp/evt

var g;
var rowCount = 0;

function OnChangeSelection(pct_array) {
    if (pct_array)
    {
        pct_array.forEach(function (element) {
            // element = pct_id
        });
    }
    else
    {
        // no pct selected
    }
}

// c/c de la doc
// ajout des langages
function InitGantt(format, lang) {
    g = new JSGantt.GanttChart(document.getElementById('gantt_chart'), format);

    if (lang === 'fr') {

        g.setLang('fr')

    } else if (lang === 'en') {

        g.setLang('en');

    } else {

        console.log('undefined language. setting to en');

        g.setLang('en');

    }

    g.setShowEndWeekDate(0);
}

/*
 * Fais une requète ajax pour récupérer les projets sur lequel travaille l'utilisateur en cours
 *
 * @params:
 *      - isOpenedByDefault (bool): Doit-on déplier ou non les projets afin de montrer les postes concernés ?
 *      - isDisplay         (bool): Doit-on ajouter les projet chargés au gantt afin de les afficher ?
 *
 * @return: void
 */

function GetPcts(isOpenedByDefault, isDisplay) {
    var pcts = null;

    $.ajax({
        type: 'GET',
        url: '/extensions/ki_gantt/fonctions.php?action=getPcts',

        success: (result) => {

            pcts = $.parseJSON(result);

            if(isDisplay) {
                AddToGantt(pcts, isOpenedByDefault);
            }

        },
        error: (error) => {
            console.log("error: " + error);
        }
    });
}

/*
 * Ajoute chacun des projets au gantt afin de les afficher
 *
 * @params:
 *      - pcts      (JSONArray): La liste des projets à ajouter et afficher
 *      - isOpenedByDefault: Doit-on déplier ou non les projets afin de montrer les postes concernés ?
 *
 * @return: void
 */

function AddToGantt(pcts, isOpenedByDefault, isLooping = false) {

    $.each(pcts, function(index, pct) {

        var start = new Date(pct.start_date), end = new Date(pct.end_date);
        var alpha = new Date(pct.alpha_date), beta = new Date(pct.beta_date);

        if (!isNaN(start) && !isNaN(end) ) {

            // console.log(pct.pct_name);
            // console.log(pct.start_date, pct.end_date);

            g.AddTaskItem(
                // TODO: les jours de travail se dissipent sur plus de temps ?
                new JSGantt.TaskItem(
                    pct.pct_ID, // id
                    pct.pct_name != "" ? pct.pct_name: "Sans nom", // name
                    pct.start_date, // start_date
                    pct.end_date, // end_date
                    'ggroupblack', // css
                    '', // link
                    0, // isMilestone
                    '', // resource
                    0, // completion
                    1, // hierarchy
                    0, // parent
                    isOpenedByDefault ? 1 : 0, // isOpenedByDefault
                    '', // dependencies
                    '', // caption
                    pct.pct_comments, // notes
                    g // gantt
                )
            );

            rowCount++;

            // TODO: Milestones

            GetEvtsForPct(pct);

        } else {
            // console.log('pct has invalid date, skipping');
        }

    });

    if (g.getDivId() != null) {
        g.Draw();
    }
    else {
        console.log("couldn't find the div for the gantt to draw in.");
    }

}

/*
 * Récupère les postes associés à un projet
 *
 * @params:
 *      - pct (JSONObject): le projet à partir duquel on souhaite récupérer les postes associés
 *
 * @return: void
 */

function GetEvtsForPct(pct) {
    $.ajax({
        // TODO: comments
        async: false,
        type: 'GET',
        url: '/extensions/ki_gantt/fonctions.php?action=get_evt_for_pct',
        data: 'current_pct_ID=' + pct.pct_ID,

        success: (result) => {

            var evts = $.parseJSON(result);

            AddEvtsToGantt(pct, evts);

        },

        error: (error) => {
            //console.log("Error with request: " + error);
        }
    });
}

/*
 * Ajoute les postes associés à un projet au gantt pour les afficher dans le rendu final
 *
 * @params:
 *      - pct (JSONObject): le projet à partir duquel on a récupéré les postes associés
 *      - evts (JSONArray): la liste des postes que l'on souhaite ajouter au gantt
 *
 * @return: void
 */

function AddEvtsToGantt(pct, evts) {

    if ($.isEmptyObject(evts)) {

        // console.log("this project doesn't have any evt linked to it. (" + pct.pct_name + ')');

    } else {

        $.each(evts, (evt_local_id, evt) => {

            // TODO: change these names in the database to begin_date, end_date
            var evt_start = new Date(evt.evt_date_begin), evt_end = new Date(evt.evt_date_end);

            if (isNaN(evt_start) || isNaN(evt_end) || evt.evt_date_begin.includes('0000-00-00 00:00:00') || evt.evt_date_end.includes('0000-00-00 00:00:00')) {

                // console.log('undefined date, skipping current evt. (' + evt.evt_name + ', id: ' + evt.evt_ID + '), pct: ' + pct.pct_ID);

            } else {

                var dep = ParseDependencies(pct, evt);

                g.AddTaskItem(
                    new JSGantt.TaskItem(
                        10000 * Number(evt.evt_ID) + Number(pct.pct_ID),
                        evt.evt_name,
                        evt.evt_date_begin,
                        evt.evt_date_end,
                        'gtaskred',
                        '',
                        0,
                        '',
                        evt.evt_completion * 100,
                        0,
                        pct.pct_ID,
                        1,
                        dep,
                        '',
                        '',
                        g
                    )
                );

                rowCount++;
            }
        });
    }
}

/*
 * Crée le string correspondant aux dépendances d'un poste par rapport à un projet
 *
 * @params:
 *      - pct (JSONObject): le projet à partir duquel on a récupéré les postes associés
 *      - evt (JSONObject): le poste dont on souhaite récupérer les dépendances
 *
 * @return: les dépendances d'un poste pour un projet, séparées par des virgules
 * @return-type: string
 */

function ParseDependencies(pct, evt) {

    var dep = [];
    //dep.push((Number(pct.pct_ID) + 'SS'));

    for (var i = 9; i < evt.evt_dependencies.length; i += 11) {
        dep.push((Number(evt.evt_dependencies[i] * 10000) + Number(pct.pct_ID) + 'FS'));
    }

    return dep.join();
}

function ProcessImportExport(index) {
    switch (index) {
        case 0:
            return false;
        case 1:
            return ProcessImport();
        case 2:
            return ProcessExport();
    }
}

function ProcessImport() {
    $('#import_options').toggle();

    document.getElementById('import_xls_file_selector').addEventListener('change', ImportFile, false);
}

function ImportFile(evt) {
    var file = evt.target.files[0];

    document.getElementById('import_xls_file_selector').removeEventListener('change', ImportFile);

    var reader = new FileReader();

    var output = '';

    reader.onload = function (e) {
        output = reader.result;
        LoadGanttFromXmlString(output);
    };

    reader.readAsText(file);

}

function GetXmlFromDirectInput () {
    var xml = $("#import_xls_direct").val();

    LoadGanttFromXmlString(xml);
}

function LoadGanttFromXmlString(xml) {

    var g2 = new JSGantt.GanttChart(document.getElementById('loaded_gantt_chart'), 'day');

    $('#gantt_chart').toggle();

    document.getElementById("the_form").reset();
    document.getElementById("the_2form").reset();

    $('#import_options').toggle();

    JSGantt.parseXMLString(xml, g2);

    g2.Draw();

}

function ProcessExport() {
    try {
        var xml = g.getXMLProject();

        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([xml], {type: 'text/xml'}));
        a.download = 'Gantt_project.xml';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        return true;
    } catch (Exception) {
        return false;
    }
}