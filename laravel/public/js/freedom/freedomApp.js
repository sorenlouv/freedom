var freedomApp = angular.module('freedomApp', ['facebookDirective', 'safeApply', 'facebookService']);

// add URL protocols to Angular's whitelist
freedomApp.config(function($compileProvider){
  $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);
});

freedomApp.config(function ($routeProvider) {
    $routeProvider.
        when('/home', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/what', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/privacy', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/author', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/facebook', {templateUrl: 'js/freedom/partials/page.html', controller: 'pageCtrl'}).
        when('/customize', {templateUrl: 'js/freedom/partials/customize.html', controller: 'customizeCtrl'}).
        otherwise({redirectTo: '/home'});
});