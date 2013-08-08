var analyticsApp = angular.module('analyticsApp', ['gapiService', 'facebookDirective', 'higchartDirective']);

function lastNDays(n) {
  var today = new Date();
  var before = new Date();
  before.setDate(today.getDate() - n);

  var year = before.getFullYear();

  var month = before.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  var day = before.getDate();
  if (day < 10) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

Array.prototype.diff = function(a) {
  return this.filter(function(i) {
    return (a.indexOf(i) < 0);
  });
};

function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }
  return a;
}

analyticsApp.service('chartDataService', function($rootScope, $q) {

  var getData = function(newVisitorsPerDay, numberOfVisitorsPerDay, facebookUsers){

    newVisitorsPerDayReversed = newVisitorsPerDay.reverse();
    newVisitorsPerDayReversed.unshift([]);

    return {
      "title": {
        "text": "Visitors per day"
      },
      "xAxis": {
        type: 'datetime',
      },
      yAxis: {
        title: {
            text: 'Visitors'
        }
      },
      "tooltip": {},
      "plotOptions": {
        "series": {
            cursor: 'pointer',
            point: {
                events: {
                    click: function(e) {
                        var getIndexByValue = function(value, key, list){
                          for (var i = 0; i < list.length; i++) {
                            if(value === list[i][key]){
                              return i;
                            }
                          }
                        };

                        // get facebook name
                        var index = getIndexByValue(this.x, 'x', this.series.data);
                        var names = "";
                        for (var i = 0; i < newVisitorsPerDayReversed[index].length; i++) {
                          var facebook_id = newVisitorsPerDayReversed[index][i];
                          var user = facebookUsers[facebook_id];
                          names += "<img height='50' src='http://graph.facebook.com/" + user.id + "/picture'>" + user.name + "<br/> ";
                        }

                        hs.htmlExpand(null, {
                            pageOrigin: {
                                x: this.pageX,
                                y: this.pageY
                            },
                            headingText: "New users",
                            maincontentText: '<strong>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</strong><br/> ' +
                                names,
                            width: 250
                        });
                    }
                }
            }
        }
      },
      "series": [
        {
          "name": "Visitors per day",
          "data": numberOfVisitorsPerDay.reverse(),
          "pointStart": new Date().setDate(new Date().getDate() - 20), // yesterday
          "pointInterval": 24 * 3600 * 1000 // one day
        },
      ]
    };
  };

  return {
    getData: getData
  };
});

analyticsApp.controller("AppCtrl", function ($rootScope, $timeout, $scope, gapiService, chartDataService, $q) {
  console.log(" - AppCtrl ready");

  // HACK: work-around to wait for facebook promise
  $timeout(function(){
      var gapiPromise = gapiService.loadSdk();
      var facebookPromise = $rootScope.facebookPromise;

      // both facebook and google APIs are ready
      $q.all([gapiPromise, facebookPromise]).then(function(responses){

        // response from promise with gapi object

        var numberOfVisitorsPerDay = [];
        var visitorsPerDay = [];
        var newVisitorsPerDay = [];
        var uniqueVisitors = [];
        var facebookUsers = {};
        var totalDays = 80;
        var getVisitorsPerDay = function(day){
          var options = {
            'start-date': lastNDays(day + 1),
            'end-date': lastNDays(day + 1)
          };
          gapiService.getData(options).then(function(visitors){
            numberOfVisitorsPerDay.push(visitors.length);
            visitorsPerDay.push(visitors);
            uniqueVisitors = arrayUnique(uniqueVisitors.concat(visitors));

            // On every other day than the first
            if(day > 0){
              newVisitorsPerDay.push(visitorsPerDay[day - 1].diff(visitorsPerDay[day]));
            }

            // fetch next day
            if(day < totalDays - 1){
              getVisitorsPerDay(day + 1);

            // finished getting visitors from analytics
            // Map ids with facebook users
            }else{


              $.each(uniqueVisitors, function(i, visitorId){
                // get names from facebook by ID
                FB.api('/' + visitorId + '?fields=name,location,devices', function (user) {
                  facebookUsers[visitorId] = user;

                  // finished: all unqiue visitors facebook info was fetched
                  if(i === uniqueVisitors.length-1){
                    $scope.basicAreaChart = chartDataService.getData(newVisitorsPerDay, numberOfVisitorsPerDay, facebookUsers);
                    $scope.$digest();
                    console.log("Finished");
                  }
                });
              });
            }
          });
        };

        getVisitorsPerDay(0);


        // Success
        // var options = { filters: 'ga:eventCategory=~success;ga:eventLabel=~^\\d+$' };
        // gapiService.getData(options).then(function(users){
        //   console.log(users.length);
        // });

      });
  }, 0);

});