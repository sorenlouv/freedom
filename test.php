<?php

     function date_string_to_time($date_string, $offset = ""){
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


    function ical_split($value) {
      $value = trim($value);

      // escape linebreaks
      $value = str_replace("\n", "\\n", $value);

      // escape commas
      $value = str_replace(',', '\\,', $value);

      // escape backlashes
      $value = str_replace("\\", "\\\\", $value);

      // insert actual linebreak
      $value = wordwrap($value, 50, "\r\n ");

      return $value;
    }


echo ical_split("_\_\_ \n\nKom og nyd BILLIG PÅSKEBRYG til SVEDIGE RYTMER og hils på de søde");

// // Galla
// echo date_string_to_time("2013-03-16T15:00:00+0100");
// echo "<br>";
// echo date_string_to_time("2013-03-16T15:00:00+0100", "+3 hours");

// // skal blive til:
// // DTSTART:20130316T140000Z
// // DTEND:20130316T170000Z

// echo "<br>";
// echo "<br>";


// // Tour de Gulv
// echo date_string_to_time("2013-04-06", "-1 day");
// echo "<br>";
// echo date_string_to_time("2013-04-06");

// // skal blive til
// // DTSTART:20130405
// // DTEND:20130406
