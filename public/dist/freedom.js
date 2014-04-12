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

freedomApp.controller('customizeController', function ($scope, $http, $timeout, $location, facebook) {
  'use strict';

  $scope.isLoadingSettings = false;
  $scope.isLoadingEvents = false;

  facebook.ready.then(function(auth){
    if(auth.status !== 'connected'){
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

  $scope.saveSettings = function(){
    $scope.isLoadingSaveSettings = true;
    $http.post('/users/feed-settings', $scope.settings).success(function(data, status) {
      $scope.isLoadingSaveSettings = false;
      $scope.events = data;
    });
  };

  $scope.isEventDateIdenticalToPreviousEventDate = function(index){
    if(index < 1) return false;

    var currentEventDate = new Date($scope.events[index].start_time).setHours(0, 0, 0, 0);
    var previousEventDate = new Date($scope.events[(index-1)].start_time).setHours(0, 0, 0, 0);

    return currentEventDate === previousEventDate;

  };

});

freedomApp.controller('MainController', function($scope, $http, $location, $window, facebook) {
  'use strict';

  var userId;
  var saveAccessToken = function(){
    $http({
      method: 'POST',
      url: '/users/save-access-token'
    }).success(function(response) {

      userId = FB.getAuthResponse().userID;
      var secureHash = response.secure_hash;

      // Add success event to GA
      $window._gaq.push(['_trackEvent', 'facebookLogin', 'success', userId]);

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
    $window._gaq.push(['_trackEvent', 'facebookLogin', 'failed']);

    $scope.$apply(function() {
      $scope.errorMessage = 'It seems like you did not login with Facebook. Please try again.';
      $scope.isLoading = false;
    });
  };


  // Default values
  $scope.step = 1;
  $scope.errorMessage = '';
  $scope.isLoading = false;
  $scope.userLoggedIn = false;

  // If user is logged in
  facebook.ready.then(function(auth){
    if(auth.status === 'connected'){
      $scope.userLoggedIn = true;
    }
  });

  // Listen for route changes
  $scope.$on('$routeChangeSuccess', function(next, current) {
    // Set current path
    $scope.currentPath = $location.path().substring(1);

    // Track analytics on route change
    $window._gaq.push(['_trackPageview', $location.path()]);

  });

  $scope.isAndroid = function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('android') > -1; //&& ua.indexOf('mobile');
  };

  $scope.connectWithFacebook = function() {
    // remove all alerts
    $scope.errorMessage = '';
    $scope.isLoading = true;

    // get token with access to user_events and user_groups
    facebook.ready.then(function(auth){
      // User not logged in
      if(auth !== 'connected'){
        facebookLogin();

      // User already logged in
      }else{
        saveAccessToken();
      }

    // Facebook SDK could not be loaded
    },function(message){
      $scope.errorMessage = message;
      $scope.isLoading = false;
    });
  }; // End of connectWithFacebook function

  $scope.addToCalendarGoogle = function() {
    $scope.step = 3;
    $window._gaq.push(['_trackEvent', 'addToCalendar', 'google', userId]);
  };

  $scope.addToCalendarDownload = function() {
    $scope.step = 3;
    $window._gaq.push(['_trackEvent', 'addToCalendar', 'download', userId]);
  };

  $scope.isActive = function(path) {
    return $scope.currentPath === path;
  };

  $scope.menuItems =[{
    'label': 'What',
    'symbol': '?',
    'link': 'what'
  },
  {
    'label': 'Privacy',
    'symbol': '!',
    'link': 'privacy'
  },
  {
    'label': 'Author',
    'symbol': '@',
    'link': 'author'
  },{
    'label': 'Customize',
    'symbol': '#',
    'link': 'customize',
    'requireLogIn': true
  }];

}); // end of WizardController

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
      // Abort with error if Facebook SDK has not been loaded after 15 seconds
      var promiseTimeout = $timeout(function(){
        console.log('Facebook Connect timed out');
        $rootScope.$emit('facebook:timeout','A connection to Facebook could not be established. If you have installed any blocking extensions like Ghostery, Do Not Track Me, Priv3 or anything similar, you must disable them, or whitelist this website.');
      }, 15000);

      // Attach a watcher for, when the SDK is loaded
      $scope.$watch('sdkLoaded', function(sdkLoaded){
        if(sdkLoaded !== true) return;
        console.log('FB: SDK loaded');

        // Remove timeout
        $timeout.cancel(promiseTimeout);

        // Additional init code here
        FB.getLoginStatus(function(response) {
          console.log('FB: Login status -', response.status);

          safeApply($rootScope, function(){
            $rootScope.$emit('facebook:loaded', response);
          });
        });
      });

      // Load the SDK Asynchronously
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = '//connect.facebook.net/en_US/all.js';
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
    var deferred = $q.defer();

    console.log('Hey');

    var facebook  = {};
    facebook.ready = deferred.promise;

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
