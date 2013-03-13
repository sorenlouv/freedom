<?php
header('Content-type: text/calendar;charset=utf-8');
header('Content-Disposition: attachment; filename="feed.ics"');

// header('Content-Type: text/plain; charset=utf-8');

require_once "facebook-sdk/facebook.php";
require_once 'ical.php';

// get arguments
$uid = isset($_GET["uid"]) ? $_GET["uid"] : null;
$key = isset($_GET["key"]) ? $_GET["key"] : null;
$access_token = isset($_GET["access_token"]) ? $_GET["access_token"] : null;

$ical = new ical($uid, $key, $access_token);
echo $ical->get_feed();
?>