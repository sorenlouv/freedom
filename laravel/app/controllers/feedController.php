<?php

use UnitedPrototype\GoogleAnalytics\Visitor as GAVisitor;
use UnitedPrototype\GoogleAnalytics\Session as GASession;
use UnitedPrototype\GoogleAnalytics\Event as GAEvent;
use UnitedPrototype\GoogleAnalytics\Tracker as GATracker;

class FeedController extends BaseController
{

  // download or fetch Facebook feed
  public function getDownloadFeed()
  {

    // headers
    // header('Content-type: text/calendar;charset=utf-8');
    // header('Content-Disposition: attachment; filename=feed.ics');

    // arguments
    $user_id = isset($_GET["user_id"]) ? $_GET["user_id"] : null;
    $secure_hash = isset($_GET["secure_hash"]) ? $_GET["secure_hash"] : null;
    $access_token = isset($_GET["access_token"]) ? $_GET["access_token"] : null;

    // get user id by access token
    if (is_null($user_id) && isset($access_token)) {
      $user_id = $this->get_user_id_by_access_token($access_token);

      // get access token by user id
    } elseif (isset($user_id) && isset($secure_hash)) {
      $access_token = $this->get_access_token_by_user_id($user_id, $secure_hash);

      // TODO: log with analytics
    }

    // set access token
    $this->facebook->setAccessToken($access_token);

    // Output
    $header = $this->get_calendar_header();
    $body = $this->get_calendar_body();
    $footer = "END:VCALENDAR\r\n";
    return $header . $body . $footer;
  }

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

  private function get_calendar_body()
  {

    // get events
    list($events, $failed) = $this->get_events();

    echo json_encode($events);
    exit();

    if ($failed) {
      return $this->get_instructional_body();
    } else {
      return $this->get_normal_body($events);
    }
  }

  private function getUser(){
    $user_id = $this->facebook->getUser();
    $user = User::find($user_id);
    return $user;
  }

  private function filter_by_user($events, $user){
    return $events;
  }

  private function get_events()
  {
    $events = null;
    $error_message = null;
    $failed = false;

    $user = $this->getUser();

    $event_type_choices = array(
      "attending" => $user["attending_events"],
      "maybe" => $user["maybe_events"],
      "not_replied" => $user["not_replied_events"],
      "birthday" => $user["birthday_events"]
    );

    // helper
    function get_event_by_type($event_type)
    {
      return array(
        'method' => 'GET',
        'relative_url' => '/me/events/' . $event_type . '?limit=1000&fields=description,end_time,id,location,owner,rsvp_status,start_time,name,timezone,updated_time,is_date_only,owner,admins'
      );
    }

    // prepare batch request
    $event_queries = array();
    if ($event_type_choices["attending"]) {
      $event_index["attending"] = count($event_queries);
      $event_queries[] = get_event_by_type("attending");
    }

    if ($event_type_choices["maybe"]) {
      $event_index["maybe"] = count($event_queries);
      $event_queries[] = get_event_by_type("maybe");
    }

    if ($event_type_choices["not_replied"]) {
      $event_index["not_replied"] = count($event_queries);
      $event_queries[] = get_event_by_type("not_replied");
    }

    if ($event_type_choices["birthday"]) {
      $event_index["birthday"] = count($event_queries);
      $event_queries[] = array(
        'method' => 'GET',
        'relative_url' => '/me/friends?fields=id,name,birthday&limit=2000'
      );
    }

    // get events from Facebook
    try {
      $batch_response = $this->facebook->api('?batch=' . urlencode(json_encode($event_queries)), 'POST');
      $events = isset($data["events"]["data"]) ? $data["events"]["data"] : array();
    }
    catch (Exception $e) {
      $error_message = $e->getMessage();
      $failed = true;
    }

    // Track in GA
    // $this->track_download_feed_event($error_message);
    // TODO: uncomment line

    // prepare batch response
    $events = array();
    if ($event_type_choices["attending"]) {
      $attending_events = json_decode($batch_response[$event_index["attending"]]["body"], true);
      if (isset($attending_events["data"])) {
        $attending_events = $attending_events["data"];
        $events = array_merge($events, $attending_events);
      } else {
        $error_message = $attending_events['error']['message'];
        $failed = true;
      }
    }

    if ($event_type_choices["maybe"]) {
      $maybe_events = json_decode($batch_response[$event_index["maybe"]]["body"], true);
      if (isset($maybe_events["data"])) {
        $maybe_events = $maybe_events["data"];
        $events = array_merge($events, $maybe_events);
      } else {
        $error_message = $maybe_events['error']['message'];
        $failed = true;
      }
    }

    if ($event_type_choices["not_replied"]) {
      $not_replied_events = json_decode($batch_response[$event_index["not_replied"]]["body"], true);
      if (isset($not_replied_events["data"])) {
        $not_replied_events = $this->filter_by_user($not_replied_events["data"], $user);
        $events = array_merge($events, $not_replied_events);
      } else {
        $error_message = $not_replied_events['error']['message'];
        $failed = true;
      }
    }

    if ($event_type_choices["birthday"]) {
      $birthday_events = json_decode($batch_response[$event_index["birthday"]]["body"], true);
      $birthday_events = $birthday_events["data"];

      foreach ($birthday_events as $event_key => $event) {

        // remove event if no birthday
        if (!isset($event["birthday"])) {
          unset($birthday_events[$event_key]);

        } else {
          $birthday = explode("/", $event["birthday"]);
          $month = $birthday[0];
          $day = $birthday[1];
          $year = date('Y');
          $next_birthday_timestamp = mktime(0, 0, 0, $month, $day, $year);

          // make sure birthday is not in the past
          if ($next_birthday_timestamp < time()) {
            $next_birthday_timestamp = mktime(0, 0, 0, $month, $day, $year + 1);
          }

          // add fields to event
          $birthday_events[$event_key]["start_time"] = date("c", $next_birthday_timestamp);
          $birthday_events[$event_key]["is_date_only"] = true;
          $birthday_events[$event_key]["rsvp_status"] = "birthday";
          $birthday_events[$event_key]["owner"]["name"] = $event["name"];
        }
      }

      $events = array_merge($events, $birthday_events);
    }

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

  private function track_download_feed_event($error_message)
  {

    // category
    $category = !is_null($error_message) ? "feedDownload - error" : "feedDownload - success";

    // action
    $action = !is_null($error_message) ? "error: " . $error_message : "success";

    // label
    $label = $user_id = $this->facebook->getUser();

    // visitor
    $visitor = new GAVisitor();
    $visitor->setIpAddress($_SERVER['REMOTE_ADDR']);
    if (isset($_SERVER['HTTP_USER_AGENT'])) {
      $visitor->setUserAgent($_SERVER['HTTP_USER_AGENT']);
    }

    // Google Analytics: track event
    $session = new GASession();
    $event = new GAEvent($category, $action, $label);
    $tracker = new GATracker('UA-39209285-1', 'freedom.konscript.com');
    $tracker->trackEvent($event, $session, $visitor);
  }

  private function get_event_dt($event)
  {
    // all day event without time and end
    if ($event["is_date_only"]) {
      $start_time = $this->date_string_to_time($event['start_time']);
      $end_time = $this->date_string_to_time($event['start_time'], "+1 day");
      $time_type = "VALUE=DATE";

      // specific time
    } else {
      $time_type = "VALUE=DATE-TIME";

      // without end (set end as 3 hours after start)
      if (!isset($event['end_time'])) {
        $start_time = $this->date_string_to_time($event['start_time']);
        $end_time = $this->date_string_to_time($event['start_time'], "+3 hours");

        // specific start and end time
      } else {
        $start_time = $this->date_string_to_time($event['start_time']);
        $end_time = $this->date_string_to_time($event['end_time']);
      }
    }

    return array(
      "start" => $time_type . ":" . $start_time,
      "end" => $time_type . ":" . $end_time
    );
  }

  private function get_normal_body($events)
  {

    // add question mark to event title if rsvp is "unsure"
    function get_event_name($event)
    {
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

    $body = "";
    foreach ($events as $event) {

      // updated time
      $updated_time = $this->date_string_to_time($event['updated_time']);

      $body .= "BEGIN:VEVENT\r\n";
      $body .= "DTSTAMP:" . $updated_time . "\r\n";
      $body .= "LAST-MODIFIED:" . $updated_time . "\r\n";
      $body .= "CREATED:" . $updated_time . "\r\n";
      $body .= "SEQUENCE:0\r\n";

      // Owner
      $owner = isset($event["owner"]["name"]) ? $event["owner"]["name"] : "Freedom Calendar";
      $body .= "ORGANIZER;CN=" . $this->ical_encode_text($owner) . ":MAILTO:noreply@facebookmail.com\r\n";

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

  // login expired. Add dummy event to calendar, which describes how to re-enable calendar (re-login)
  private function get_instructional_body()
  {
    $event = "";
    $event .= "BEGIN:VEVENT\r\n";
    $event .= "DTSTAMP:" . $this->date_string_to_time() . "\r\n";
    $event .= "LAST-MODIFIED:" . $this->date_string_to_time() . "\r\n";
    $event .= "CREATED:" . $this->date_string_to_time() . "\r\n";
    $event .= "SEQUENCE:0\r\n";
    $event .= "DTSTART;VALUE=DATE-TIME:" . $this->date_string_to_time(null, "+24 hours") . "\r\n";
    $event .= "DTEND;VALUE=DATE-TIME:" . $this->date_string_to_time(null, "+27 hours") . "\r\n";
    $event .= "URL:http://freedom.konscript.com\r\n";
    $event .= "SUMMARY:Login expired - go to freedom.konscript.com/renew\r\n";
    $event .= "DESCRIPTION:" . $this->ical_encode_text("Sorry for the inconvenience! Facebook has logged you out, therefore your Facebook events could not be loaded. Please login again here:\n\nhttp://freedom.konscript.com/renew\n\nNote: It can take several hours for your Facebook events to re-appear in your calendar") . "\r\n";
    $event .= "CLASS:PUBLIC\r\n";
    $event .= "STATUS:CONFIRMED\r\n";
    $event .= "END:VEVENT\r\n";

    return $event;
  }

  // splitting ical content into multiple lines - See: http://www.ietf.org/rfc/rfc2445.txt, section 4.1
  private function ical_encode_text($value)
  {
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

  // convert timestamp from FB format to iCalendar format
  private function date_string_to_time($date_string = null, $offset = "")
  {
    $date_obj = new DateTime($date_string);

    // date without time
    if (strlen($date_string) === 10) {
      $facebook_format = 'Y-m-d';
      $icalendar_format = 'Ymd';
      $timestamp = strtotime($date_obj->format($facebook_format) . $offset);

      // date with time
    } else {
      $facebook_format = 'Y-m-d H:i:s';
      $icalendar_format = 'Ymd\THis\Z';
      $timestamp = strtotime($date_obj->format($facebook_format) . $offset) - $date_obj->format('Z');
    }

    $date = date($icalendar_format, $timestamp);

    return $date;
  }

  private function get_access_token_by_user_id($user_id, $secure_hash)
  {
    $user = User::where('secure_hash', $secure_hash)->select(array('access_token'))->find($user_id);
    if ($user) {
      return $user->access_token;
    }
  }

  private function get_user_id_by_access_token($user_access_token)
  {
    $user_id = null;

    if ($user_access_token !== null && strlen($user_access_token) > 0) {
      $APP_ACCESS_TOKEN_converted = str_replace("\|", "|", Config::get('facebook.appAccessToken')); // HACK: Pagodabox apparently escapes certain characters. Not cool!
      $url = 'https://graph.facebook.com/debug_token?input_token=' . $user_access_token . '&access_token=' . $APP_ACCESS_TOKEN_converted;
      $response = json_decode(file_get_contents($url));

      if (isset($response->data->user_id)) {
        $user_id = $response->data->user_id;
      }
    }

    return $user_id;
  }
}