<?php /* Smarty version 2.6.20, created on 2018-07-18 15:06:04
         compiled from main.tpl */ ?>
<html>
    <head>
        <!-- Gantt -->
        <link rel="stylesheet" type="text/css" href="../libraries/jQueryGantt/jsgantt.css" />
        <script language="javascript" src="../libraries/jQueryGantt/jsgantt.js"></script>
        <!-- /Gantt -->
    </head>
    <body>
        <?php echo '
            <script type="text/javascript">

                // lors du chargement de la page
                $(document).ready(function () {
                    gt_ext_onload();

                    // charger le loader du gantt, l\'initialiser et ajouter les projets
                    $.getScript("../extensions/ki_gantt/js/gantt_loader.js", () => {

                        InitGantt(\'day\', \''; ?>
<?php echo $this->_tpl_vars['kga']['lang']['language']; ?>
<?php echo '\');

                        GetPcts(true, true);

                        document.getElementById(\'import_xls_file_selector\').addEventListener(\'change\', ImportFile, false);

                    });
                });

            </script>
        '; ?>


        <div id = 'gantt_chart' class = 'gantt'>
            <!-- <p>GoogleChart's GANTT goes here</p> -->
            <!-- ...actual chart... -->
        </div>

        <div id = 'loaded_gantt_chart' class = 'gantt'>

        </div>
    </body>
</html>

