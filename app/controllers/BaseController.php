<?php

class BaseController extends Controller {

	// Add global Facebook object
	protected $facebook;
	public function __construct()
	{
	  $this->facebook = new Facebook(array(
	    'appId' => Config::get('facebook.appId'),
	    'secret' => Config::get('facebook.secret')
	  ));
	}


	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{
		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}
	}

}
