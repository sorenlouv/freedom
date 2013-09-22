<?php

class UserController extends BaseController {

    /**
     * Show the profile for the given user.
     */
    public function showProfile($id)
    {

        return "hej bruger " . $id . Route::currentRouteAction();
        // $user = User::find($id);

        // return View::make('user.profile', array('user' => $user));
    }

    public function getIndex(){
      $facebook = new Facebook(array(
          'appId' => '1234567890',
          'secret' => 'asdfghjkl',
      ));
      $facebook->api('/me');
      return "lolz";
    }

    public function getAdminProfile() {
      return "test";
    }

    public function missingMethod($parameters)
    {
        return "404 not found";
    }
}