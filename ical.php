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

    $header = "BEGIN:VCALENDAR\r\n";
    $header .= "VERSION:2.0\r\n";
    $header .= "PRODID:-//Facebook//NONSGML Facebook Events V1.0//EN\r\n";
    $header .= "X-WR-CALNAME:Facebook Events\r\n";
    $header .= "X-PUBLISHED-TTL:PT12H\r\n";
    $header .= "X-ORIGINAL-URL:https://www.facebook.com/events/\r\n";
    $header .= "CALSCALE:GREGORIAN\r\n";
    $header .= "METHOD:PUBLISH\r\n";

    $footer = "END:VCALENDAR\r\n";

    $body = $this->calendar_body;

    return $header . $body . $footer;
  }

  private function get_by_access_token($access_token){
    $facebook = new Facebook(array(
      'appId'  => 408564152572106,
      'secret' => fb77ed0cdc61baa591b710231994c8d7,
    ));
    $facebook->setAccessToken($_GET["access_token"]);
    $data = $facebook->api('me?fields=events.limit(100000).fields(description,end_time,id,is_date_only,location,owner,rsvp_status,start_time,name,timezone,updated_time)','GET');
    $events = $data["events"]["data"];

    $body = "";
    foreach($events as $event){
      // print_r($event);
      $event_url = 'https://www.facebook.com/event.php?eid=' . $event['id'];

      // start time
      $start_time = new DateTime($event['start_time']);
      $start_time_formatted = $start_time->format('Ymd\THis\Z');

      // end time
      $end_time = new DateTime($event['end_time']);
      $end_time_formatted = $end_time->format('Ymd\THis\Z');

      // updated time
      $updated_time = new DateTime($event['updated_time']);
      $updated_time_formatted = $updated_time->format('Ymd\THis\Z');

      // description
      $description = str_replace("\n", "\\n", trim($event["description"]));
      $description = str_replace(",", "\\,", $description);
      $description = wordwrap($description, 37, "\r\n ");

      $body .= "BEGIN:VEVENT\r\n";
      $body .= "DTSTAMP:" . $updated_time_formatted . "\r\n";
      $body .= "LAST-MODIFIED:" . $updated_time_formatted . "\r\n";
      $body .= "CREATED:" . $updated_time_formatted . "\r\n";
      $body .= "SEQUENCE:0\r\n";
      $body .= "ORGANIZER;CN=" . $event["owner"]["name"] . ":MAILTO:noreply@facebookmail.com\r\n";
      $body .= "DTSTART:" . $start_time_formatted . "\r\n";
      $body .= "DTEND:" . $end_time_formatted . "\r\n";
      $body .= "TZID:" . $event["timezone"] . "\r\n";
      $body .= "UID:" . $event['id'] . "@facebook.com\r\n";
      $body .= "SUMMARY:" . $event["name"] . "\r\n";
      $body .= "LOCATION:" . $event["location"] . "\r\n";
      $body .= "URL:" . $event_url . "\r\n";
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
}