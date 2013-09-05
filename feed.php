<?php
use UnitedPrototype\GoogleAnalytics;
include_once 'utils.php';

class Feed {

  private $is_legacy_user = false;

  public function get_feed($user_id, $secure_hash, $access_token){

    // get userid by access token
    if(is_null($user_id)){
      $user_id = Utils::get_user_id_by_access_token($access_token);
      $this->is_legacy_user = true;

    // get access token by user id
    }else{
      $access_token = Utils::get_access_token_by_user_id($user_id, $secure_hash);
    }

    // header
    $header = "BEGIN:VCALENDAR\r\n";
    $header .= "VERSION:2.0\r\n";
    $header .= "PRODID:-//Facebook//NONSGML Facebook Events V1.0//EN\r\n";
    $header .= "X-WR-CALNAME:FB Freedom\r\n";
    $header .= "X-PUBLISHED-TTL:PT12H\r\n";
    $header .= "X-ORIGINAL-URL:https://www.facebook.com/events/\r\n";
    $header .= "CALSCALE:GREGORIAN\r\n";
    $header .= "METHOD:PUBLISH\r\n";

    // body
    $body = $this->get_calendar_body($user_id, $access_token);

    // footer
    $footer = "END:VCALENDAR\r\n";

    return $header . $body . $footer;
  }

  private function get_calendar_body($user_id, $access_token){

    // get events
    $events = $this->get_events($user_id, $access_token);
    $this->track_download_feed_event($user_id, $events["error_message"]);

    // return body
    if(is_null($events["error_message"])){
      return $this->get_normal_body($events["events"]);
    }else{
      return $this->get_instructional_body();
    }
  }

  private function get_events($user_id, $access_token){
    $facebook = Utils::get_facebook_object();
    $facebook->setAccessToken($access_token);

    try {
      $data = $facebook->api('me?fields=events.limit(100000).fields(description,end_time,id,location,owner,rsvp_status,start_time,name,timezone,updated_time,is_date_only)','GET');
      $events = isset($data["events"]["data"]) ? $data["events"]["data"] : array();
      return array(
        "error_message" => null,
        "events" => $events
      );
    } catch (Exception $e) {
      return array(
        "error_message" => $e->getMessage()
      );
    }
  }

  private function track_download_feed_event($user_id, $error_message){
    require("ServersideAnalytics/autoload.php");

    // legacy string
    $is_legacy_string = $this->is_legacy_user ? 'legacy' : "up-to-date";

    // error message
    if(!is_null($error_message)){
      $error_message = " - " . $error_message;
      $status = "error";
    }else{
      $status = "success";
    }

    // category
    $category = 'feedDownload - '  . $status;

    // action
    $action = $is_legacy_string  . $error_message;

    // label
    $label = $user_id;

    // visitor
    $visitor = new GoogleAnalytics\Visitor();
    $visitor->setIpAddress($_SERVER['REMOTE_ADDR']);
    if(isset($_SERVER['HTTP_USER_AGENT'])){
      $visitor->setUserAgent($_SERVER['HTTP_USER_AGENT']);
    }

    // Google Analytics: track event
    $session = new GoogleAnalytics\Session();
    $event = new GoogleAnalytics\Event($category, $action, $label);
    $tracker = new GoogleAnalytics\Tracker('UA-39209285-1', 'freedom.konscript.com');
    $tracker->trackEvent($event, $session, $visitor);
  }

  private function get_event_dt($event){
    // all day event without time and end
    if($event["is_date_only"]){
      $start_time = $this->date_string_to_time($event['start_time']);
      $end_time = $this->date_string_to_time($event['start_time'], "+1 day");
      $time_type = "VALUE=DATE";

    // specific time
    }else{
      $time_type = "VALUE=DATE-TIME";

      // without end (set end as 3 hours after start)
      if(!isset($event['end_time'])){
        $start_time = $this->date_string_to_time($event['start_time']);
        $end_time = $this->date_string_to_time($event['start_time'], "+3 hours");

      // specific start and end time
      }else{
        $start_time = $this->date_string_to_time($event['start_time']);
        $end_time = $this->date_string_to_time($event['end_time']);
      }
    }

    return array(
      "start" => $time_type . ":" . $start_time,
      "end"   => $time_type . ":" . $end_time
    );
  }

  private function get_normal_body($events){
    $body = "";
    foreach($events as $event){

      // updated time
      $updated_time = $this->date_string_to_time($event['updated_time']);

      $body .= "BEGIN:VEVENT\r\n";
      $body .= "DTSTAMP:" . $updated_time . "\r\n";
      $body .= "LAST-MODIFIED:" . $updated_time . "\r\n";
      $body .= "CREATED:" . $updated_time . "\r\n";
      $body .= "SEQUENCE:0\r\n";
      $body .= "ORGANIZER;CN=" . $this->ical_encode_text($event["owner"]["name"]) . ":MAILTO:noreply@facebookmail.com\r\n";

      $event_dt = $this->get_event_dt($event);
      $body .= "DTSTART;" . $event_dt["start"] . "\r\n";
      $body .= "DTEND;" . $event_dt["end"] . "\r\n";

      // if(isset($event["timezone"])){
      //   $body .= "TZID:" . $event["timezone"] . "\r\n";
      // }

      $body .= "UID:e" . $event['id'] . "@facebook.com\r\n";
      $body .= "SUMMARY:" . $this->ical_encode_text($event["name"]) . "\r\n";

      // location
      if(isset($event["location"])){
        $body .= "LOCATION:" . $this->ical_encode_text($event["location"]) . "\r\n";
      }

      // URL
      $event_url = "http://www.facebook.com/events/" . $event['id'];
      $body .= "URL:" . $event_url . "/\r\n";

      // description
      if(!isset($event["description"])){
        $event["description"] = "";
      }
      $body .= "DESCRIPTION:" . $this->ical_encode_text($event["description"] . "\n\nGo to event:\n" . $event_url) . "\r\n";

      $body .= "CLASS:PUBLIC\r\n";
      $body .= "STATUS:CONFIRMED\r\n";
      $body .= "PARTSTAT:ACCEPTED\r\n";
      $body .= "END:VEVENT\r\n";
    }

    return $body;
  }

  // login expired. Add dummy event to calendar, which describes how to re-enable calendar (re-login)
  private function get_instructional_body(){
    $event = "";
    $event .= "BEGIN:VEVENT\r\n";
    $event .= "DTSTAMP:" . $this->date_string_to_time() . "\r\n";
    $event .= "LAST-MODIFIED:" . $this->date_string_to_time() . "\r\n";
    $event .= "CREATED:" . $this->date_string_to_time() . "\r\n";
    $event .= "SEQUENCE:0\r\n";
    $event .= "DTSTART;VALUE=DATE-TIME:" . $this->date_string_to_time(null, "+24 hours") . "\r\n";
    $event .= "DTEND;VALUE=DATE-TIME:" . $this->date_string_to_time(null, "+27 hours") . "\r\n";
    $event .= "URL:http://freedom.konscript.com\r\n";

    if($this->is_legacy_user){
      $event .= "SUMMARY:Calendar invalid - go to freedom.konscript.com\r\n";
      $event .= "DESCRIPTION:" . $this->ical_encode_text("The Freedom app is still in beta, and have been changed since you started using it. I need you to remove this calendar subscription, and redo the steps outlined at:\n\nhttp://freedom.konscript.com/\n\n I hope you will continue enjoying this service, Søren!") . "\r\n";
    }else{
      $event .= "SUMMARY:Login expired - go to freedom.konscript.com/renew\r\n";
      $event .= "DESCRIPTION:" . $this->ical_encode_text("You have been logged out, and your Facebook events could not be loaded. Please sign in again:\n\nhttp://freedom.konscript.com/renew\n\nNote: It can take several hours for your Facebook events to show up in your calendar again") . "\r\n";
    }

    $event .= "CLASS:PUBLIC\r\n";
    $event .= "STATUS:CONFIRMED\r\n";
    $event .= "END:VEVENT\r\n";

    return $event;
  }

  // splitting ical content into multiple lines - See: http://www.ietf.org/rfc/rfc2445.txt, section 4.1
  private function ical_encode_text($value) {
    $value = trim($value);

    // escape backslashes
    $value = str_replace("\\", "_", $value);

    // escape semicolon
    $value = str_replace(";", "\\;", $value);

    // escape linebreaks
    $value = str_replace("\n", "\\n", $value);

    // escape commas
    $value = str_replace(',', '\\,', $value);

    // insert actual linebreak
    $value = wordwrap($value, 50, " \r\n ");

    return $value;
  }

  private function date_string_to_time($date_string = null, $offset = ""){
    $date_obj = new DateTime($date_string);

    // date without time
    if(strlen($date_string) === 10){
      $facebook_format = 'Y-m-d';
      $icalendar_format = 'Ymd';
      $timestamp = strtotime($date_obj->format($facebook_format) . $offset);

    // date with time
    }else{
      $facebook_format = 'Y-m-d H:i:s';
      $icalendar_format = 'Ymd\THis\Z';
      $timestamp = strtotime($date_obj->format($facebook_format) . $offset) - $date_obj->format('Z');
    }

    $date = date($icalendar_format, $timestamp);

    return $date;
  }
}
