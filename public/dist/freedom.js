var freedomApp = angular.module('freedomApp', ['ngRoute', 'facebookDirective', 'safeApply', 'facebookService'])

.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
  'use strict';

  // add webcal:// and file:// to Angular's whitelist
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);

  $routeProvider.
    when('/home', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/what', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/privacy', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/author', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/facebook', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    otherwise({redirectTo: '/home'});
}]);

freedomApp.controller("footerCtrl", function ($scope, $location) {
  $scope.isActive = function(path) {
    return $location.path().substr(1) === path;
  };

  $scope.menuItems =[
    {
      "label": "What",
      "symbol": "?",
      "link": "what"
    },
    {
      "label": "Privacy",
      "symbol": "!",
      "link": "privacy"
    },
    {
      "label": "Author",
      "symbol": "@",
      "link": "author"
    },
    {
      "label": "Facebook",
      "symbol": "#",
      "link": "facebook"
    }];
});
freedomApp.controller("pageCtrl", function($scope, $http, $location, safeApply) {
  'use strict';
  $http.get('/data/pages.json').success(function(data, status) {
    var currentPath = $location.path().substring(1);
    safeApply($scope, function() {
      $scope.data = data[currentPath];
    });
  });
});

freedomApp.controller("WizardController", function($scope, $rootScope, $http, facebookService) {
  'use strict';

  $scope.step = 1;

  $scope.isAndroid = function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
  };

  $scope.connectWithFacebook = function() {
    // remove all alerts
    $scope.errorMessage = "";
    $scope.loading = true;

    // get token with access to user_events and user_groups
    facebookService.login(['user_events', 'user_groups', 'user_friends', 'read_friendlists'], function() {
      // extend access token

      $http({
        method: 'POST',
        url: '/users/save-access-token'
      }).success(function(response) {

        $scope.userId = FB.getAuthResponse().userID;
        var secureHash = response.secure_hash;

        // Add success event to GA
        _gaq.push(['_trackEvent', 'facebookLogin', 'success', $scope.userId]);

        // to avoid Google Calendar caching an old feed
        var dummy = Math.floor(Math.random() * 1000);

        // update DOM
        $scope.downloadFeedHref = "webcal://freedom.konscript.com/feed.ics?user_id=" + $scope.userId + '&secure_hash=' + secureHash + '&dummy=' + dummy;
        $scope.googleButtonHref = "http://www.google.com/calendar/render?cid=" + encodeURIComponent($scope.downloadFeedHref);

        // next step
        $scope.step = 2;
        $scope.loading = false;
      });

      // unsuccessful login
    }, function() {
      _gaq.push(['_trackEvent', 'facebookLogin', 'failed']);

      $scope.$apply(function() {
        $scope.errorMessage = "Facebook connect failed";
        $scope.loading = false;
      });
    });
  }; // End of connectWithFacebook function

  $scope.addToCalendarGoogle = function() {
    $scope.step = 3;
    _gaq.push(['_trackEvent', 'addToCalendar', 'google', $scope.userId]);
  };

  $scope.addToCalendarDownload = function() {
    $scope.step = 3;
    _gaq.push(['_trackEvent', 'addToCalendar', 'download', $scope.userId]);
  };

}); // end of WizardController

/**
*  Wrapper service to login to facebook (take care of promise stuff)
*/
angular.module('facebookService', []).factory('facebookService', function($rootScope, safeApply) {

  $rootScope.facebookAuthenticated = false;
  var cachedResponses = {};

  var getMissingPermissions = function(permissionsRequired, successCallback, errorCallback){
    // FB ready
    $rootScope.facebookReady.then(function(data){
      // get current permissions
      FB.api('/me/permissions', function(response) {
        var currentPermissions = response.data[0];
        var missingPermissions = [];

        // Check if there are any required permissions we don't have
        for (var i in permissionsRequired) {
          if (currentPermissions[permissionsRequired[i]] !== 1) {
            missingPermissions.push(permissionsRequired[i]);
          }
        }

        // additional permissions required or just a need to login
        if(missingPermissions.length > 0 || permissionsRequired.length === 0){
          console.log("Missing permissions: ", missingPermissions);
          safeApply($rootScope, function(){
            login(missingPermissions, successCallback, errorCallback);
          });

        // no more permissions required
        }else{
          safeApply($rootScope, function(){
            $rootScope.facebookAuthenticated = true;
          });

          console.log("No permissions missing");
          successCallback();
        }
      }); // end of FB.api
    }); // end of facebookReady
  };

  // Request permissions and login
  var login = function(permissionsRequested, successCallback, errorCallback){

    // Load SDK
    $rootScope.facebookReady.then(function(data){
      FB.getLoginStatus(function(response){

        // already logged in and no specific permissions requested
        if(response.status === "connected" && permissionsRequested.length === 0){
          successCallback(response);

          safeApply($rootScope, function(){
            $rootScope.facebookAuthenticated = true;
          });

        // Not logged in or permissions requested
        }else{
          FB.login(function (response) {

            // successful login (permissions obtained)
            if (response.authResponse) {
              successCallback(response);

              safeApply($rootScope, function(){
                $rootScope.facebookAuthenticated = true;
              });

              console.log("Permissions (maybe) obtained!");

            // unsuccessful login (permissions could not be obtained)
            } else {
              console.log("Permissions could not be obtained:", permissionsRequested);
              if(errorCallback){ errorCallback(response); }
            }
          }, { scope: permissionsRequested.join(',') });
        }
      });
    });
  };

  // Wrapper for FB.api - will cache and get permissions if missing
  var api = function(permissionsRequired, query, successCallback, errorCallback){
    var facebookService = this;

    // Check cache to see if it contains the response
    if(query in cachedResponses){
      console.log("Query was cached", query);
      successCallback(cachedResponses[query]);
      return true;
    }

    // check if any permissions are missing and request them if needed. Then fetch data
    safeApply($rootScope, function(){
      getMissingPermissions(permissionsRequired, function(){
        console.log("Query not cached. Fetching", query);
        FB.api(query, function(response){
          cachedResponses[query] = response;
          successCallback(response);
        });
      }, errorCallback);
    });
  };

  // public methods
  return {
    login: login, // get permissions and login
    api: api // getting date (will make sure that user has/gets suffiecient permissions and is already logged in)
  };
});

angular.module('facebookDirective', [])
.directive('facebook', function(safeApply) {
  return {
    restrict: 'E',
    // scope: true,

    // Controller
    controller: function($scope, $attrs, $rootScope, $q) {
      var deferred = $q.defer();
      $rootScope.facebookReady = deferred.promise;

      // Load the SDK Asynchronously
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

      $scope.$watch('facebook.sdkLoaded', function(sdkLoaded){
        if(sdkLoaded){
          // Additional init code here
          FB.getLoginStatus(function(response) {
            console.log("FB: Authorized");

            safeApply($rootScope, function(){
              deferred.resolve($scope.facebook);
            });
          });
        }
      });
    }, // controller end


    // Link function
    link: function(scope, element, attrs, controller) {
      scope.facebook = {};

      // Set attributes
      if(!attrs.appId){
        throw("Missing app-id");
      }
      if(!attrs.channelUrl){
        attrs.channelUrl = 'channel.php';
      }
      if(!attrs.status){
        attrs.status = false;
      }
      if(!attrs.cookie){
        attrs.cookie = true;
      }

      // fbAsyncInit is run as soon as the SDK is loaded
      window.fbAsyncInit = function() {
        FB.init({
          appId      : attrs.appId, // App ID
          channelUrl : attrs.channelUrl, // Channel File
          status     : attrs.status, // check login status
          cookie     : attrs.cookie // enable cookies to allow the server to access the session
        });

        console.log("FB: SDK ready");
        safeApply(scope, function(){
          scope.facebook.sdkLoaded = true;
        });
      }; // end of fbAsyncInit

      // add fb-root
      element.after( '<div id="fb-root"></div>' );
    } // end of link function


  };
});
angular.module('safeApply',[])

.factory('safeApply', [function($rootScope) {
    return function($scope, fn) {
        var phase = $scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if (fn) {
                $scope.$eval(fn);
            }
        } else {
            if (fn) {
                $scope.$apply(fn);
            } else {
                $scope.$apply();
            }
        }
    };
}]);