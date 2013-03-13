<?php

    function date_string_to_time($date_string){
      if(!isset($date_string)){
        return null;
      }

      $date_obj = new DateTime($date_string);

      // date without time
      if(strlen($date_string) === 10){
        $facebook_format = 'Y-m-d';
        $icalendar_format = 'Ymd';
        $timestamp = strtotime($date_obj->format($facebook_format));
      // date with time
      }else{
        $facebook_format = 'Y-m-d H:i:s';
        $icalendar_format = 'Ymd\THis\Z';
        $timestamp = strtotime($date_obj->format($facebook_format)) - $date_obj->format('Z');
      }

      $date = date($icalendar_format, $timestamp);

      return $date;
    }

echo date_string_to_time("2013-03-12T16:00:00+0100");

echo "<br>";

echo date_string_to_time("2013-03-12");


