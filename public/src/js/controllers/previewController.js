freedomApp.controller("previewController", function ($scope, $http) {
  'use strict';
  $scope.isLoading = true;

  $http.get('/feeds/preview/').success(function(data, status) {
    $scope.events = data;
    $scope.isLoading = false;
  });
});
