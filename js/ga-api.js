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
      gapi.client.load('analytics', 'v3', getActiveUsers);

    // not logged in - attempt to login
    } else {
      checkAuth(false);
    }
  });
};

// get active users from analytics
function getActiveUsers() {
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:70063750',
    'dimensions': 'ga:eventLabel',
    'metrics': 'ga:totalEvents',
    'filters': 'ga:eventLabel=~^\\d+$',
    'sort': '-ga:totalEvents',
    'start-date': lastNDays(2),
    'end-date': lastNDays(0),
    'max-results': '200'
  }).execute(function(response){
    var eventUsers = response.rows;
    getFacebookUserInfo(eventUsers);
  });
}

// get users info from Facebook
function getFacebookUserInfo(eventUsers){

  var usersCount = eventUsers.length;
  $('#users-count span').text(usersCount);

  // get propert structure for FB query
  var users = $.map(eventUsers, function(values, i) {
    var facebookId = values[0];
    var totalEvents = values[1];
    return { relative_url: facebookId + '?fields=name,location'};
  });

  // get users from Graph API
  FB.api('/', 'POST', {
      batch: users
  }, function (responses) {
    $.each(responses, function(i, response){
      var user = jQuery.parseJSON(response["body"]);

      $('<tr/>', {
        html: Mustache.render('<td><a href="http://www.facebook.com/{{id}}">{{name}}</a></td><td>{{location.name}}</td>', user)
      }).appendTo('table.table');
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
