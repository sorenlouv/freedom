freedomApp.controller("pageCtrl", function($scope, $rootScope, $http, $location) {
  'use strict';
  var currentPath = $location.path().substring(1);

  $http.get('/data/pages.json').success(function(data, status) {
    $scope.data = data[currentPath];
  });
});
