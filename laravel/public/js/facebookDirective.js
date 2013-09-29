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
    getMissingPermissions(permissionsRequired, function(){
      console.log("Query not cached. Fetching", query);
      FB.api(query, function(response){
        cachedResponses[query] = response;
        successCallback(response);
      });
    }, errorCallback);

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