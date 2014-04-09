var freedomApp = angular.module('freedomApp', ['ngRoute', 'ngSanitize', 'facebookDirective', 'facebookService', 'safeApply'])

.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
  'use strict';

  // add webcal:// and file:// to Angular's whitelist
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);

  $routeProvider.
    when('/home', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/renew', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/customize', {templateUrl: 'templates/customize.html', controller: 'customizeCtrl'}).

    //
    when('/what', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/privacy', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    when('/author', {templateUrl: 'templates/page.html', controller: 'pageCtrl'}).
    otherwise({redirectTo: '/home'});
}]);
