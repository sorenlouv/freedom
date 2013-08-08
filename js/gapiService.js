angular.module('gapiService', [])
.service('gapiService', function($rootScope, $q) {

  // Load Google Analytics SDK Async
  var loadSdk = function(){
    console.log(" - Gapi: Service ready");
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
      console.log(" - GApi: SDK ready");
      var options = {
        client_id: clientId,
        scope: scopes,
        immediate: true
      };

      // request login status
      gapi.client.setApiKey(apiKey);
      gapi.auth.authorize(options, function(response){
        console.log(" - GApi: Authorized");
        deferred.resolve(gapi);
        $rootScope.$digest();
      });
    }; // end of onGAReady

    return deferred.promise;
  };

  // Get Data from Analytics
  var getData = function(customOptions){
    var deferred = $q.defer();

    var defaultOptions = {
      'ids': 'ga:70063750',
      'dimensions': 'ga:eventLabel',
      'metrics': 'ga:totalEvents',
      'sort': '-ga:totalEvents',
      'start-date': lastNDays(1),
      'end-date': lastNDays(1)
    };

    var options = angular.extend(defaultOptions, customOptions);

    gapi.client.load('analytics', 'v3', function(){
      gapi.client.analytics.data.ga.get(options).execute(function(data){
        // list of facebook ids
        var users = data.rows.map(function(list){
          return list[0];
        });
        deferred.resolve(users);
        $rootScope.$digest();
      });
    });

    return deferred.promise;
  };

  return {
    loadSdk: loadSdk,
    getData: getData
  };
});