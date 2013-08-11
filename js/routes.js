freedomApp.config(function ($routeProvider) {
    $routeProvider.
        when('/about', {templateUrl: 'partials/about.html', controller: 'AboutCtrl'}).
        when('/experiments', {templateUrl: 'partials/experiments.html', controller: 'ExperimentsCtrl'}).
        when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'}).
        otherwise({redirectTo: '/home'});
});