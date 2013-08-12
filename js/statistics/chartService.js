statisticsApp.service("chartService", function($rootScope, $q, $location, $route, helpers, gapiService) {

  var chart = new Chart();

  function Chart() {

    // total days from URL
    this.totalDays = parseInt(window.location.search.match(/\d+/)[0], 10);

    this.addSeries = function (customSerie) {
      // console.log("adding new series");
      var pointStart = new Date();
      pointStart.setDate(pointStart.getDate() - this.totalDays);
      pointStart.setHours(12,0,0,0);

      var serie = {
        "name": "All visitors",
        "data": [],
        "pointStart": pointStart.getTime(),
        "pointInterval": 24 * 3600 * 1000, // one day
      };

      angular.extend(serie, customSerie);

      this.data.series.push(serie);
    };

    this.data = {
      "title": {
        "text": "Daily active users"
      },
      subtitle: {
          text: 'During the last ' + this.totalDays + ' days'
      },
      "xAxis": {
        type: "datetime",
        minTickInterval: 24 * 3600 * 1000
      },
      "yAxis": {
        title: {
          text: "Visitors"
        }
      },
      "plotOptions": {
        "series": []
      },
      "series": []
    }; // end of data
  } // end of Chart object

  var getVisitorsChart = function(){
    var deferred = $q.defer();

    var numberOfVisitorsPerDay = [];
    var visitorsPerDay = [];
    var newVisitorsPerDay = [];
    var uniqueVisitors = [];
    var facebookUsers = {};

    $rootScope.$emit('setProgressMax', 'gapi', chart.totalDays);

    var runRecursive = function(day){

      gapiService.listVisitors(day).then(function(visitors){
        $rootScope.$emit('addToProgress', 'gapi');
        numberOfVisitorsPerDay.push(visitors.length);
        visitorsPerDay.push(visitors);
        uniqueVisitors = helpers.arrayUnique(uniqueVisitors.concat(visitors));

        // Add visitor diff (new visitors) for every day except the first
        var previousDay = day - 1;
        if(previousDay >= 0){
          newVisitorsPerDay.push(helpers.arrayDiff(visitorsPerDay[day], visitorsPerDay[previousDay]));
        }

        // fetch next days visitors from Analytics
        var nextDay = day + 1;
        if(nextDay < chart.totalDays){
          runRecursive(nextDay);

        // finished getting visitors from analytics
        }else{

          $rootScope.$emit('setProgressMax', 'fb', uniqueVisitors.length);

          // Get real names from Facebook
          $.each(uniqueVisitors, function(i, visitorId){
            // get names from facebook by ID
            FB.api("/" + visitorId + "?fields=name,location", function (user) {
              $rootScope.$emit('addToProgress', 'fb');
              facebookUsers[visitorId] = user;

              // finished: all unqiue visitors facebook info was fetched
              if(i === uniqueVisitors.length-1){

                // reverse arrays
                newVisitorsPerDay = newVisitorsPerDay.reverse();
                newVisitorsPerDay.unshift([]); // add new element in beginning
                numberOfVisitorsPerDay = numberOfVisitorsPerDay.reverse();

                // Add series
                chart.addSeries({
                  data: numberOfVisitorsPerDay,
                  events: {
                    // 'Click'-function for chart with popup Facebook-info
                    click: function (e) {
                      // get facebook name
                      var index = this.data.indexOf(e.point);

                      // popup template
                      var maincontentText = "";
                      for (var i = 0; i < newVisitorsPerDay[index].length; i++) {
                        var facebook_id = newVisitorsPerDay[index][i];
                        var user = facebookUsers[facebook_id];
                        maincontentText += '<div class="person">';
                        maincontentText += '<div class="profile-image"><img height="50" src="http://graph.facebook.com/' + user.id + '/picture"></div>';
                        maincontentText += '<p class="username"><a href="http://facebook.com/' + facebook_id + '" >' + user.name + '</a></p>';
                        maincontentText += '<p class="location">';
                        maincontentText += user.location ? user.location.name : '';
                        maincontentText += '</p></div>';
                      }

                      hs.htmlExpand(null, {
                        pageOrigin: {
                          x: e.pageX,
                          y: e.pageY
                        },
                        headingText: newVisitorsPerDay[index].length + " new users",
                        maincontentText: maincontentText,
                        width: 250
                      });
                    } // end of click function
                  } // end of events
                }); // end of addSeries()

                deferred.resolve(chart.data);
                $rootScope.$digest();
              }
            });
          });
        }
      });
    }; // end of runRecursive()
    runRecursive(0);

    return deferred.promise;
  };

  var getVisitorsChartByType = function(type){
    var deferred = $q.defer();
    var numberOfVisitorsPerDay = [];

    var runRecursiveFetch = function(day){
      gapiService.countVisitorsByType(day, type).then(function(numberOfVisitors){
        numberOfVisitorsPerDay.push(numberOfVisitors);

        // fetch next day
        var nextDay = day +1;
        if(nextDay < chart.totalDays){
          runRecursiveFetch(nextDay);

        // Finished
        }else{
          chart.addSeries({
            name: "Visitors with " + type,
            data: numberOfVisitorsPerDay.reverse(),
          }); // end of addSeries()

          deferred.resolve(chart.data);
        }
      });
    };
    runRecursiveFetch(0);



    return deferred.promise;
  };

  return {
    getVisitorsChart: getVisitorsChart,
    getVisitorsChartByType: getVisitorsChartByType
  };
});
