angular.module('helpers', [])
.service('helpers', function($rootScope, $q) {

  // calculate date x days ago
  var lastNDays = function(n) {
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
  };

  var arrayDiff = function(a, b) {
    return b.filter(function(i) {
      return (a.indexOf(i) < 0);
    });
  };

  // TODO: Duplicate method
  var arrayUnique = function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
  };

  return {
    lastNDays: lastNDays,
    arrayDiff: arrayDiff,
    arrayUnique: arrayUnique
  }
});