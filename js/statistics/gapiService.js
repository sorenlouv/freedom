angular.module('gapiService', [])
.service('gapiService', function($rootScope, $q, helpers) {

  // Load Google Analytics SDK Async
  var loadSdk = function(){
    var deferred = $q.defer();

    var clientId = '979068059612.apps.googleusercontent.com';
    var apiKey = 'AIzaSyC1-OxcreTX25yak92YXljHjTY-hy36Alo';
    var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

    // Load API async
    (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/client.js?onload=onGAReady';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();

    // GA ready
    window.onGAReady = function() {
      console.log("Gapi: SDK ready");
      var options = {
        client_id: clientId,
        scope: scopes,
        immediate: true
      };

      // request login status
      gapi.client.setApiKey(apiKey);
      gapi.auth.authorize(options, function(response){
        console.log("Gapi: Authorized");
        deferred.resolve(gapi);
        $rootScope.$digest();
      });
    }; // end of onGAReady

    return deferred.promise;
  };

  // Get Data from Analytics
  var listVisitors = function(day){
    var deferred = $q.defer();

    var options = {
      'ids': 'ga:70063750',
      'dimensions': 'ga:eventLabel',
      'metrics': 'ga:totalEvents',
      'sort': '-ga:totalEvents',
      'filters': 'ga:eventLabel=~^\\d+$',
      "start-date": helpers.lastNDays(day + 1),
      "end-date": helpers.lastNDays(day + 1)
    };

    gapi.client.load('analytics', 'v3', function(){
      gapi.client.analytics.data.ga.get(options).execute(function(data){
        var visitors = data.rows.map(function(list){
          return list[0];
        });
        deferred.resolve(visitors);
        $rootScope.$digest();
      });
    });

    return deferred.promise;
  };

  var countVisitorsByType = function(day, type){
    var deferred = $q.defer();

    if(type !== "error" && type !== "success"){
      deferred.reject("Unknown type: " + type);
    }else{

      var options = {
        'ids': 'ga:70063750',
        'dimensions': 'ga:eventLabel',
        'metrics': 'ga:totalEvents',
        "start-date": helpers.lastNDays(day + 1),
        "end-date": helpers.lastNDays(day + 1),
        "filters": "ga:eventCategory=~" + type + ";ga:eventLabel=~^\\d+$",
        "max-results": 0
      };

      gapi.client.load('analytics', 'v3', function(){
        gapi.client.analytics.data.ga.get(options).execute(function(data){
          deferred.resolve(data.totalResults);
          $rootScope.$digest();
        });
      });
    } // end of else

    return deferred.promise;
  };

  return {
    loadSdk: loadSdk,
    listVisitors: listVisitors,
    countVisitorsByType: countVisitorsByType
  };
});