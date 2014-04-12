freedomApp.controller('customizeController', function ($scope, $http, $timeout) {
  'use strict';

  $scope.isLoadingSettings = false;
  $scope.isLoadingEvents = false;

  // Get settings
  var getSettings = function(){
    $scope.isLoadingSettings = true;
    $http.get('/users/settings/').success(function(data, status) {
      $scope.settings = data;
      $scope.isLoadingSettings = false;
    });
  };
  getSettings();

  // Get events
  var getEvents = function(){
    $scope.isLoadingEvents = true;
    $http.get('/feeds/preview/').success(function(data, status) {
      $scope.events = data;
      $scope.isLoadingEvents = false;
    });
  };
  getEvents();

  $scope.saveSettings = function(){
    $scope.isLoadingSaveSettings = true;
    $http.post('/users/feed-settings', $scope.settings).success(function(data, status) {
      $scope.isLoadingSaveSettings = false;
      $scope.events = data;
    });
  };

  $scope.isEventDateIdenticalToPreviousEventDate = function(index){
    if(index < 1) return false;

    var currentEventDate = new Date($scope.events[index].start_time).setHours(0, 0, 0, 0);
    var previousEventDate = new Date($scope.events[(index-1)].start_time).setHours(0, 0, 0, 0);

    return currentEventDate === previousEventDate;

  };

});
