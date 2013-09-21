<?php

  include("utils.php");
  $facebook = Utils::get_facebook_object();
  $facebook_id = $facebook->getUser();


  if($_SERVER['REQUEST_METHOD'] === "GET"){
    $settings = Utils::get_user_settings($facebook_id);

    // headers
    header("Content-type: application/json");

    // output
    echo json_encode($settings);

  // save
  }else{
    Utils::update_user_settings($_POST, $facebook_id);
  }

?>