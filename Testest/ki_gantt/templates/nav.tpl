<div class="header_panel">
    <div class="action_select">
        <form id="the_2form" >
            <div class="selectBox">
                <label for="the_select">Chosisir une action :</label> <br />
                <select id='the_select' class="select-box" onchange='return ProcessImportExport(this.selectedIndex);'>
                    <option>Action</option>
                    <option>Importer</option>
                    <option>Exporter</option>
                    <option>Réinitialiser</option>
                </select>
            </div>
        </form>
    </div>

    <div class="project_select">
        <div class="selectBox action_select_wrapper">
            <label for="evt_pct" class="action_select_wrapper">{$kga.lang.pcts}:</label> <br />
            <select id="gantt_pct_selector" class="formfield search-box" name="pct_selector" multiple="multiple" >
                {html_options values=$sel_pct_IDs output=$sel_pct_names}
            </select>
        </div>
    </div>

    <div id = 'import_options' style="display: none;">
        <form id = 'the_form'>
            <div>
                <label for="xml_file_sel">Choix de fichier</label>
                <input type="file" id="import_xml_file_selector" name="xml_file_sel" accept=".xml"/>
            </div>
            <span>Or by direct input (paste in here):</span>
            <input id = 'import_xml_direct' type = 'text' onchange="GetXmlFromDirectInput();"/>
        </form>
    </div>
    <div class="float-hidden-fix" "></div>
</div>


<script>
    {literal}
        jQuery(".search-box").SumoSelect({
            search: true,
            searchText: 'Rechercher des projets',
        });
        jQuery(".select-box").SumoSelect({floatWidth: "50px",});

        $("#gantt_pct_selector").on('sumo:closed', function () {
            OnChangeSelection($("#gantt_pct_selector").val());
        });
    {/literal}
</script>
<!-- ...TODO: LANGUAGES... -->