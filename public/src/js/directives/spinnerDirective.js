freedomApp.directive('spinner', [function() {
  'use strict';
  return {
    scope: {
      isLoading: '='
    },
    restrict: 'C',
    template: '<div class="inner"></div>',
    transclude: true,
    replace: false,
    link: function($scope, $element, $attrs) {

      $scope.$watch('isLoading', function(isLoading){
        if(isLoading === undefined) return;

        if(isLoading === true){
          $element.addClass('loading');
        }else if(isLoading === false){
          $element.removeClass('loading');
        }
      });
    }
  };
}]);
