<?php
use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphUser;

// Set UTC time as default timezone
date_default_timezone_set ( "UTC" );

class FeedController extends BaseController
{

  private $access_token = null;

  /*
   * Get events as JSON (for preview on website)
   ************************************/
  public function getPreview(){
    return $this->get_events()[0];
  }

  /*
   * Download or fetch Facebook feed
   ************************************/
  public function getDownloadFeed()
  {

    // headers
    header('Content-type: text/calendar;charset=utf-8');
    header('Content-Disposition: attachment; filename=feed.ics');

    $access_token = $this->get_access_token();

    // Access token was found in DB
    if ($access_token !== null) {      
      $session = new FacebookSession($access_token);
      list($events, $failed) = $this->get_events(); // get events
      $body = $failed ? $this->get_renew_instructions_body() : $this->get_normal_body($events);
    }else{
      $body = $this->get_reset_instructions_body();
    }

    $header = $this->get_calendar_header();
    $footer = "END:VCALENDAR\r\n";

    // Output
    return $header . $body . $footer;
  }

  /*
   * Getter: Calendar header
   * return String $header
   ************************************/
  private function get_calendar_header()
  {
    $header = "BEGIN:VCALENDAR\r\n";
    $header .= "VERSION:2.0\r\n";
    $header .= "PRODID:-//Facebook//NONSGML Facebook Events V1.0//EN\r\n";
    $header .= "X-WR-CALNAME:FB Freedom\r\n";
    $header .= "X-PUBLISHED-TTL:PT12H\r\n";
    $header .= "X-ORIGINAL-URL:https://www.facebook.com/events/\r\n";
    $header .= "CALSCALE:GREGORIAN\r\n";
    $header .= "METHOD:PUBLISH\r\n";

    return $header;
  }

  /*
   * Getter: Close Friends from Facebook
   * return Array $response
   * TODO: caching http://davidwalsh.name/php-cache-function
   ************************************/
  private function get_close_friends(){
    $access_token = $this->get_access_token();
    $session = new FacebookSession($access_token);
    $response = (new FacebookRequest($session, 'GET', '/me/friendlists/close_friends?fields=members.fields(id)'))->execute();
    $responseArray = $response->getGraphObject()->asArray();
    $close_friends = $responseArray["data"][0]["members"]["data"];

    return array_map(function($close_friend){
      return $close_friend["id"];
    }, $close_friends);
  }

  /*
   * Getter: User from database
   * return Object $user
   ************************************/
  private function getUser($session){
    $response = (new FacebookRequest($session, 'GET', '/me'))->execute();
    $user = $response->getGraphObject(GraphUser::className());
    $user_id = $user->getId();

    if($user_id === null || $user_id === 0){
      return null;
    }else{
      $user = User::find($user_id);
      return $user;
    }
  }

  /*
   * Getter: Events
   * return array($events, $failed)
   ************************************/
  private function get_events()
  {
    $events = null;
    $error_message = null;
    $failed = false;

    // helper
    function get_event_by_type($event_type)
    {
      return array(
        'method' => 'GET',
        'relative_url' => '/me/events/' . $event_type . '?limit=1000&fields=description,end_time,id,location,owner,rsvp_status,start_time,name,timezone,updated_time,is_date_only,cover'
      );
    }

    $session = $this->get_session();
    $user = $this->getUser($session);
    if($user === null){
      $failed = true;
      $error_message = "Facebook user could not be retrieved";
    }

    // prepare batch request
    $event_queries = array();
    if ($user["attending"]) {
      $event_index["attending"] = count($event_queries);
      $event_queries[] = get_event_by_type("attending");
    }

    if ($user["maybe"]) {
      $event_index["maybe"] = count($event_queries);
      $event_queries[] = get_event_by_type("maybe");
    }

    if ($user["declined"]) {
      $event_index["declined"] = count($event_queries);
      $event_queries[] = get_event_by_type("declined");
    }

    if ($user["not_replied"]) {
      $event_index["not_replied"] = count($event_queries);
      $event_queries[] = get_event_by_type("not_replied");
    }

    // if ($user["birthday"]) {
    //   $event_index["birthday"] = count($event_queries);
    //   $event_queries[] = array(
    //     'method' => 'GET',
    //     'relative_url' => '/me/friends?fields=id,name,birthday&limit=2000'
    //   );
    // }

    // get events from Facebook
    try {
      if(!$failed){
        $session = $this->get_session();
        $path = '?include_headers=false&batch=' . urlencode(json_encode($event_queries));
        $response = (new FacebookRequest($session, 'POST', $path))->execute();
        $batch_response = $response->getGraphObject()->asArray();
      }
    }
    catch (Exception $e) {
      $error_message = $e->getMessage();
      $failed = true;
    }

    // prepare batch response
    $events = array();
    if ($user["attending"] && !$failed) {
      $attending_events = json_decode($batch_response[$event_index["attending"]]["body"], true);
      if (isset($attending_events["data"])) {
        $attending_events = $attending_events["data"];
        $events = array_merge($events, $attending_events);
      } else {
        $error_message = $attending_events['error']['message'];
        $failed = true;
      }
    }

    if ($user["maybe"] && !$failed) {
      $maybe_events = json_decode($batch_response[$event_index["maybe"]]["body"], true);
      if (isset($maybe_events["data"])) {
        $maybe_events = $maybe_events["data"];
        $events = array_merge($events, $maybe_events);
      } else {
        $error_message = $maybe_events['error']['message'];
        $failed = true;
      }
    }

    if ($user["declined"] && !$failed) {
      $declined_events = json_decode($batch_response[$event_index["declined"]]["body"], true);
      if (isset($declined_events["data"])) {
        $declined_events = $declined_events["data"];
        $events = array_merge($events, $declined_events);
      } else {
        $error_message = $declined_events['error']['message'];
        $failed = true;
      }
    }

    if ($user["not_replied"] && !$failed) {
      $not_replied_events = json_decode($batch_response[$event_index["not_replied"]]["body"], true);
      if (isset($not_replied_events["data"])) {
        $not_replied_events = $not_replied_events["data"];
        $events = array_merge($events, $not_replied_events);
      } else {
        $error_message = $not_replied_events['error']['message'];
        $failed = true;
      }
    }

    // Track in GA
    $this->track_download_feed_event($error_message);

    // if (in_array("birthday", $this->event_types) && !$failed) {
    //   $birthday_events = json_decode($batch_response[$event_index["birthday"]]["body"], true);
    //   $birthday_events = $birthday_events["data"];

    //   foreach ($birthday_events as $event_key => $event) {

    //     // remove event if no birthday
    //     if (!isset($event["birthday"])) {
    //       unset($birthday_events[$event_key]);

    //     } else {
    //       $birthday = explode("/", $event["birthday"]);
    //       $month = $birthday[0];
    //       $day = $birthday[1];
    //       $year = date('Y');
    //       $next_birthday_timestamp = mktime(0, 0, 0, $month, $day, $year);

    //       // make sure birthday is not in the past
    //       if ($next_birthday_timestamp < time()) {
    //         $next_birthday_timestamp = mktime(0, 0, 0, $month, $day, $year + 1);
    //       }

    //       // add fields to event
    //       $birthday_events[$event_key]["start_time"] = date("c", $next_birthday_timestamp);
    //       $birthday_events[$event_key]["is_date_only"] = true;
    //       $birthday_events[$event_key]["rsvp_status"] = "birthday";
    //       $birthday_events[$event_key]["owner"]["name"] = $event["name"];
    //     }
    //   }

    //   $events = array_merge($events, $birthday_events);
    // }

    // sort events by start date
    function sort_cb($a, $b)
    {
      return strcmp($a["start_time"], $b["start_time"]);
    }
    usort($events, 'sort_cb');

    return array(
      $events,
      $failed
    );
  }

  /*
   * Google Analytics Tracking
   ************************************/
  private function track_download_feed_event($error_message)
  {

    // success
    if(is_null($error_message)){
      $category = "feedDownload - success";
      $action = "success";
      $value = 1;

    // Error
    }else{
      $category = "feedDownload - error";
      $action = "error: " . $error_message;
      $value = 0;
    }

    // label - unverified user_id
    $label = Input::get('user_id', null);

    // Google Analytics: track event
    $client = Krizon\Google\Analytics\MeasurementProtocol\MeasurementProtocolClient::factory(array('ssl' => false));
    $client->event(array(
        'tid' => 'UA-39209285-1', // Tracking Id
        'cid' => Input::get('user_id', 'anonymous'), // Customer Id
        't' => 'event',
        'ec' => $category,
        'ea' => $action,
        'el' => $label,
        'ev' => $value,
        'dh' => 'konscript.com'
    ));
  }

  /*
   * Getter: Event datetime
   * Return array("start" => start, "end" => end)
   ************************************/
  private function get_event_dt($event)
  {
    $original_timezone = isset($event["timezone"]) ? $event["timezone"]: 'UTC';
    $is_date_only = $event["is_date_only"];
    $time_type = $is_date_only ? "VALUE=DATE" : "VALUE=DATE-TIME";
    $start_time = $event['start_time'];

    // If there is no endtime, use tomorrow midnight as end
    $original_timezone_object = new DateTimeZone($original_timezone);
    if(isset($event['end_time'])){
      $end_time = new DateTime($event['end_time'], $original_timezone_object);
    }else{
      $end_time = (new DateTime($event['start_time'], $original_timezone_object))->modify('tomorrow');
    }

    return array(
      "start" => $time_type . ":" . $this->get_formatted_date($start_time, $original_timezone, $is_date_only),
      "end" => $time_type . ":" . $this->get_formatted_date($end_time, $original_timezone, $is_date_only)
    );
  }

  /*
   * Getter: Event body
   * Return String $body
   ************************************/
  private function get_normal_body($events)
  {
    $session = $this->get_session();

    // add question mark to event title if rsvp is "unsure"
    function get_event_name($event)
    {      

      if(!isset($event["name"])){
        $user_id = Input::get('user_id', null);
        Log::error('Event "name" is missing', array(
          "event" => $event,
          "user_id" => $user_id,
          "secure_hash" => Input::get('secure_hash', null),
          "access_token" => $session->getToken()
        ));
      }

      if ($event["rsvp_status"] === "unsure" || $event["rsvp_status"] === "not_replied") {
        return $event["name"] . " [?]";
      } else {
        return $event["name"];
      }
    }

    function get_event_url($event)
    {
      return "http://www.facebook.com/" . $event['id'];
    }

    // event description is dependent on context: whether the "events" is a birthday or a regular event
    function get_event_description($event)
    {
      if ($event["rsvp_status"] == "birthday") {
        return "Say congratulation:\n" . get_event_url($event);
      } else {
        // description
        if (!isset($event["description"])) {
          $event["description"] = "";
        }
        return $event["description"] . "\n\nGo to event:\n" . get_event_url($event);
      }
    }

    function get_sequence_number()
    {
      $past = 1399366333; // 6th of May, 2014
      $now = time();
      $diff = $now - $past;

      $sequence_number = floor($diff / 3600);
      return $sequence_number;
    }

    $body = "";
    foreach ($events as $event) {

      // updated time
      $updated_time = $this->get_formatted_date($event['updated_time']);

      // sequence number
      $sequence = get_sequence_number();

      $body .= "BEGIN:VEVENT\r\n";
      $body .= "DTSTAMP:" . $updated_time . "\r\n";
      $body .= "LAST-MODIFIED:" . $updated_time . "\r\n";
      $body .= "CREATED:" . $updated_time . "\r\n";
      $body .= "SEQUENCE:" . $sequence . "\r\n";

      // Owner
      $owner = isset($event["owner"]["name"]) ? $event["owner"]["name"] : "Freedom Calendar";
      $body .= "ORGANIZER;CN=" . $this->ical_encode_text($owner, ["quotes"]) . ":MAILTO:noreply@facebookmail.com\r\n";

      // Datetime start/end
      $event_dt = $this->get_event_dt($event);
      $body .= "DTSTART;" . $event_dt["start"] . "\r\n";
      $body .= "DTEND;" . $event_dt["end"] . "\r\n";

      // if(isset($event["timezone"])){
      //   $body .= "TZID:" . $event["timezone"] . "\r\n";
      // }

      $body .= "UID:e" . $event['id'] . "@facebook.com\r\n";

      // Title
      $body .= "SUMMARY:" . $this->ical_encode_text(get_event_name($event)) . "\r\n";

      // location
      if (isset($event["location"])) {
        $body .= "LOCATION:" . $this->ical_encode_text($event["location"]) . "\r\n";
      }

      // URL
      $body .= "URL:" . get_event_url($event) . "/\r\n";

      // Description
      $body .= "DESCRIPTION:" . $this->ical_encode_text(get_event_description($event)) . "\r\n";

      $body .= "CLASS:PUBLIC\r\n";
      $body .= "STATUS:CONFIRMED\r\n";
      $body .= "PARTSTAT:ACCEPTED\r\n";
      $body .= "END:VEVENT\r\n";
    }

    return $body;
  }

  /*
   * Getter: Instructions to renew calendar
   * When login is expired. Add dummy event to calendar, which describes how to re-enable calendar (re-login)
   * Return String $event
   ************************************/
  private function get_renew_instructions_body()
  {

    return "";

    $today_date = $this->get_formatted_date(new DateTime());
    $tomorrow_date = $this->get_formatted_date((new DateTime())->modify('+24 hours'));
    $tomorrow_later_date = $this->get_formatted_date((new DateTime())->modify('+27 hours'));

    $event = "";
    $event .= "BEGIN:VEVENT\r\n";
    $event .= "DTSTAMP:" . $today_date . "\r\n";
    $event .= "LAST-MODIFIED:" . $today_date . "\r\n";
    $event .= "CREATED:" . $today_date . "\r\n";
    $event .= "SEQUENCE:0\r\n";
    $event .= "DTSTART;VALUE=DATE-TIME:" . $tomorrow_date . "\r\n";
    $event .= "DTEND;VALUE=DATE-TIME:" . $tomorrow_later_date . "\r\n";
    $event .= "URL:http://freedom.konscript.com\r\n";
    $event .= "SUMMARY:Login expired - go to freedom.konscript.com/renew\r\n";
    $event .= "DESCRIPTION:" . $this->ical_encode_text("Sorry for the inconvenience! Facebook has logged you out, therefore your Facebook events could not be loaded. Please login again here:\n\nhttp://freedom.konscript.com/renew\n\nNote: It can take several hours for your Facebook events to re-appear in your calendar") . "\r\n";
    $event .= "CLASS:PUBLIC\r\n";
    $event .= "STATUS:CONFIRMED\r\n";
    $event .= "END:VEVENT\r\n";

    return $event;
  }

  /*
   * Getter: Instructions to setup calendar again
   * The parameters (user id, and secure hash) does not match any record in the DB. The calendar should be setup again
   * Return String $event
   ************************************/
  private function get_reset_instructions_body()
  {

    $today_date = $this->get_formatted_date(new DateTime());
    $tomorrow_date = $this->get_formatted_date((new DateTime())->modify('+24 hours'));
    $tomorrow_later_date = $this->get_formatted_date((new DateTime())->modify('+27 hours'));

    $event = "";
    $event .= "BEGIN:VEVENT\r\n";
    $event .= "DTSTAMP:" . $today_date . "\r\n";
    $event .= "LAST-MODIFIED:" . $today_date . "\r\n";
    $event .= "CREATED:" . $today_date . "\r\n";
    $event .= "SEQUENCE:0\r\n";
    $event .= "DTSTART;VALUE=DATE-TIME:" . $tomorrow_date . "\r\n";
    $event .= "DTEND;VALUE=DATE-TIME:" . $tomorrow_later_date . "\r\n";
    $event .= "URL:http://freedom.konscript.com\r\n";
    $event .= "SUMMARY:Feed invalid. Go to freedom.konscript.com\r\n";
    $event .= "DESCRIPTION:" . $this->ical_encode_text("Sorry for the inconvenience! It seems there is a problem with your Freedom Calendar. Please remove this calendar subscription, and redo the setup steps here:\n\nhttp://freedom.konscript.com/renew\n\nNote: It can take several hours for your Facebook events to re-appear in your calendar") . "\r\n";
    $event .= "CLASS:PUBLIC\r\n";
    $event .= "STATUS:CONFIRMED\r\n";
    $event .= "END:VEVENT\r\n";

    return $event;
  }

  /*
   * Encode string
   * Splitting iCal content into multiple lines - See: http://www.ietf.org/rfc/rfc5545.txt, section 3.1 (Content Lines)
   * Return String $value
   ************************************/
  private function ical_encode_text($value, $additional_escaping = array())
  {
    $value = trim($value);

    // escape backslashes
    $value = str_replace("\\", "_", $value);

    // escape semicolon
    $value = str_replace(";", "\\;", $value);

    // escape linebreaks
    $value = str_replace(array("\r", "\n"), "\\n", $value);

    // escape commas
    $value = str_replace(",", "\\,", $value);

    // escape double quotes
    // escaping DQUOTES in property parameter values
    // http://www.ietf.org/rfc/rfc2445.txt 3.2 (Property Parameters)
    if(in_array("quotes", $additional_escaping)){
      $value = str_replace("\"", "'", $value);
    }

    // insert actual linebreak
    $value = wordwrap($value, 50, " \r\n ");

    return $value;
  }

  /*
   * Timestamps in iCalendar MUST be in UTC+0 http://www.kanzaki.com/docs/ical/dateTime.html
   * Convert from native timezone to UTC
   * Facebook (ISO-8601), iCalendar (ISO 8601)
   * Return Date $date
   ************************************/
  private function get_formatted_date($date, $original_timezone = "UTC", $is_date_only = false){
    $date_obj = ($date instanceof DateTime) ? $date : new DateTime($date, new DateTimeZone($original_timezone));

    // date without time
    if ($is_date_only) {
      $icalendar_format = 'Ymd';

    // date with time
    } else {
      $icalendar_format = 'Ymd\THis\Z';
      $utc_timezone = new DateTimeZone('UTC');
      $date_obj->setTimezone($utc_timezone);
    }

    $date = $date_obj->format($icalendar_format);

    return $date;
  }

  /*
   * Getter: Access Token
   * Return String $access_token
   ************************************/
  private function get_access_token_by_user_id($user_id, $secure_hash)
  {
    // Invalid user_id or secure_hash
    if($user_id === null || $secure_hash === null){
      return null;
    }

    // Lookup access_token in DB
    $user = User::where('secure_hash', $secure_hash)->select(array('access_token'))->find($user_id);
    if ($user && $user->access_token) {
      return $user->access_token;
    }else{
      Log::warning('Access token could not be retrieved', array(
        "user_id" => $user_id,
        "secure_hash" => $secure_hash
      ));
      return null;
    }
  }

  private function get_access_token(){
    $user_id = Input::get('user_id', null);
    $secure_hash = Input::get('secure_hash', null);

    $access_token = $this->get_access_token_by_user_id($user_id, $secure_hash);
    return $access_token;
  }

  private function get_session() {
    $access_token = $this->get_access_token();
    $session = new FacebookSession($access_token);
    return $session;
  }

}
