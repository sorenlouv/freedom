<?php

class ical {

  private $plain_content = null;

  public function __construct($uid = null, $key = null){
    if (!is_null($uid) && !is_null($key) ) {
      $url = "https://www.facebook.com/ical/u.php?uid=" . $uid . "&key=" . $key;
      $this->plain_content = file_get_contents($url, FILE_TEXT);
    }
  }

  public function get_plain_content(){
    return $this->plain_content;
  }

  public function get_filtered_content(){
    $uncalendarBody = preg_split("/(^[A-Z-]+):/sm", $this->plain_content, null, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE); // split by lines
    // is this text vcalendar standart text ? on line 1 is BEGIN:VCALENDAR
    if ($uncalendarBody[0] !== 'BEGIN'){
      throw new Exception('Not a VCALENDAR file');
    }

    // make proper array format
    $calendarHeader = array();
    $calendarBody = array();

    $eventIndex = 0;
    foreach($uncalendarBody as $i => $key_or_value){
      // even index number means key
      if($i % 2 == 0){
        $key = $key_or_value;
        $value = $uncalendarBody[$i + 1];

        // new event BEGIN
        if($key === "BEGIN" && trim($value) === "VEVENT") $eventIndex++;

        // fix missing time on all day events
        if($key === "DTSTART" && strlen(trim($value)) === 8){
          $value = trim($value) . "T000000Z\n";
        }
        if($key === "DTEND" && strlen(trim($value)) === 8){
          $value = trim($value) . "T000000Z\n";
        }

        // avoid overwriting end event tag (with end calendar tag)
        if($key === "END" && trim($value) === "VCALENDAR") break;

        // add to header
        if($eventIndex === 0){
          $calendarHeader[$key] = $value;

        // add to body
        }else{
          $calendarBody[$eventIndex][$key] = $value;
        }
      }
    }

    // remove every but accepted and tentative events
    $filteredCalendarBody = $calendarBody;
    $acceptedStates = array("ACCEPTED", "TENTATIVE");
    foreach($filteredCalendarBody as $i => $event){
      foreach($event as $key => $value){
        if($key === "PARTSTAT"){
          if(!in_array(trim($value), $acceptedStates)){
            unset($filteredCalendarBody[$i]);
          }
        }
      }
    }

    /*
     * Header
     **/
    // calendar begin
    $header = "BEGIN:" . $calendarHeader["BEGIN"];
    unset($calendarHeader["BEGIN"]);

    // calendar version
    $header .= "VERSION:" . $calendarHeader["VERSION"];
    unset($calendarHeader["VERSION"]);

    // other params
    foreach($calendarHeader as $key => $value){
      $header .= $key . ":" . $value;
    }

    /*
     * Body
     **/
    $body = "";
    foreach($filteredCalendarBody as $i => $events){
      foreach($events as $key => $value){
        $body .= $key . ":" . $value;
      }
    }

    // combine header, body and end tag
    $output = $header . $body . "END:VCALENDAR";

    // return
    return $output;
  }
}