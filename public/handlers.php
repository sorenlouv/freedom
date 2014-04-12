<?php

$function = isset($_GET['f']) ? $_GET['f'] : null;
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$secure_hash = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if($function === "downloadFeed"){
  header("Location: /feeds/download-feed");
}
?>
