var clientId = '979068059612.apps.googleusercontent.com';
var apiKey = 'AIzaSyC1-OxcreTX25yak92YXljHjTY-hy36Alo';
var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

/**
 * Callback executed once the Google APIs Javascript client library has loaded.
 * The function name is specified in the onload query parameter of URL to load
 * this library. After 1 millisecond, checkAuth is called.
 */
function onGAReady() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth, 1);
}

var checkAuth = function(immediate) {

  // immediate:
  // true = check if logged in
  // false = attempt to login
  if(immediate === undefined){
    immediate = true;
  }

  // request login status
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: immediate

  // receive login status response
  }, function(response){
    // logged in
    if (response) {
      // show active users
      //queryAnalyticsApi('activeUsers');
      queryAnalyticsApi('errorUsers');


    // not logged in - attempt to login
    } else {
      checkAuth(false);
    }
  });
};


$('.analytics-filters button').click(function(e){
  var query;
  var targetQuery = $(e.target).data("query");
  queryAnalyticsApi(targetQuery);
});

var queryAnalyticsApi = function(targetQuery){

  var options = {
    'ids': 'ga:70063750',
    'dimensions': 'ga:eventLabel',
    'metrics': 'ga:totalEvents',
    'sort': '-ga:totalEvents',
    'start-date': lastNDays(2),
    'end-date': lastNDays(0)
  };

  if(targetQuery == "activeUsers"){
    options.filters = 'ga:eventLabel=~^\\d+$';

  }else if(targetQuery == "legacyUsers"){
    options.filters = 'ga:eventAction=~legacy';

  }else if(targetQuery == "errorUsers"){
    // options.dimensions = 'ga:eventLabel,ga:eventAction';
    options.filters = 'ga:eventCategory=~error;ga:eventLabel=~^\\d+$';
  }

  // load api and fetch data in callback
  gapi.client.load('analytics', 'v3', function(){
    gapi.client.analytics.data.ga.get(options).execute(function(response){
      var users = [];

      getFacebookUsers(response.rows, function(users){
        // if target query is errorUsers, we must subtract successful users first
        if(targetQuery == "errorUsers"){
          options.filters = 'ga:eventCategory=~success;ga:eventLabel=~^\\d+$';
          gapi.client.analytics.data.ga.get(options).execute(function(response){
            var errorUsers = users;
            var successUsers = response.rows;

            $.each(errorUsers, function(i, errorUser){
              $.each(successUsers, function(j, successUser){

                // add number of successful events to errorUser
                if(errorUser.id == successUser[0]){
                  errorUsers[i]["successfulEvents"] = successUser[1];
                }
              });
            });

            outputErrorUsers(errorUsers);
          });

        // for other queryTargets just output the result
        }else{
          outputUsers(users);
        }
      });
    });
  });
};

// get facebook data
var getFacebookUsers = function(eventUsers, callback){
  var users = [];
  $.each(eventUsers, function(i, user){
    var facebookId = user[0];
    var totalEvents = user[1];

    // get names from facebook by ID
    FB.api('/' + facebookId + '?fields=name,location,devices', function (user) {
      user.totalEvents = totalEvents;
      users.push(user);

      // end of each
      if(users.length == eventUsers.length){
        callback(users);
      }
    });
  });
};

// get users info from Facebook
function outputErrorUsers(users){
  var successfulUsers = 0;

  // clear table
  $('table.table tbody').empty();

  // loop over analytics users
  $.each(users, function(i, user){
    if(user.successfulEvents !== undefined){
      successfulUsers++;
    }

    // add deviceIcon
    if(user.devices && user.devices[0].os == "Android"){
      user.deviceIcon = "/img/android.jpeg";
    }else if(user.devices && user.devices[0].os == "iOS"){
      user.deviceIcon = "/img/apple.jpeg";
    }

    $('<tr/>', {
      html: Mustache.render('<td><img src="http://graph.facebook.com/{{id}}/picture"></td><td><a href="http://www.facebook.com/{{id}}">{{name}} (<span style="color: red">{{totalEvents}}</span>, <span style="color: green">{{successfulEvents}}</span>)</a></td><td>{{location.name}}</td><td><img src="{{deviceIcon}}" width="30"></td>', user)
    }).appendTo('table.table tbody');

  });

  // set user count
  var usersCount = users.length;
  var usersCountExcludingSuccessful = users.length - successfulUsers;
  $('#users-count span').text(usersCountExcludingSuccessful + " (" + usersCount + ")");

}

// get users info from Facebook
function outputUsers(users){

  if(users === undefined){
    alert(response.message);
    console.log(response);
    return false;
  }

  // set user count
  var usersCount = users.length;
  $('#users-count span').text(usersCount);

  // clear table
  $('table.table tbody').empty();

  // loop over analytics users
  $.each(users, function(i, user){

    // add deviceIcon
    if(user.devices && user.devices[0].os == "Android"){
      user.deviceIcon = "/img/android.jpeg";
    }else if(user.devices && user.devices[0].os == "iOS"){
      user.deviceIcon = "/img/apple.jpeg";
    }

    $('<tr/>', {
      html: Mustache.render('<td><img src="http://graph.facebook.com/{{id}}/picture"></td><td><a href="http://www.facebook.com/{{id}}">{{name}}</a></td><td>{{location.name}}</td><td><img src="{{deviceIcon}}" width="30"></td>', user)
    }).appendTo('table.table tbody');

  });
}

// login when Facebook has loaded
$(document).bind('afterFBInit',function(){
  FB.login();
});

function lastNDays(n) {
  var today = new Date();
  var before = new Date();
  before.setDate(today.getDate() - n);

  var year = before.getFullYear();

  var month = before.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  var day = before.getDate();
  if (day < 10) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}
