<?php

include_once($_SERVER["DOCUMENT_ROOT"] . "/includes/autoconf.php");

include('../../includes/basics.php');

$usr = checkUser();

//print_r($usr);

$mysqli = new mysqli($kga['server_hostname'], $kga['server_username'], $kga['server_password'], $kga['server_database']);

if ($_GET['action'] == 'getPcts') {
    $filter = MySQL::SQLValue($usr['usr_grp'], MySQL::SQLVALUE_NUMBER);

    $THEQUERY = "SELECT * FROM grp_pct
                 JOIN pct ON grp_pct.pct_ID = pct.pct_ID
                 WHERE grp_pct.grp_ID=" . $filter;
    $query = $mysqli->query($THEQUERY);

    if ($query == false) return false;

    $main = array();

    while ($row = $query->fetch_assoc()) {
        $childs = array();

        foreach ($row as $key => $value) {
            $childs[$key] = $value;
        }

        $main[$row['pct_ID']] = $childs;

    }
    $main = json_encode($main);

}

if ($_GET['action'] == 'get_evt_for_pct') {

    $pct_id = $_GET['current_pct_ID'];
    
    $filter = MySQL::SQLValue($pct_id, MySQL::SQLVALUE_NUMBER);
    $table = "pct_evt";
    $table2 = "evt";
    $THEQUERY = "SELECT * FROM pct_evt JOIN evt ON pct_evt.evt_ID = evt.evt_ID WHERE pct_evt.pct_ID = $filter";

    $query = $mysqli->query($THEQUERY);

    if ($query == false) return false;

    $main = array();

    while ($row = $query->fetch_assoc()) {
        $main[] = $row;
    }

    $main = json_encode($main);

}

exit ($main);

?>