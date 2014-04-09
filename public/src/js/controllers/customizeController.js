freedomApp.controller("customizeCtrl", function ($scope, $http) {
  'use strict';

  $http.get('/users/settings').success(function(data, status) {
    $scope.settings = data;
  });

  $scope.saveSettings = function(){
    $http.post('/users/settings', $scope.settings).success(function(data, status) {
      console.log("saved");
    });
  };

});
