<html>
    <head>
        <!-- Gantt -->
        <link rel="stylesheet" type="text/css" href="../libraries/jQueryGantt/jsgantt.css" />
        <script language="javascript" src="../libraries/jQueryGantt/jsgantt.js"></script>
        <!-- /Gantt -->
    </head>
    <body>
        {literal}
            <script type="text/javascript">

                // lors du chargement de la page
                $(document).ready(function () {
                    gt_ext_onload();

                    // charger le loader du gantt, l'initialiser et ajouter les projets
                    $.getScript("../extensions/ki_gantt/js/gantt_loader.js", () => {

                        InitGantt('week', '{/literal}{$kga.lang.language}{literal}');

                        GetPcts(true, true);

                        document.getElementById('import_xml_file_selector').addEventListener('change', ImportFile, false);

                    });
                });

            </script>
        {/literal}

        <div id = 'gantt_chart' class = 'gantt'>
            <!-- <p>GoogleChart's GANTT goes here</p> -->
            <!-- ...actual chart... -->
        </div>

        <div id = 'loaded_gantt_chart' class = 'gantt'></div>
    </body>
</html>


