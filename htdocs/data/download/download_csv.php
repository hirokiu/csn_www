<?php
	require(dirname(__FILE__) . '/../../../module/app/downloadCSV.class.php');

	header('Cache-Control: public');
	header('Pragma: public');
	header('Content-Type: application/octet-stream');
	header("Content-Disposition: attachment; filename=\"${_POST['start']}_${_POST['device_id']}.csv\"");

	$make_csv = new downloadCSV();
	$make_csv->extractCSVdata();
	exit;
?>
