freedomApp.controller("WizardController", function ($scope, $rootScope, facebookService) {
  $scope.step = 1;

  $scope.isAndroid = function(){
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
  };

  $scope.connectWithFacebook = function () {
    // remove all alerts
    $scope.errorMessage = "";
    $scope.loading = true;

    // get token with access to user_events and user_groups
    facebookService.requestPermissions(['user_events', 'user_groups'], function(){
      // extend access token
      $.getJSON('/handlers.php?f=saveAccessToken', function (response) {

        $scope.userId = FB.getAuthResponse()['userID'];
        var secureHash = response.secure_hash;

        // Add success event to GA
        _gaq.push(['_trackEvent', 'facebookLogin', 'success', $scope.userId]);

        // to avoid Google Calendar caching an old feed
        var dummy = Math.floor(Math.random() * 1000);

        // update DOM
        $scope.$apply(function(){
          // setup links
          $scope.downloadFeedHref = "webcal://freedom.konscript.com/feed.ics?user_id=" + $scope.userId + '&secure_hash=' + secureHash + '&dummy=' + dummy;
          $scope.googleButtonHref = "http://www.google.com/calendar/render?cid=" + encodeURIComponent($scope.downloadFeedHref);

          // next step
          $scope.step = 2;

          $scope.loading = false;
        });
      });

    // unsuccessful login
    }, function(){
      _gaq.push(['_trackEvent', 'facebookLogin', 'failed']);

      $scope.$apply(function(){
        $scope.errorMessage = "Facebook connect failed";
        $scope.loading = false;
      });
    });
  }; // End of connectWithFacebook function

  $scope.addToCalendarGoogle = function(){
    $scope.step = 3;
    _gaq.push(['_trackEvent', 'addToCalendar', 'google', $scope.userId]);
  };

  $scope.addToCalendarDownload = function(){
    $scope.step = 3;
    _gaq.push(['_trackEvent', 'addToCalendar', 'download', $scope.userId]);
  };

}); // end of WizardController
