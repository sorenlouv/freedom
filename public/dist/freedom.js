var freedomApp = angular.module('freedomApp', ['ngRoute', 'ngSanitize', 'facebookDirective', 'safeApply'])

.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
  'use strict';

  // add webcal:// and file:// to Angular's whitelist
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);

  $routeProvider.
    when('/home', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/renew', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/customize', {templateUrl: 'templates/customize.html', controller: 'customizeController'}).
    when('/preview', {templateUrl: 'templates/preview.html', controller: 'previewController'}).

    //
    when('/what', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/privacy', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/author', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    otherwise({redirectTo: '/home'});
}]);

freedomApp.controller('customizeController', function ($scope, $rootScope, $http, $timeout, $location, $window, facebook) {
  'use strict';

  $scope.isLoadingSettings = false;
  $scope.isLoadingEvents = false;

  facebook.sdkReady.then(function(auth){
    if(!facebook.isLoggedIn){
      $location.path( '/home' );
    }
  });

  // Get settings
  var getSettings = function(){
    $scope.isLoadingSettings = true;
    $http.get('/users/settings/').success(function(data, status) {
      $scope.settings = data;
      $scope.isLoadingSettings = false;

      $scope.calendarFeedUrl = 'webcal://freedom.konscript.com/feed.ics?user_id=' + data.id + '&secure_hash=' + data.secure_hash + '&dummy=' + Math.floor(Math.random() * 1000);
    });
  };
  getSettings();

  // Get events
  var getEvents = function(){
    $scope.isLoadingEvents = true;
    $http.get('/feeds/preview/').success(function(data, status) {
      $scope.events = data;
      $scope.isLoadingEvents = false;
    });
  };
  getEvents();

  $scope.saveSettings = function(eventResponse){
    $scope.isLoadingSaveSettings = true;
    $http.post('/users/feed-settings', $scope.settings).success(function(data, status) {
      $scope.isLoadingSaveSettings = false;
      $scope.events = data;
    });

    var action =  eventResponse + '_' + $scope.settings[eventResponse];
    $window.ga('send', 'event', 'customization', action, $scope.settings.id, 1);
  };

  $scope.isEventDateIdenticalToPreviousEventDate = function(index){
    if(index < 1) return false;

    var currentEventDate = new Date($scope.events[index].start_time).setHours(0, 0, 0, 0);
    var previousEventDate = new Date($scope.events[(index-1)].start_time).setHours(0, 0, 0, 0);

    return currentEventDate === previousEventDate;
  };

  $scope.getLocaleTimeFormat = function(date){
    var dateOnly = date.length === 10;
    if(dateOnly){
      return 'All day';
    }else{
      var dateObject = new Date(date);
      return dateObject.toLocaleTimeString($window.navigator.language, {hour: '2-digit', minute:'2-digit'});
    }
  };
});

freedomApp.controller('MainController', function($scope, $rootScope, $http, $location, $window, facebook, safeApply) {
  'use strict';

  var userId;
  var saveAccessToken = function(){
    $http({
      method: 'POST',
      url: '/users/save-access-token'
    }).success(function(response) {

      userId = FB.getAuthResponse().userID;
      var secureHash = response.secure_hash;

      // Add facebook login event to GA
      $window.ga('send', 'event', 'facebookLogin', 'success', userId, 5);

      // to avoid Google Calendar caching an old feed
      var dummy = Math.floor(Math.random() * 1000);

      // update DOM
      $scope.downloadFeedHref = 'webcal://freedom.konscript.com/feed.ics?user_id=' + userId + '&secure_hash=' + secureHash + '&dummy=' + dummy;
      $scope.googleButtonHref = 'http://www.google.com/calendar/render?cid=' + encodeURIComponent($scope.downloadFeedHref);

      // next step
      $scope.step = 2;
      $scope.isLoading = false;
    }).error(function(){
      $scope.errorMessage = 'Ouch! We are sorry, but we are having problems setting up your calendar. Try again later.';
      $scope.isLoading = false;
    });
  };

  var facebookLogin = function(){
    var facebookPermissions = 'user_events, user_groups'; // user_friends, read_friendlists

    FB.login(function(response) {
      if(response.authResponse){
        saveAccessToken(); // Successfully logged in
      }else{
        onFacebookConnectDeclinedByUser(); // User aborted Facebook login
      }
    }, {scope: facebookPermissions});
  };

  var onFacebookConnectDeclinedByUser = function(){
    $window.ga('send', 'event', 'facebookLogin', 'failed', null, 0);

    $scope.$apply(function() {
      $scope.errorMessage = 'It seems like you did not login with Facebook. Please try again.';
      $scope.isLoading = false;
    });
  };

  // Set user information to help answer bug reports
  var setUserVoiceIdentity = function(){
    FB.api('/me', function(user){
      var name = user.first_name + ' ' + user.last_name;

      $window.UserVoice.push(['identify', {
        name: name,
        id: user.id
      }]);

    });
  };


  // Default values
  $scope.step = 1;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.loggedIn = function(){
    return facebook.isLoggedIn;
  };

  // If user is logged in
  facebook.loggedInReady.then(function(auth){
    setUserVoiceIdentity();
  });

  // Listen for route changes
  $scope.$on('$routeChangeSuccess', function(next, current) {
    // Set current path
    $scope.currentPath = $location.path().substring(1);

    // Track analytics on route change
    $window.ga('send', 'pageview', $location.path());

  });

  $scope.facebookLogin = facebookLogin;

  $scope.isAndroid = function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('android') > -1; //&& ua.indexOf('mobile');
  };

  $scope.connectWithFacebook = function() {
    // remove all alerts
    $scope.errorMessage = '';
    $scope.isLoading = true;

    // get token with access to user_events and user_groups
    facebook.sdkReady.then(function(auth){
      // User not logged in
      if(auth !== 'connected'){
        facebookLogin();

      // User already logged in
      }else{
        saveAccessToken();
      }

    // Facebook SDK could not be loaded
    },function(response){
      $window.ga('send', 'event', 'facebookLogin', 'timeout');
      $scope.errorMessage = 'A connection to Facebook could not be established. If you have installed any blocking extensions like Ghostery, Do Not Track Me, Priv3 or anything similar, you must disable them, or whitelist this website.';
      $scope.isLoading = false;
    });
  }; // End of connectWithFacebook function

  $scope.addToCalendarGoogle = function() {
    $scope.step = 3;
    $window.ga('send', 'event', 'addToCalendar', 'google', userId, 10);
  };

  $scope.addToCalendarDownload = function() {
    $scope.step = 3;
    $window.ga('send', 'event', 'addToCalendar', 'download', userId, 10);
  };

  $scope.isActive = function(path) {
    return $scope.currentPath === path;
  };

});

freedomApp.controller('pageController', function($scope, $rootScope, $http, $location) {
  'use strict';
  var currentPath = $location.path().substring(1);

  $http.get('/data/pages.json').success(function(data, status) {
    $scope.data = data[currentPath];
  });
});

angular.module('facebookDirective', []).directive('facebook', function(safeApply, $timeout) {
  'use strict';
  return {
    restrict: 'E',
    // scope: true,

    // Controller
    controller: function($scope, $attrs, $rootScope, $q) {
      var timeoutSeconds = 15;

      // Abort with error if Facebook SDK has not been loaded after 15 seconds
      var promiseTimeout = $timeout(function(){
        console.log('Facebook Connect timed out');
        $rootScope.$emit('facebook:timeout', 'Timed out loading Facebook SDK after ' + timeoutSeconds + ' seconds');
      }, timeoutSeconds * 1000);

      // Attach a watcher for, when the SDK is loaded
      $scope.$watch('sdkLoaded', function(sdkLoaded){
        if(sdkLoaded !== true) return;

        // Remove timeout
        $timeout.cancel(promiseTimeout);

        // Executed when login status is ready
        FB.getLoginStatus(function(response) {
          safeApply($rootScope, function(){
            console.log('FB: SDK loaded');
            $rootScope.$emit('facebook:loaded', response);
          });
        });

        // Executed when auth status changes
        FB.Event.subscribe('auth.statusChange', function(response){
          safeApply($rootScope, function(){
            console.log('FB: Auth status change: "' + response.status + '"');
            $rootScope.$emit('facebook:authChange', response);
          });
        });
      });

      // Load the SDK Asynchronously
      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = '//connect.facebook.net/en_US/sdk.js';
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));

    }, // controller end


    // Link function
    link: function($scope, $element, $attrs) {
      // add fb-root to document
      $element.after( '<div id="fb-root"></div>' );

      // Set attributes
      if(!$attrs.appId){
        throw('Missing app-id');
      }

      // fbAsyncInit is run as soon as the SDK is loaded
      window.fbAsyncInit = function() {
        FB.init({
          version    : 'v2.3',
          appId      : $attrs.appId,                   // App ID
          channelUrl : $attrs.channelUrl || 'channel.php',
          status     : $attrs.status || false,         // check login status
          cookie     : $attrs.cookie || true           // enable cookies to allow the server to access the session
        });

        safeApply($scope, function(){
          $scope.sdkLoaded = true;
        });
      }; // end of fbAsyncInit
    } // end of link function
  };
});

freedomApp.directive('spinner', [function() {
  'use strict';
  return {
    scope: {
      isLoading: '='
    },
    restrict: 'C',
    template: '<div class="inner"></div>',
    transclude: true,
    replace: false,
    link: function($scope, $element, $attrs) {

      $scope.$watch('isLoading', function(isLoading){
        if(isLoading === undefined) return;

        if(isLoading === true){
          $element.addClass('loading');
        }else if(isLoading === false){
          $element.removeClass('loading');
        }
      });
    }
  };
}]);

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

angular.module('safeApply',[]).factory('safeApply', ['$rootScope', function($rootScope) {
    'use strict';
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
