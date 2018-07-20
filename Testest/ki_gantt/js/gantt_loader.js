// TODO (aucun rapport) : lien grp/evt

var g;

var format, lang;

var pcts_save = [], evts_save = [];

function OnChangeSelection(pct_array) {
    if (pct_array)
    {
        pct_array.sort();
        var selected_pcts = [];
        $.each(pct_array, function (i,e) {
            var tmp_pct = GetPctFromGanttId(e);
            console.log(e, tmp_pct);
            if (tmp_pct != undefined)
                selected_pcts.push(tmp_pct);
        });

        AddToGantt(selected_pcts, true, true);
    }
    else
    {
        InitGantt();
        Reset();
    }
}

// c/c de la doc
// ajout des langages
function InitGantt(_format, _lang) {
    //TODO: élargir les colonnes et en afficher plus
    if (_format)
        format = _format;

    if(_lang)
        lang = _lang;

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

function InitSecondGantt() {
    var g2 = new JSGantt.GanttChart(document.getElementById('loaded_gantt_chart'), format);

    if (lang === 'fr') {

        g2.setLang('fr')

    } else if (lang === 'en') {

        g2.setLang('en');

    } else {

        console.log('undefined language. setting to en');

        g2.setLang('en');

    }

    g2.setShowEndWeekDate(0);

    return g2;
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

function AddToGantt(pcts, isOpenedByDefault, isReset) {

    if(isReset) {
        g.emptyList();
    }

    $.each(pcts, function(index, pct) {

        var start = new Date(pct.start_date), end = new Date(pct.end_date);
        var alpha = new Date(pct.alpha_date), beta = new Date(pct.beta_date);

        pcts_save.push(pct);

        if (!isNaN(start) && !isNaN(end) ) {

            // console.log(pct.pct_name);
            // console.log(pct.start_date, pct.end_date);


            g.AddTaskItem(
                new JSGantt.TaskItem(
                    pct.pct_ID, // id
                    pct.pct_name, // name
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

            // TODO: Milestones

            GetEvtsForPct(pct);

        } else {
            if (isReset) {
                // console.log('pct has invalid date, skipping');
            }
        }

    });

    $("#gantt_chart").show();

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

            evts_save.push(evt);

            var evt_start = new Date(evt.evt_start_date), evt_end = new Date(evt.evt_end_date);

            if (isNaN(evt_start) || isNaN(evt_end) || evt.evt_start_date.includes('0000-00-00 00:00:00') || evt.evt_end_date.includes('0000-00-00 00:00:00')) {

                // console.log('undefined date, skipping current evt. (' + evt.evt_name + ', id: ' + evt.evt_ID + '), pct: ' + pct.pct_ID);

            } else {


                var dep = ParseDependencies(pct, evt);

                g.AddTaskItem(
                    new JSGantt.TaskItem(
                        10000 * Number(evt.evt_ID) + Number(pct.pct_ID),
                        evt.evt_name,
                        evt.evt_start_date,
                        evt.evt_end_date,
                        'gtaskred',
                        '',
                        0,
                        evt.evt_budget + 'j',
                        evt.evt_budget_used / evt.evt_budget * 100,
                        0,
                        pct.pct_ID,
                        1,
                        dep,
                        '',
                        '',
                        g
                    )
                );
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

/*
 * Fonction appelée lors du choix d'une option dans le dropdown, détecte si l'utilisateur a choisi import ou export
 *
 * @params:
 *      - index (int): l'index de l'option choisie dans la liste
 *
 * @return: bool (false, as in event.preventDefault())
 */

function ProcessImportExport(index) {
    switch (index) {
        case 0:
            $('#import_options').hide();
            return false;
        case 1:
            return ProcessImport();
        case 2:
            return ProcessExport();
        case 3:
            $('#gantt_chart').show();
            $('#loaded_gantt_chart').hide();
            $('#import_options').hide();
            if(document.getElementById("the_form") != null)
                document.getElementById("the_form").reset();

            if(document.getElementById("the_second_form") != null)
                document.getElementById("the_second_form").reset();
            return false;
    }
}

/*
 * Affiche le menu permettant de choisir un fichier à importer et/ou de copier/coller du texte brute pour l'import du gantt (au format xml)
 *
 * @params: []
 *
 * @return: bool (false, as in event.preventDefault())
 */

function ProcessImport() {
    $('#import_options').show();

    document.getElementById('import_xls_file_selector').addEventListener('change', ImportFile, false);

    return false;
}

/*
 * Récupère le fichier chargé et en récupère le contenu afin de charger le gantt
 *
 * @params:
 *      - evt: Paramètre passé lors du onchange du form, il contient le fichier que l'on souhaite charger
 *
 * @return: void
 */

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

/*
 * Récupère la valeur de l'input text afin de charger le gantt depuis le xml donné
 *
 * @params: []
 *
 * @return: void
 */

function GetXmlFromDirectInput () {
    var xml = $("#import_xls_direct").val();

    LoadGanttFromXmlString(xml);
}

/*
 * Charge le gantt depuis le xml passé en paramètre
 *
 * @params:
 *      - xml (string): Chaine de caractères contenant le xml permettant de charger le gantt
 *
 * @return: void
 */

function LoadGanttFromXmlString(xml) {

    var g2 = InitSecondGantt();

    Reset();

    JSGantt.parseXMLString(xml, g2);

    g2.Draw();

}

/*
 * Remet à zéro le gantt actuellement sur la page et le formulaire, puis cache le menu d'importation
 *
 * @params: []
 *
 * @return: void
 */

function Reset() {

    $('#gantt_chart').hide();

    if(document.getElementById("the_form") != null)
        document.getElementById("the_form").reset();

    if(document.getElementById("the_second_form") != null)
        document.getElementById("the_second_form").reset();

    $('#import_options').hide();

}

/*
 * Récupère le xml associé au gantt associé à l'utilisateur actuel (PAS FORCEMENT CELUI QUI EST AFFICHE), crée le fichier et le fais télécharger à l'utilisateur
 *
 * @params: []
 *
 * @return: bool (false, as in event.preventDefault())
 */

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

/*
 * Récupère un projet en connaissant l'id qui lui est associé sur le gantt
 *
 * @params:
 *      - id (int): l'id sur le gantt dont on souhaite connaitre le projet associé
 *
 * @return: Object: le projet cherché, undefined si non trouvé
 */

function GetPctFromGanttId(id) {
    var ret;
    $.each(pcts_save, function (i, e) {
        var pctid = Number(e.pct_ID);
        if(pctid == id) {
            ret = e;
            return false;
        }
    });
    return ret;
}

/*
 * Récupère un poste en connaissant l'id qui lui est associé sur le gantt
 *
 * @params:
 *      - id (int): l'id sur le gantt dont on souhaite connaitre le poste associé
 *
 * @return: Object: le poste cherché, undefined si non trouvé
 */

function GetEvtFromGanttId(id) {
    var ret;
    $.each(evts_save, function (i, e) {
        var pctid = Number(e.pct_ID);
        var evtid = Number(e.evt_ID);
        if(10000 * evtid + pctid == id) {
            ret = e;
            return false;
        }
    });
    return ret;
}