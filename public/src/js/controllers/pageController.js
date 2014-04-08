freedomApp.controller("pageCtrl", function($scope, $http, $location, safeApply) {
  'use strict';
  $http.get('/data/pages.json').success(function(data, status) {
    var currentPath = $location.path().substring(1);
    safeApply($scope, function() {
      $scope.data = data[currentPath];
    });
  });
});
