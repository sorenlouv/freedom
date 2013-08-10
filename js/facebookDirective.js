angular.module('facebookDirective', [])
.directive('facebook', function() {
  return {
    restrict: 'E',
    // scope: true,

    // Controller
    controller: function($scope, $attrs, $rootScope, $q) {
      var deferred = $q.defer();
      $rootScope.facebookPromise = deferred.promise;

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
          deferred.resolve($scope.facebook);
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
        console.log("FB: SDK ready");
        scope.facebook.sdkLoaded = true;

        FB.init({
          appId      : attrs.appId, // App ID
          channelUrl : attrs.channelUrl, // Channel File
          status     : attrs.status, // check login status
          cookie     : attrs.cookie // enable cookies to allow the server to access the session
        });

        // Additional init code here
        FB.getLoginStatus(function(response) {
          console.log("FB: Authorized");
          scope.facebook.status = response.status;
          scope.$apply();
        });
      }; // end of fbAsyncInit

      // add fb-root
      element.after( '<div id="fb-root"></div>' );
    } // end of link function


  };
});