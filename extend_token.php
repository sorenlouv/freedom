<?php
  function extend_access_token($access_token){
    // Facebook credentials
    include_once 'config.php';

    $facebook = new Facebook(array(
      'appId'  => $CLIENT_ID,
      'secret' => $CLIENT_SECRET,
    ));

    $token_url  = "https://graph.facebook.com/oauth/access_token?client_id=" . $CLIENT_ID . "&client_secret=" . $CLIENT_SECRET . "&fb_exchange_token=" . $access_token . "&grant_type=fb_exchange_token";

    $ch = curl_init($token_url);
    $options = array(
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array('Content-type: application/json'),
        CURLOPT_BINARYTRANSFER => true
    );

    // Setting curl options
    curl_setopt_array( $ch, $options );

    // get result and parse to array
    $data_string = parse_str(curl_exec($ch), $data_array);
    return $data_array;
  }

  require_once "facebook-sdk/facebook.php";
  $data = extend_access_token($_GET["access_token"]);

  // output
  header("Content-type: application/json");
  echo json_encode($data);

?>