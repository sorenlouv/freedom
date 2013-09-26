var statisticsApp = angular.module("statisticsApp", ["gapiService", "facebookDirective", "higchartDirective", "helpers", "safeApply"]);

statisticsApp.controller('AppCtrl', ['$rootScope', '$timeout', '$scope', '$q', 'gapiService', 'chartService', 'safeApply',
function ($rootScope, $timeout, $scope, $q, gapiService, chartService, safeApply) {

  // HACK: work-around to wait for facebook promise
  $timeout(function(){
      var gapiPromise = gapiService.loadSdk();
      var facebookReady = $rootScope.facebookReady;

      // both facebook and google APIs are ready
      $q.all([gapiPromise, facebookReady]).then(function(){

        // Default values
        $scope.progress = {
          value: 0,
          max: {
            gapi: 0,
            fb: 150
          }
        };

        // Chart data
        chartService.getVisitorsChartByType('success').then(function(chartData){
          $scope.chartData = chartData;
          chartService.getVisitorsChartByType('error').then(function(chartData){
            $scope.chartData = chartData;
          });
        });

        // Progress max
        $rootScope.$on('setProgressMax', function(event, type, total){
          safeApply($scope, function(){
            $scope.progress.max[type] = total;
          });
        });

        // Progress update
        $rootScope.$on('addToProgress', function(event, type){
          safeApply($scope, function(){
            $scope.progress.value += type == "gapi" ? 100 : 1;
          });
        });

        // Chart data
        chartService.getVisitorsChart().then(function(chartData){
          $scope.chartData = chartData;
        });
      }); // end of q.all()
  }, 0);

}]);


        // $scope.chartData = {
        //   "title": {
        //     "text": "Visitors per day"
        //   },
        //   "xAxis": {
        //     "type": "datetime"
        //   },
        //   "yAxis": {
        //     "title": {
        //       "text": "Visitors"
        //     }
        //   },
        //   "tooltip": {},
        //   "plotOptions": {
        //     "series": {
        //       "cursor": "pointer",
        //       "point": {
        //         "events": {}
        //       }
        //     }
        //   },
        //   "series": [{
        //     "name": "Visitors per day",
        //     "data": [89, 92, 89, 94, 94, 96, 92, 97, 97, 98, 97, 95, 90, 83, 83, 84, 86, 87, 87, 88, 88, 88, 91, 96, 96, 96, 96, 97, 97, 100, 99, 100, 100, 100, 100, 100, 102, 102, 101, 102, 102, 102, 102, 102, 102, 102, 102, 103, 105, 104, 108, 110, 114, 116, 116, 122, 129, 131, 137, 139, 140, 146, 151, 156, 162, 163, 164, 171, 176, 178, 184, 195, 197, 203, 205, 209, 214, 220, 226, 231],
        //     "pointStart": 1369155164594,
        //     "pointInterval": 86400000
        //   }]
        // };