<?php
class Utils {
  public static function extend_access_token($facebook, $access_token_short){
    // set short lived access token
    $facebook->setAccessToken($access_token_short);

    // get long-lived
    $facebook->setExtendedAccessToken();
    $access_token = $facebook->getAccessToken();

    return $access_token;
  }

  public static function get_secure_hash($facebook_id){
    include 'config.php';
    return sha1($facebook_id . $SALT);
  }

  // save access token to db
  public static function save_access_token($facebook_id, $access_token, $secure_hash){
    $db = Utils::get_db_object();

    // delete previous
    $stmt = $db->prepare("DELETE FROM users WHERE id=:id");
    $stmt->bindValue(':id', $facebook_id, PDO::PARAM_STR);
    $stmt->execute();

    // add new
    $stmt = $db->prepare("INSERT INTO users(id, access_token, secure_hash) VALUES(:id,:access_token, :secure_hash)");
    $stmt->execute(array(':id' => $facebook_id, ':access_token' => $access_token, ':secure_hash'=> $secure_hash));
  }

  public static function get_access_token_by_user_id($facebook_id, $secure_hash){
    $db = Utils::get_db_object();

    $stmt = $db->prepare("SELECT access_token FROM users WHERE id=? AND secure_hash=?");
    $stmt->execute(array($facebook_id, $secure_hash));

    return $stmt->fetchColumn(0);
  }

  public static function get_db_object(){
    include 'config.php';
    $db = new PDO('mysql:host=' . $DB_HOST . ';dbname=' . $DB_NAME . ';charset=utf8', $DB_USER, $DB_PASS);

    return $db;
  }

  public static function get_user_id_by_access_token($user_access_token){
    include 'config.php';
    $user_id = null;


    if($user_access_token !== null && strlen($user_access_token) > 0){
      $url = 'https://graph.facebook.com/debug_token?input_token=' . $user_access_token . '&access_token=' . $APP_ACCESS_TOKEN;
      $response = json_decode(file_get_contents($url));

        if(isset($response->data->user_id)){
          $user_id = $response->data->user_id;
        }
    }

    return $user_id;
  }

  public static function get_facebook_object(){
    include 'config.php';
    require_once "facebook-sdk/facebook.php";

    $facebook = new Facebook(array(
      'appId'  => $CLIENT_ID,
      'secret' => $CLIENT_SECRET,
    ));

    return $facebook;
  }
}
?>