<?php

switch($_POST["functionname"])
{
    case 'test':
        test();
        break;
}

function test () {
	echo (CreateZIP());
}

function CreateZIP() {
	$filename = "FichiersCompressés.zip";

	$zip = new ZipArchive();

	$isOpen = $zip->open($filename, ZipArchive::CREATE);

	$zip->addFromString("FichierCompressé.txt", "Contenu aléatoire... OwO");

	if ($isOpen) {
		$zip->close();
		return $filename;
	} else {
		return "error";
	}
}

?>