<?php

switch($_POST["functionname"])
{
    case 'test':
        test();
        break;
}

function test () {
	echo "lambda";
}

?>