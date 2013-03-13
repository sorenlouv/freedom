<?php

class ical {

  public $calendar_body = null;

  public function __construct($uid = null, $key = null, $access_token = null){
    // by webcal url
    if (!is_null($uid) && !is_null($key) ) {
      $url = "https://www.facebook.com/ical/u.php?uid=" . $uid . "&key=" . $key;
      $this->calendar_body = $this->get_by_url($url);

    // facebook login
    }elseif(!is_null($access_token)){
      $this->calendar_body = $this->get_by_access_token($access_token);
    }
  }

  public function get_feed(){

    // header
    $header = "BEGIN:VCALENDAR\r\n";
    $header .= "VERSION:2.0\r\n";
    $header .= "PRODID:-//Facebook//NONSGML Facebook Events V1.0//EN\r\n";
    $header .= "X-WR-CALNAME:Facebook Events\r\n";
    $header .= "X-PUBLISHED-TTL:PT12H\r\n";
    $header .= "X-ORIGINAL-URL:https://www.facebook.com/events/\r\n";
    $header .= "CALSCALE:GREGORIAN\r\n";
    $header .= "METHOD:PUBLISH\r\n";

    // body
    $body = $this->calendar_body;

    // footer
    $footer = "END:VCALENDAR\r\n";

    return $header . $body . $footer;
  }

  private function get_by_access_token($access_token){

    $facebook = new Facebook(array(
      'appId'  => 408564152572106,
      'secret' => 'fb77ed0cdc61baa591b710231994c8d7',
    ));
    $facebook->setAccessToken($_GET["access_token"]);
    $data = $facebook->api('me?fields=events.limit(100000).fields(description,end_time,id,location,owner,rsvp_status,start_time,name,timezone,updated_time,is_date_only)','GET');
    $events = $data["events"]["data"];

    $body = "";
    foreach($events as $event){

      // all day event without time and end
      if($event["is_date_only"]){
        $start_time = $this->date_string_to_time($event['start_time'], "-1 day");
        $end_time = $this->date_string_to_time($event['start_time']);

      // specific time
      }else{

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

      // updated time
      $updated_time = $this->date_string_to_time($event['updated_time']);

      // description
      $description = $split = $this->ical_split('DESCRIPTION:', $event["description"]);

      $body .= "BEGIN:VEVENT\r\n";
      $body .= "DTSTAMP:" . $updated_time . "\r\n";
      $body .= "LAST-MODIFIED:" . $updated_time . "\r\n";
      $body .= "CREATED:" . $updated_time . "\r\n";
      $body .= "SEQUENCE:0\r\n";
      $body .= "ORGANIZER;CN=" . $event["owner"]["name"] . ":MAILTO:noreply@facebookmail.com\r\n";
      $body .= "DTSTART:" . $start_time . "\r\n";
      $body .= "DTEND:" . $end_time . "\r\n";

      // if(isset($event["timezone"])){
      //   $body .= "TZID:" . $event["timezone"] . "\r\n";
      // }
      $body .= "UID:e" . $event['id'] . "@facebook.com\r\n";
      $body .= "SUMMARY:" . $event["name"] . "\r\n";
      $body .= "LOCATION:" . $event["location"] . "\r\n";
      $body .= "URL:http://www.facebook.com/events/" . $event['id'] . "/\r\n";
      $body .= "DESCRIPTION:" . $description . "\r\n";
      $body .= "CLASS:PUBLIC\r\n";
      $body .= "STATUS:CONFIRMED\r\n";
      $body .= "PARTSTAT:ACCEPTED\r\n";
      $body .= "END:VEVENT\r\n";
    }

    return $body;
  }

  // get with uid and token
  private function get_by_url($url){
    $calendar_string = file_get_contents($url, FILE_TEXT);

    $calendarArray = preg_split("/(^[A-Z-]+):/sm", $calendar_string, null, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE); // split by lines
    // is this text vcalendar standart text ? on line 1 is BEGIN:VCALENDAR
    if ($calendarArray[0] !== 'BEGIN'){
      throw new Exception('Not a VCALENDAR file');
    }

    // make proper array format
    $events = array();

    $eventIndex = 0;
    foreach($calendarArray as $i => $key_or_value){
      // even index number means key
      if($i % 2 == 0){
        $key = $key_or_value;
        $value = $calendarArray[$i + 1];

        // new event BEGIN
        if($key === "BEGIN" && trim($value) === "VEVENT") $eventIndex++;

        if($eventIndex === 0){ // header
        }elseif($key === "END" && trim($value) === "VCALENDAR"){ // footer
        }else{ // body
          $events[$eventIndex][$key] = $value;
        }
      }
    }

    // remove every but accepted and tentative events
    $filteredEvents = $events;
    $acceptedStates = array("ACCEPTED", "TENTATIVE");
    foreach($filteredEvents as $i => $event){
      foreach($event as $key => $value){
        if($key === "PARTSTAT"){
          if(!in_array(trim($value), $acceptedStates)){
            unset($filteredEvents[$i]);
          }
        }
      }
    }

    // body
    $body = "";
    foreach($filteredEvents as $i => $events){
      foreach($events as $key => $value){
        $body .= $key . ":" . $value;
      }
    }
    // return
    return $body;
  }


    // splitting ical content into multiple lines - See: http://www.ietf.org/rfc/rfc2445.txt, section 4.1
    private function ical_split($preamble, $value) {
      $value = trim($value);

      // escape linebreaks
      $value = str_replace("\n", "\\n", $value);

      // escape commas
      $value = str_replace(',', '\\,', $value);

      // insert actual linebreak
      $value = wordwrap($value, 50, "\r\n ");

      return $value;
    }

    private function date_string_to_time($date_string, $offset = ""){
      if(!isset($date_string)){
        return null;
      }

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