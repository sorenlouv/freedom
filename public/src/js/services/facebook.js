freedomApp.factory('facebook', ['$q', '$rootScope', function($q, $rootScope) {
  'use strict';
  var sdkDefer = $q.defer();
  var loginDefer = $q.defer();

  var facebook  = {
    sdkReady: sdkDefer.promise,
    loggedInReady: loginDefer.promise,
    isLoggedIn: false
  };

  // Facebook login status changed (login or logout)
  $rootScope.$on('facebook:authChange', function(evt, auth){
    if(auth.status === 'connected'){
      loginDefer.resolve(auth);
      facebook.isLoggedIn = true;
    }
  });

  // Facebook SDK was loaded
  $rootScope.$on('facebook:loaded', function(evt, response){
    sdkDefer.resolve(response);
  });

  // Facebook SDK could not be loaded within timeout
  $rootScope.$on('facebook:timeout', function(evt, response){
    sdkDefer.reject(response);
  });

  return facebook;
}]);
