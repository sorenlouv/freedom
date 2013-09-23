<?php

class UserController extends BaseController {

  public function getUserSettings(){
    $user_id = $this->facebook->getUser();
    $user = User::find($user_id);
    return $user;
  }

  public function postUserSettings(){
    $user_id = $this->facebook->getUser();
    $user = User::find($user_id);

    // something like this...
    $data = $_POST;

    // update
    $user->attending_events = $data["attending_events"];
    $user->maybe_attending_events = $data["maybe_attending_events"];
    $user->declined_events = $data["declined_events"];
    $user->not_replied_events = $data["not_replied_events"];
    $user->birthday_events = $data["birthday_events"];

    // save
    $user->save();
  }

  // save access token to db
  // return generated secure hash
  public function postSaveAccessToken(){

    // arguments
    $access_token_short = $this->facebook->getAccessToken();
    $user_id = $this->facebook->getUser();

    // extend access token
    $access_token = $this->extend_access_token($access_token_short);

    // secure hash
    $secure_hash = $this->get_secure_hash($user_id);

    // fetch existing user
    $user = User::find($user_id);

    // Create if not exist
    if(!$user){
      $user = new User;
      $user->id = $user_id;
      $user->secure_hash = $secure_hash;
    }

    // set/update access token
    $user->access_token = $access_token;

    // save
    $user->save();

    // return secure hash
    return array(
      "secure_hash" => $secure_hash
    );
  }

  public function missingMethod($parameters)
  {
      return "404 Not Found";
  }

  /*************** Private Methods *******************
   *
   **************************************************/

  private function get_user_id_by_access_token($user_access_token){
    $user_id = null;

    if($user_access_token !== null && strlen($user_access_token) > 0){
      $APP_ACCESS_TOKEN_converted = str_replace("\|", "|", $APP_ACCESS_TOKEN); // HACK: Pagodabox apparently escapes certain characters. Not cool!
      $url = 'https://graph.facebook.com/debug_token?input_token=' . $user_access_token . '&access_token=' . $APP_ACCESS_TOKEN_converted;
      $response = json_decode(file_get_contents($url));

      if(isset($response->data->user_id)){
        $user_id = $response->data->user_id;
      }
    }

    return $user_id;
  }

  private function extend_access_token($access_token_short){
    // set short lived access token
    $this->facebook->setAccessToken($access_token_short);

    // get long-lived
    $this->facebook->setExtendedAccessToken();
    $access_token = $this->facebook->getAccessToken();

    return $access_token;
  }

  private function get_secure_hash($user_id){
    include 'config.php';
    return sha1($user_id . $SALT);
  }

  private function get_access_token_by_user_id($user_id, $secure_hash){
    $user = User::find($user_id).where('secure_hash', $secure_hash).get('access_token');
    return $user["access_token"];
  }
}