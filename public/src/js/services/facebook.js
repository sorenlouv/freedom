freedomApp.factory('facebook', ['$q', '$rootScope', function($q, $rootScope) {
  'use strict';
  var deferred = $q.defer();

  var facebook  = {
    ready: deferred.promise,
    loggedIn: false
  };

  // Facebook login status changed (login or logout)
  $rootScope.$on('facebook:authChange', function(evt, auth){
    facebook.loggedIn = auth.status === 'connected' ? true : false;
  });

  // Facebook SDK was loaded
  $rootScope.$on('facebook:loaded', function(evt, response){
    deferred.resolve(response);
  });

  // Facebook SDK could not be loaded within timeout
  $rootScope.$on('facebook:timeout', function(evt, response){
    deferred.reject(response);
  });

  return facebook;
}]);
