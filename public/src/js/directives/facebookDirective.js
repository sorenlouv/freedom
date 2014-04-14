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
