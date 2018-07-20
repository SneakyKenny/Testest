<?php

include('../../includes/basics.php');

$usr = checkUser();

$timespace = get_timespace();
$in = $timespace[0];
$out = $timespace[1];

require_once('../../libraries/smarty/Smarty.class.php');
$tpl = new Smarty();
$tpl->template_dir = 'templates/';
$tpl->compile_dir = 'compile/';

$tpl->assign('kga', $kga);

// Create a <select> element to chosse the projects.
$sel = makeSelectBox("pct",$kga['usr']['usr_grp']);
$tpl->assign('sel_pct_names', $sel[0]);
$tpl->assign('sel_pct_IDs', $sel[1]);

$tpl->display('nav.tpl');

$tpl->display('main.tpl');

?>