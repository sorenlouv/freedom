var freedomApp = angular.module('freedomApp', ['facebookDirective', 'safeApply']);

// add URL protocols to Angular's whitelist
freedomApp.config(function($compileProvider){
  $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);
});

freedomApp.config(function ($routeProvider) {
    $routeProvider.
        when('/what', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/privacy', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/author', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/facebook', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        otherwise({redirectTo: '/home'});
});