var freedomApp = angular.module('freedomApp', ['ngRoute', 'ngSanitize', 'facebookDirective', 'safeApply'])

.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
  'use strict';

  // add webcal:// and file:// to Angular's whitelist
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|webcal):/);

  $routeProvider.
    when('/home', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/renew', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/customize', {templateUrl: 'templates/customize.html', controller: 'customizeController'}).
    when('/preview', {templateUrl: 'templates/preview.html', controller: 'previewController'}).

    //
    when('/what', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/privacy', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    when('/author', {templateUrl: 'templates/page.html', controller: 'pageController'}).
    otherwise({redirectTo: '/home'});
}]);
