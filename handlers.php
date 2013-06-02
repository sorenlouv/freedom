<?php
use UnitedPrototype\GoogleAnalytics;
require("ServersideAnalytics/autoload.php");

// Disclaimer: fuckly handling of URLs to methods, because I don't wanna setup complete routing framework
// I know I've sinned...
if(function_exists($_GET['f'])) {
   $_GET['f']();

    // Initilize GA Tracker
    $tracker = new GoogleAnalytics\Tracker('UA-39209285-1', 'freedom.pagodabox.com');
    $visitor = new GoogleAnalytics\Visitor();
    $visitor->setIpAddress($_SERVER['REMOTE_ADDR']);
    $visitor->setUserAgent($_SERVER['HTTP_USER_AGENT']);
    $session = new GoogleAnalytics\Session();
    $page = new GoogleAnalytics\Page($_SERVER["REQUEST_URI"]);
    $tracker->trackPageview($page, $session, $visitor);

}else{
    header('HTTP/1.0 501 Not Found');
}

// extend facebook access token
function saveAccessToken(){
    // includes
    include("utils.php");
    $facebook = Utils::get_facebook_object();

    // arguments
    $access_token_short = $facebook->getAccessToken();
    $facebook_id = $facebook->getUser();

    // headers
    header("Content-type: application/json");

    // extend access token
    $access_token = Utils::extend_access_token($facebook, $access_token_short);

    // secure hash
    $secure_hash = Utils::get_secure_hash($facebook_id);

    // save access token
    Utils::save_access_token($facebook_id, $access_token, $secure_hash);

    // output
    echo json_encode(array("secure_hash" => $secure_hash));
}

// download or fetch Facebook feed
function downloadFeed(){
    // includes
    require_once 'feed.php';

    // headers
    header('Content-type: text/calendar;charset=utf-8');
    header('Content-Disposition: attachment; filename=feed.ics');

    // arguments
    $user_id = isset($_GET["user_id"]) ? $_GET["user_id"] : null;
    $secure_hash = isset($_GET["secure_hash"]) ? $_GET["secure_hash"] : null;
    $access_token = isset($_GET["access_token"]) ? $_GET["access_token"] : null;

    // output
    $Feed = new Feed();
    echo $Feed->get_feed($user_id, $secure_hash, $access_token);
}