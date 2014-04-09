freedomApp.controller("pageCtrl", function($scope, $rootScope, $http, $location) {
  'use strict';
  $http.get('/data/pages.json').success(function(data, status) {
    var currentPath = $location.path().substring(1);
    $rootScope.currentPath = currentPath;
    $scope.data = data[currentPath];
  });
});
