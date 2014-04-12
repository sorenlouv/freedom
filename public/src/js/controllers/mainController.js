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

  // Set user information to help answer bug reports
  var setUserVoiceIdentity = function(){
    FB.api('/me', function(user){
      $window.UserVoice.push(['identify', {
        name: user.first_name + ' ' + user.last_name,
        facebook_id: user.id,
        gender: user.gender
      }]);
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
      setUserVoiceIdentity();
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
