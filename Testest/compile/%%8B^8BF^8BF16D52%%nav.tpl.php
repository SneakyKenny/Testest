<?php /* Smarty version 2.6.20, created on 2018-07-20 10:10:41
         compiled from nav.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('function', 'html_options', 'nav.tpl', 21, false),)), $this); ?>
<div class="header_panel">

    <div class="action_select">
        <form id="the_2form" >
            <div class="selectBox">
                <label for="the_select">Chosisir une action :</label> <br />
                <select id='the_select' class="select-box" onchange='ProcessImportExport(this.selectedIndex);' placeholder="BRUHBite" >
                    <option value="0"></option>
                    <option value="1">Importer</option>
                    <option value="2">Exporter</option>
                    <option value="3">Exporter</option>
                </select>
            </div>
        </form>
    </div>

    <div class="project_select">
        <div class="selectBox action_select_wrapper">
            <label for="evt_pct" class="action_select_wrapper"><?php echo $this->_tpl_vars['kga']['lang']['pcts']; ?>
:</label> <br />
            <select id="gantt_pct_selector" class="formfield search-box" name="pct_selector" multiple="multiple" >
                <?php echo smarty_function_html_options(array('values' => $this->_tpl_vars['sel_pct_IDs'],'output' => $this->_tpl_vars['sel_pct_names']), $this);?>

            </select>
        </div>
    </div>

    <div id = 'import_options' style="display: none;">
        <form id = 'the_form'>
            <div>
                <label for="xls_file_sel">Choix de fichier</label>
                <input type="file" id="import_xls_file_selector" name="xls_file_sel" accept=".xml"/>
            </div>
            <span>Or by direct input (paste in here):</span>
            <input id = 'import_xls_direct' type = 'text' onchange="GetXmlFromDirectInput();"/>
        </form>
    </div>
    <div class="float-hidden-fix" "></div>
</div>


<script>
    <?php echo '
    jQuery(".search-box").SumoSelect({
        search: true,
        searchText: \'Rechercher des projets\',
    });
    jQuery(".select-box").SumoSelect({floatWidth: "50px",});

    $("#gantt_pct_selector").on(\'sumo:closed\', function () {
        OnChangeSelection($("#gantt_pct_selector").val());
    });
    $("#the_select").on(\'sumo:closed\', function () {
        console.log($("#the_select"));
        if ($("#the_select").val() == 3){
            $(\'#the_select\')[0].sumo.unSelectAll();
            // /$(\'#the_select\')[0].sumo.selectItem(0);
        }
    });
    '; ?>

</script>
<!-- ...TODO: LANGUAGES... -->