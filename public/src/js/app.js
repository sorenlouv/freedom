var freedomApp = angular.module('freedomApp', ['ngRoute', 'facebookDirective', 'safeApply', 'facebookService'])

.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
  'use strict';

  // add webcal:// and file:// to Angular's whitelist
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);

  $routeProvider.
    when('/home', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/what', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/privacy', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/author', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/facebook', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    otherwise({redirectTo: '/home'});
}]);
