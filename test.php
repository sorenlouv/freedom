<?php

  function date_string_to_time($date_string = null, $offset = ""){
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

  echo date_string_to_time(null, "+27 hours");

?>