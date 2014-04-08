<?php

class UserController extends BaseController {

  public function getSettings(){
    $user_id = $this->facebook->getUser();
    $user = User::find($user_id);
    return $user;
  }

  public function postSettings(){
    $user_id = $this->facebook->getUser();
    $user = User::find($user_id);

    if(!$user){
      echo "User not found";
      exit();
    }

    // update
    $user->attending_events = $_POST["attending_events"];
    $user->maybe_attending_events = $_POST["maybe_attending_events"];
    $user->declined_events = $_POST["declined_events"];
    $user->not_replied_events = $_POST["not_replied_events"];
    $user->birthday_events = $_POST["birthday_events"];

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

  public function missingMethod($parameters = array())
  {
      return "404 Not Found";
  }

  /*************** Private Methods *******************
   *
   **************************************************/

  private function extend_access_token($access_token_short){
    // set short lived access token
    $this->facebook->setAccessToken($access_token_short);

    // get long-lived
    $this->facebook->setExtendedAccessToken();
    $access_token = $this->facebook->getAccessToken();

    return $access_token;
  }

  private function get_secure_hash($user_id){
    return sha1($user_id . Config::get('freedom.salt'));
  }
}
