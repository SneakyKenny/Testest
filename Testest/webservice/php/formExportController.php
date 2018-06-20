<?php

require_once 'PDOFactory.php';
require_once '../ressources/TPLN/TPLN.php';
require_once 'ModuleManager.php';
require_once 'IssueTicketManager.php';
require_once '../ressources/PHPExcel/Classes/PHPExcel.php';
require_once '../ressources/PHPExcel/Classes/PHPExcel/IOFactory.php';
require_once("../ressources/domPDF0.6.2/dompdf_config.inc.php");
header("Access-Control-Allow-Headers: *");

class FormExportController {

	private $pdo;

	private $isOffline;

	public function __construct() {
		$pdoFactory = new PDOFactory();
		$this->pdo = $pdoFactory->getMysqlConnexion();
	}

	public function formExport($postData) {
		$TPLN = new TPLN;
		$TPLN->open('../html/formExport.html');

		if (!empty($postData)) {
			if (!isset($postData['exportFormat'])) {
				header("HTTP/1.0 404 Not Found");
				exit;
			}
			$orderby = 'page ASC';
			if (isset($postData['orderby'])) {
				switch ($postData['orderby']) {
					case 'page':
						$orderby = 'page ASC';
						break;
					case 'date':
						$orderby = 'createdTime DESC';
						break;
				}
			}
			if (isset($postData['nomenclature'])) {
				$module = $this->findModuleByNomenclature($postData["nomenclature"]);
				$result = $this->processExport($module['idModule'], $postData['exportFormat'], $orderby);
			}
			else {
				$result = $this->processExport($postData['idModule'], $postData['exportFormat'], $orderby);
			}

			if ($result !== FALSE && file_exists($result)) {
				$export_file_url = DOMAINE_DIRECTORY_BASE . "upload/tmp/" . basename($result) . PHP_EOL; //local
				if (isset($postData['appelAjax']) && $postData['appelAjax'] == 'oui') {
					switch ($postData["exportFormat"]) {
						case "json":
							$jsonData = file_get_contents($result);
							exit($jsonData);
							break;
						case "xls":
						case "pdf":
						case "zip": // fixme
							$export_file_url = DOMAINE_DIRECTORY_BASE . str_replace("..", "", $result); //local
							exit($this->getReelurl($export_file_url));
							break;
						default:
							exit($this->getReelurl($export_file_url));
							break;
					}
				}
				($TPLN->itemExists('message', 'bloc_form_export_messages') ) ? $TPLN->parse('bloc_form_export_messages.message', '<a href="' . $export_file_url . '">' . basename($result) . '</a>') : null;
				$this->clearTmpFiles('xlsx');
			}
			else {
				($TPLN->itemExists('message', 'bloc_form_export_messages') ) ? $TPLN->parse('bloc_form_export_messages.message', "Export failde.") : null;
				($TPLN->itemExists('message_type', 'bloc_form_export_messages') ) ? $TPLN->parse('bloc_form_export_messages.message_type', "error") : null;
			}
			$this->hydrateFormExport($TPLN);
			$TPLN->write();
		}
		else {
			($TPLN->itemExists('message', 'bloc_form_export_messages') ) ? $TPLN->eraseBloc('bloc_form_export_messages') : null;
			$this->hydrateFormExport($TPLN);
			$TPLN->write();
		}
	}

	public function getReelurl($export_file_url) {
		if ($this->isHTTPS()) {
			return("https://" . $_SERVER["SERVER_NAME"] . $export_file_url);
		}
		return("http://" . $_SERVER["SERVER_NAME"] . $export_file_url);
	}

	protected function clearTmpFiles($extentions) {
		$files = glob(UPLOAD_DIRECTORY . "tmp/" . "*.$extentions");
		$now = time();

		foreach ($files as $file) {
			if (is_file($file)) {
				if ($now - filemtime($file) >= 60 * 60 * 1) { // 1 days
					unlink($file);
				}
			}
		}
	}

	public function findModuleByNomenclature($nomenclature) {
		$query = "SELECT * FROM `module` WHERE `nomenclature` = :nomenclature";
		$requete = $this->pdo->prepare($query);
		$requete->bindValue(':nomenclature', $nomenclature);
		if ($requete->execute()) {
			$requete->setFetchMode(\PDO::FETCH_ASSOC);
			return $requete->fetch();
		}
		throw new PDOException(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}

	protected function processExport($idModule, $format, $orderby = 'page ASC') {

		$issueTicketManager = new IssueTicketManager();
		$issueTicketsList = $issueTicketManager->getIssuesTicketsListByModule($idModule, array('orderby' => $orderby));
		$moduleManager = new ModuleManager();
		$module = $moduleManager->getModule($idModule);
		if (!is_null($issueTicketsList)) {
			switch ($format) {
				case 'xls':
					return $this->processExportXls($issueTicketsList, $module);
				case 'json':
					return $this->processExportJson($issueTicketsList, $module);
				case 'pdf':
					return $this->processExportPdf($issueTicketsList, $module);
				case 'zip':
					return $this->processExportZip($idModule);
				default:
					return false;
			}
		}
	}

	protected function processExportZip($idModule) 
	{
		$zip = new ZipArchive();

		$zip->open('example.zip', ZipArchive::CREATE);
		
		$zip.addFile('pdf.pdf', processExport($idModule, 'pdf'));
		
		$zip.addFile('XlsDate.xls', processExport($idModule, 'xls'));
		
		$zip.addFile('XlsPage.xls', processExport($idModule, 'pdf', 'createdTime DESC'));

		$zip.close();

		if ($isOffline) {
			$zip.setPassword("PASSWORD"); // FIXME
		}

		return "some link";
	}

	protected function processExportXls($Tickets, $module) {
		$objPHPExcel = PHPExcel_IOFactory::createReader('Excel2007');

		$excel = $objPHPExcel->load('../exportTemplate/TICKETS_MODELE.xlsx');
		$sheet = $excel->getSheet(0);

		// url du module
		$sheet->SetCellValue('C2', $module['url']);

		if (is_array($Tickets) && count($Tickets) > 0) {
			$index = 6;
			foreach ($Tickets as $Ticket) {
				$sheet->SetCellValue('B' . $index, $Ticket['page']);
				$sheet->SetCellValue('C' . $index, $Ticket['nom'] . " " . $Ticket['prenom']);
				$sheet->SetCellValue('D' . $index, $Ticket['mail']);
				$sheet->SetCellValue('E' . $index, $Ticket['createdTime']);
				$sheet->SetCellValue('G' . $index, $Ticket['idIssueTicket']);
				$sheet->SetCellValue('H' . $index, $Ticket['objet']);
				$sheet->SetCellValue('I' . $index, $Ticket['commentaires']);
				$url = PROTOCOL . DOMAINE_NAME . DOMAINE_DIRECTORY_BASE . "upload/" . $module['dossier'] . "/" . $Ticket['image_capture'];
				$sheet->getCell('J' . $index)->getHyperlink()->setUrl($url);
				$sheet->SetCellValue('J' . $index, $Ticket['image_capture']);

				//dropDown Catégorie
				$categorie = $sheet->getCell("F" . $index)->getDataValidation();
				$categorie->setType(PHPExcel_Cell_DataValidation::TYPE_LIST);
				$categorie->setShowDropDown(true);
				$categorie->setFormula1('=\'DONNEES\'!$A$1:$A$10');
				//dropDown Priorité
				$priorite = $sheet->getCell("K" . $index)->getDataValidation();
				$priorite->setType(PHPExcel_Cell_DataValidation::TYPE_LIST);
				$priorite->setShowDropDown(true);
				$priorite->setFormula1('=\'DONNEES\'!$B$1:$B$3');
				$index++;
			}
		}

		try {
			$objWriter = PHPExcel_IOFactory::createWriter($excel, "Excel2007");
			$unique_file = date('Y-m-d-H-i-s') . '_' . uniqid() . '.xlsx';
			$filePath = UPLOAD_DIRECTORY . "tmp/" . $unique_file;
			$objWriter->save($filePath);
			return $filePath;
		}
		catch (Exception $exc) {
			echo $exc->getTraceAsString();
			return false;
		}
	}

	protected function processExportJson($Tickets, $module) {
		$data = array();
		$index = 0;
		foreach ($Tickets as $key => $Ticket) {
			$image_url = PROTOCOL . DOMAINE_NAME . DOMAINE_DIRECTORY_BASE . "upload/" . $module['dossier'] . "/" . $Ticket['image_capture'];
			$data[$index]['idIssueTicket'] = $Ticket['idIssueTicket'];
			$data[$index]['idModule'] = $Ticket['idModule'];
			$data[$index]['nom'] = $Ticket['nom'];
			$data[$index]['prenom'] = $Ticket['prenom'];
			$data[$index]['mail'] = $Ticket['mail'];
			$data[$index]['objet'] = $Ticket['objet'];
			$data[$index]['commentaires'] = nl2br($Ticket['commentaires']);
			$data[$index]['page'] = $Ticket['page'];
			$data[$index]['parametre_environnement'] = json_encode(unserialize($Ticket['parametre_environnement']));
			$data[$index]['image_capture_url'] = $image_url;
			$createdTime = new DateTime($Ticket['createdTime']);
			$data[$index]['createdTime'] = $createdTime->format('d/m/Y H:i:s');
			$index++;
		}
		try {
			$unique_file = date('Y-m-d-H-i-s') . '_' . uniqid() . '.json';
			$filePath = UPLOAD_DIRECTORY . "tmp/" . $unique_file;
			$fp = fopen($filePath, 'w');
			fwrite($fp, json_encode($data));
			fclose($fp);
			return $filePath;
		}
		catch (Exception $exc) {
			echo $exc->getTraceAsString();
			return false;
		}
	}

	protected function processExportPdf($Tickets, $module) {
		$tplnPDF = new TPLN;
		$tplnPDF->open('../html/formExportPDF.html');
		$tplnPDF->parse("module_titre", $module['titre']);
		$date_now = new DateTime('now');
		$tplnPDF->parse("date_now", $date_now->format('d/m/Y'));
		$tplnPDF->parse("ticket_count", count($Tickets));
		if (!empty($Tickets)) {
			foreach ($Tickets as $key => $Ticket) {
				$Ticket["image_url"] = PROTOCOL . DOMAINE_NAME . DOMAINE_DIRECTORY_BASE . "upload/" . $module['dossier'] . "/" . $Ticket['image_capture'];
				foreach ($Ticket as $clef => $valeur) {
					if ($tplnPDF->itemExists($clef, "blocTicket")) {
						switch ($clef) {
							case "commentaires":
								$tplnPDF->parse("blocTicket." . $clef, nl2br($valeur));
								break;
							case "createdTime":
								$createdTime = new DateTime($valeur);
								$tplnPDF->parse("blocTicket." . $clef, $createdTime->format('d/m/Y H:i:s'));
								break;
							default:
								$tplnPDF->parse("blocTicket." . $clef, $valeur);
								break;
						}
					}
				}
				$parametre_environnement = unserialize($Ticket["parametre_environnement"]);
				foreach ($parametre_environnement as $parametre) {
					foreach ($parametre as $clef => $valeur) {

						if ($tplnPDF->itemExists($clef, "blocTicket")) {
							switch ($clef) {
								default:
									$tplnPDF->parse("blocTicket." . $clef, $valeur);
									break;
							}
						}
					}
				}
				$tplnPDF->loop("blocTicket");
			}
		}
		else {
			$tplnPDF->eraseBloc("blocTicket");
		}
		try {
			$nomenclature = $module['nomenclature'];
			$dossier = $module['dossier'];
			$pdf_file = UPLOAD_DIRECTORY . "$dossier/rapport_$nomenclature.pdf";
			if (!file_exists(UPLOAD_DIRECTORY . $dossier)) {
				mkdir(UPLOAD_DIRECTORY . $dossier, 0777);
			}
			$dompdf = new DOMPDF();
			$dompdf->set_paper("A4", "portrait");
			$dompdf->load_html($tplnPDF->output());
			$dompdf->render();
			//$output = $dompdf->output();
			file_put_contents($pdf_file, $dompdf->output());
			$filePath = UPLOAD_DIRECTORY . $module['dossier'] . "/" . "rapport_$nomenclature.pdf";
			return $filePath;
		}
		catch (Exception $exc) {
			echo $exc->getTraceAsString();
			return false;
		}
	}

	private function hydrateFormExport(TPLN &$TPLN) {
		$moduleController = new ModuleManager();
		$modules_list = $moduleController->getModulesList();
		if (is_array($modules_list) && count($modules_list) > 0) {
			foreach ($modules_list as $module) {
				if (isset($module['idModule']) && isset($module['titre'])) {
					($TPLN->itemExists('value', 'bloc_form_export_idModule_options') ) ? $TPLN->parse('bloc_form_export_idModule_options.value', $module['idModule']) : null;
					($TPLN->itemExists('label', 'bloc_form_export_idModule_options') ) ? $TPLN->parse('bloc_form_export_idModule_options.label', $module['titre']) : null;
				}
				$TPLN->loop("bloc_form_export_idModule_options");
			}
		}
	}

	private static function isHTTPS() {
		if (isset($_SERVER["HTTPS"])) {
			if ("on" == strtolower($_SERVER["HTTPS"]))
				return true;
			if ("1" == $_SERVER["HTTPS"])
				return true;
		} elseif (isset($_SERVER["SERVER_PORT"]) && ( "443" == $_SERVER["SERVER_PORT"] )) {
			return true;
		}
		if (isset($_SERVER["HTTP_X_FORWARDED_PROTO"]) && strtolower($_SERVER["HTTP_X_FORWARDED_PROTO"]) == "https") {
			return true;
		}
		return false;
	}

}

try {
	$postData = $_REQUEST;
	$formExportController = new FormExportController();
	$formExportController->formExport($postData);
}
catch (Exception $exc) {

}
