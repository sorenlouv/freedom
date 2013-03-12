<?php
header('Content-type: text/calendar;charset=utf-8');
header('Content-Disposition: attachment; filename="feed.ics"');

// header('Content-Type: text/plain; charset=utf-8');

include_once("analyticstracking.php");
require_once 'ical.php';
$ical = new ical($_GET["uid"], $_GET["key"]);
echo $ical->get_filtered_content();
?>