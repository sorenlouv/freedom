<?php

    include 'config.php';
    require_once "facebook-sdk/facebook.php";

    $facebook = new Facebook(array(
      'appId'  => $CLIENT_ID,
      'secret' => $CLIENT_SECRET,
    ));

    function get_event_by_type($event_type){
      return array('method' => 'GET', 'relative_url' => '/me/events/' . $event_type . '?limit=1000&fields=description,end_time,id,location,owner,rsvp_status,start_time,name,timezone,updated_time,is_date_only');
    }

    $event_type_choices = array(
        "attending" => true,
        "maybe" => true,
        "not_replied" => false,
        "birthday" => false
    );

    // prepare batch request
    $event_queries = array();
    if($event_type_choices["attending"]){
        $event_index["attending"] = count($event_queries);
        $event_queries[] = get_event_by_type("attending");
    }

    if($event_type_choices["maybe"]){
        $event_index["maybe"] = count($event_queries);
        $event_queries[] = get_event_by_type("maybe");
    }

    if($event_type_choices["not_replied"]){
        $event_index["not_replied"] = count($event_queries);
        $event_queries[] = get_event_by_type("not_replied");
    }

    if($event_type_choices["birthday"]){
        $event_index["birthday"] = count($event_queries);
        $event_queries[] = array('method' => 'GET', 'relative_url' => '/me/friends?fields=id,name,birthday&limit=2000');
    }

    // get events from Facebook
    $batch_response = $facebook->api('?batch='.urlencode(json_encode($event_queries)), 'POST');

    // prepare batch response
    $events = array();
    if($event_type_choices["attending"]){
        $attending_events = json_decode($batch_response[$event_index["attending"]]["body"], true);
        $attending_events = $attending_events["data"];
        $events = array_merge($events, $attending_events);
    }

    if($event_type_choices["maybe"]){
        $maybe_events = json_decode($batch_response[$event_index["maybe"]]["body"], true);
        $maybe_events = $maybe_events["data"];
        $events = array_merge($events, $maybe_events);
    }

    if($event_type_choices["not_replied"]){
        $not_replied_events = json_decode($batch_response[$event_index["not_replied"]]["body"], true);
        $not_replied_events = $not_replied_events["data"];
        $events = array_merge($events, $not_replied_events);
    }

    if($event_type_choices["birthday"]){
        $birthday_events = json_decode($batch_response[$event_index["birthday"]]["body"], true);
        $birthday_events = $birthday_events["data"];

        foreach($birthday_events as $event_key => $event){

            // remove event if no birthday
            if(!isset($event["birthday"])){
                unset($birthday_events[$event_key]);

            }else{
                $birthday = explode("/", $event["birthday"]);
                $month = $birthday[0];
                $day = $birthday[1];
                $year = date('Y');
                $next_birthday_timestamp = mktime(0,0,0, $month, $day, $year);

                // make sure birthday is not in the past
                if($next_birthday_timestamp < time()){
                    $next_birthday_timestamp = mktime(0,0,0, $month, $day, $year+1);
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
    function sort_cb($a, $b) {
        return strcmp($a["start_time"], $b["start_time"]);
    }
    usort($events, 'sort_cb');

    echo json_encode($events);