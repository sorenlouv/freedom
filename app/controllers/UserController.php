<?php
use Facebook\FacebookSession;
use Facebook\FacebookRequest;

class UserController extends BaseController {

  public function getSettings(){
    $session = $this->get_session();
    $user_id = $this->get_user_id($session);

    if(!$user_id || $user_id === 0){
      App::abort(401, 'You are not authorized.');
    }

    $user = User::find($user_id);
    return $user;
  }

  public function postFeedSettings(){
    $session = $this->get_session();
    $user_id = $this->get_user_id($session);

    if(!$user_id || $user_id === 0){
      App::abort(401, 'You are not authorized.');
    }

    $user = User::find($user_id);

    // update
    $user->attending = Input::get('attending');
    $user->maybe = Input::get('maybe');
    $user->declined = Input::get('declined');
    $user->not_replied = Input::get('not_replied');
    // $user->birthday_events = $_REQUEST["birthday"];

    // save
    $user->save();

    $request = Request::create('/feeds/preview', 'GET', array());
    return Route::dispatch($request)->getContent();
  }

  // save access token to db
  // return generated secure hash
  public function postSaveAccessToken(){
    $session = $this->get_session();
    $user_id = $this->get_user_id($session);

    if(!$user_id || $user_id === 0){
      App::abort(401, 'You are not authorized.');
    }

    // extend access token
    $access_token_extended = $this->extend_access_token($session);    

    // secure hash
    $secure_hash = $this->get_secure_hash($user_id);

    // fetch existing user
    $user = User::find($user_id);

    // Create if not exist
    if(!$user){
      $user = new User;
      $user->id = $user_id;
    }

    // set/update access token
    $user->access_token = $access_token_extended;

    // set/update secure hash
    $user->secure_hash = $secure_hash;

    // save
    $user->save();

    // return secure hash
    return array(
      "secure_hash" => $secure_hash
    );
  }

  /*************** Private Methods *******************
   *
   **************************************************/

  private function get_user_id($session){
    $response = (new FacebookRequest($session, 'GET', '/me'))->execute();
    $user_id = $response->getGraphObject()->getProperty('id');
    return $user_id;
  }

  private function get_session() {
    $helper = new FacebookJavaScriptLoginHelper();
    $session = $helper->getSession();
    return $session;
  }

  private function extend_access_token($session){
    $session->getToken();
    $access_token_extended = $session->getLongLivedSession(Config::get('facebook.appId'), Config::get('facebook.secret'));

    return $access_token_extended;
  }

  private function get_secure_hash($user_id){
    return sha1($user_id . Config::get('freedom.salt'));
  }
}
