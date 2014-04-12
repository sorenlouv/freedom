<?php

$function = isset($_GET['f']) ? $_GET['f'] : null;
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$secure_hash = isset($_GET['secure_hash']) ? $_GET['secure_hash'] : null;

if($function === "downloadFeed"){
  header("Location: /feeds/download-feed?user_id=" . $user_id ."&secure_hash=".$secure_hash);
}
?>
