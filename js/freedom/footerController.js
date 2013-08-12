freedomApp.controller("footerCtrl", function ($scope, $location) {
  $scope.isActive = function(path) {
    return $location.path().substr(1) === path;
  };

  $scope.menuItems =[
    {
      "label": "What",
      "symbol": "?",
      "link": "what"
    },
    {
      "label": "Privacy",
      "symbol": "!",
      "link": "privacy"
    },
    {
      "label": "Author",
      "symbol": "@",
      "link": "author"
    },
    {
      "label": "Facebook",
      "symbol": "#",
      "link": "facebook"
    }];
});