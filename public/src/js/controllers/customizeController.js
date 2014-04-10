freedomApp.controller("customizeController", function ($scope, $http) {
  'use strict';

  $scope.isLoadingSettings = true;

  $http.get('/users/settings/').success(function(data, status) {
    $scope.settings = data;
    $scope.isLoadingSettings = false;
  });

  $scope.saveSettings = function(){
    $scope.isLoadingSaveSettings = true;
    $http.post('/users/settings', $scope.settings).success(function(data, status) {
      $scope.isLoadingSaveSettings = false;
      console.log("saved");
    });
  };

});
