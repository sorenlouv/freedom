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
      // enable buttons

    // not logged in - attempt to login
    } else {
      checkAuth(false);
    }
  });
};


$('.analytics-filters button').click(function(e){
  var query;
  var targetQuery = $(e.target).data("query");
  if(targetQuery == "activeUsers"){
    query = queryActiveUsers;
  }else if(targetQuery == "legacyUsers"){
    query = queryLegacyUsers;
  }else if(targetQuery == "errorUsers"){
    query = queryErrorUsers;
  }

  gapi.client.load('analytics', 'v3', query);
});


// get error users from analytics
function queryErrorUsers() {
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:70063750',
    'dimensions': 'ga:eventLabel',
    'metrics': 'ga:totalEvents',
    'filters': 'ga:eventAction=~error;ga:eventLabel=~^\\d+$',
    'sort': '-ga:totalEvents',
    'start-date': lastNDays(1),
    'end-date': lastNDays(0),
    'max-results': '200'
  }).execute(outputFacebookUserInfo);
}

// get legacy users from analytics
function queryLegacyUsers() {
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:70063750',
    'dimensions': 'ga:eventLabel',
    'metrics': 'ga:totalEvents',
    'filters': 'ga:eventAction=~legacy',
    'sort': '-ga:totalEvents',
    'start-date': lastNDays(1),
    'end-date': lastNDays(0),
    'max-results': '200'
  }).execute(outputFacebookUserInfo);
}

// get active users from analytics
function queryActiveUsers() {
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:70063750',
    'dimensions': 'ga:eventLabel',
    'metrics': 'ga:totalEvents',
    'filters': 'ga:eventLabel=~^\\d+$',
    'sort': '-ga:totalEvents',
    'start-date': lastNDays(1),
    'end-date': lastNDays(0),
    'max-results': '200'
  }).execute(outputFacebookUserInfo);
}

// get users info from Facebook
function outputFacebookUserInfo(response){
  var eventUsers = response.rows;

  if(eventUsers === undefined){
    alert(response.message);
    console.log(response);
    return false;
  }

  // set user count
  var usersCount = eventUsers.length;
  $('#users-count span').text(usersCount);

  // clear table
  $('table.table tbody').empty();


  // loop over analytics users
  $.each(eventUsers, function(i, values){
    var facebookId = values[0];
    var totalEvents = values[1];

    // get names from facebook by ID
    FB.api('/' + facebookId + '?fields=name,location,devices', function (user) {
      if(user.devices && user.devices[0].os == "Android"){
        user.deviceIcon = "/img/android.jpeg";
      }else if(user.devices && user.devices[0].os == "iOS"){
        user.deviceIcon = "/img/apple.jpeg";
      }

      $('<tr/>', {
        html: Mustache.render('<td><img src="http://graph.facebook.com/{{id}}/picture"></td><td><a href="http://www.facebook.com/{{id}}">{{name}}</a></td><td>{{location.name}}</td><td><img src="{{deviceIcon}}" width="30"></td>', user)
      }).appendTo('table.table tbody');
    });

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
