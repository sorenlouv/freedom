<?php
  function extend_access_token($access_token_short){
    // Facebook credentials
    include_once 'config.php';

    $facebook = new Facebook(array(
      'appId'  => $CLIENT_ID,
      'secret' => $CLIENT_SECRET,
    ));

    // set short lived access token
    $facebook->setAccessToken($access_token_short);

    // get long-lived
    $facebook->setExtendedAccessToken();
    $access_token = $facebook->getAccessToken();

    return $access_token;
  }

  require_once "facebook-sdk/facebook.php";
  $access_token = extend_access_token($_GET["access_token_short"]);

  // output
  header("Content-type: application/json");
  echo json_encode(array("access_token" => $access_token));

?>