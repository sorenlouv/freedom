freedomApp.controller("customizeCtrl", function($scope, $rootScope, $http, $location, safeApply, facebookService) {
  facebookService.login([], function(){
    // open a dialog
    $scope.openDialog = function(dialog) {
      $('#' + dialog).dialog("open");
    };

    // get data
    $http.get('/users/settings').success(function(data, status) {
      safeApply($scope, function(){
        $scope.data = data;
      });
    });
  });
});

// jQuery UI dialog
freedomApp.directive('dialog', function() {
  return {
    restrict: 'E',
    scope: {
      emptySelectedFriends: '@'
    },
    templateUrl: 'js/freedom/partials/directive-dialog.html',
    // transclude: true,
    controller: function($scope, $element, $attrs, $q) {

      // defaults for scope
      $scope.facebookFriends = [];
      $scope.selectedFacebookFriends = []; // Todo get from backend
      $scope.autocompleteDataLoading = true;

      var dialogDeferred = $q.defer();
      $scope.dialogOpened = dialogDeferred.promise;

      // jqueryui Dialog
      $element.dialog({
        autoOpen: false,
        modal: true,
        draggable: false,
        minWidth: 600,
        minHeight: 900,
        position: { at: "top" },

        // Resolve promise when dialog is opened
        open: function( event, ui ) {
          dialogDeferred.resolve();
        },

        // save on close
        close: function(){
          var data = {
            selectedFriends: $scope.selectedFacebookFriends
          };
          $.ajax({
              url: '/users/settings',
              type: 'POST',
              data: JSON.stringify(data),
              contentType: 'application/json; charset=utf-8',
              dataType: 'json',
              success: function(msg) {
                console.log("saved");
              }
          });
        }
      });

      // Method used in template to get a list of friends who have been selected by the user
      $scope.getSelectedFacebookFriends = function(){
        return $scope.selectedFacebookFriends.map(function(selectedFriendId){
          return $scope.facebookFriends.filter(function(friend){
            return selectedFriendId === friend.id;
          })[0];
        });
      };

      // remove friend from selection
      $scope.removeSelectedFacebookFriend = function(elm){
        var indexOfFriend = $scope.selectedFacebookFriends.indexOf(this.friend.id);
        $scope.selectedFacebookFriends.splice( indexOfFriend, 1 );
      };
    },
    // link: function(scope, element, attrs, ctrl) {}
  };
});

// TODO: duplicate method
var removeDuplicates = function(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
    for(var j=i+1; j<a.length; ++j) {
      if(a[i] === a[j])
        a.splice(j--, 1);
      }
  }
  return a;
};

// jQuery UI Autocompleter directive
freedomApp.directive('autoComplete', function(safeApply) {

  return {
    controller: function($scope, $element, $attrs, $http, $rootScope, $q, facebookService) {

      // Filter out selected firends
      var removeSelectedFriends = function(friendList) {
        return friendList.filter(function(friend, key){
          if($scope.selectedFacebookFriends.indexOf(friend.id) === -1){
            return true;
          }
        });
      };

      var parseFacebookFormat = function(objects, type){
        return objects.map(function(obj){
          var picture_url = obj.picture ? obj.picture.data.url : '/img/default-profile-image.png';
          return {
            label: obj.name,
            id: obj.id,
            picture_url: picture_url,
            type: type
          };
        });
      };

      var getMembersFromFriendlist = function(friendlistId, callback){
        // get members (friends) from friendlists
        facebookService.api(['read_friendlists'], friendlistId + '?fields=members', function(response) {
          var friendlistMembers = parseFacebookFormat(response.members.data, 'friend').map(function(friend){
            return friend.id;
          });

          callback(friendlistMembers);
        });
      };

      // FB ready and dialog opened
      $q.all([$scope.dialogOpened, $rootScope.facebookReady]).then(function(results) {

        // Get friends, groups and friendlists from facebook
        facebookService.api(
        ['user_friends', 'user_groups', 'read_friendlists'],
        'me?fields=friends.fields(name,id,picture.type(square).width(100).height(100)),friendlists',
        function(response) {

          safeApply($scope, function(){
            $scope.autocompleteDataLoading = false;
            $scope.facebookFriends = response.friends.data;
          });

          // Set source for autocompleter with a result limit
          var setSource = function(request, jqueryResponse) {
            var friends = parseFacebookFormat(removeSelectedFriends(response.friends.data), 'friend');
            var friendlists = parseFacebookFormat(response.friendlists.data, 'friendlist');
            var source = friends.concat(friendlists);
            var results = $.ui.autocomplete.filter(source, request.term);

            // limit resultset to 10
            jqueryResponse(results.slice(0, 10));
          };

          // bind autocompleter
          $element.autocomplete({
            source: setSource,
            select: function(event, ui) {

              if(ui.item.type === "friend"){
                var friendId = ui.item.id;
                $scope.selectedFacebookFriends.push(friendId);

                // update source
                $(this).autocomplete("option", "source", setSource);
              }else if(ui.item.type === "friendlist"){
                $scope.autocompleteDataLoading = true;

                var friendlistId = ui.item.id;
                getMembersFromFriendlist(friendlistId, function(friendlistMembers){
                  safeApply($scope, function(){
                    $scope.autocompleteDataLoading = false;

                    // add friendlist to selected friends - remove duplicates
                    $scope.selectedFacebookFriends = removeDuplicates($scope.selectedFacebookFriends.concat(friendlistMembers));

                    // update source
                    $(this).autocomplete("option", "source", setSource);
                  });
                });
              }

              $scope.$digest();

              // clear input and avoid it being set again
              $(this).val('');
              event.preventDefault();
            }
          })
          // custom display
          .data( "ui-autocomplete" )._renderItem = function( ul, item ) {
            return $( '<li>' )
              .append( '<a><div class="picture"><img src="' + item.picture_url + '"></div><div class="name">' + item.label + '</div></a>' )
              .appendTo( ul );
          };
        });
      });

      // $http.get('settings.php').success(function(data, status){
      //   $scope.data = data;
      // });
    }
  };
});

// boolean form switch (yes/no)
freedomApp.directive('formSwitch', function() {
  return {
    scope: {
      modelField: '=',
      title: '@',
      name: '@'
    },
    templateUrl: 'js/freedom/partials/directive-form-switch.html',
    transclude: true,
    // replace: true,
    restrict: 'E',
    link: function(scope, element, attrs, ctrl) {
      element.find('input').bind('click', function() {
        $.post("/users/settings", $('.customize form').serialize(), function() {
          console.log("saved");
        });
      });
    }
  };
});

// Ajax loading button
freedomApp.directive("ajaxLoading", function() {
  return {
    restrict: "A",
    scope: {
      successText: "@",
      loadingText: "@",
      ajaxLoading: "&" // invoke expression on parent scope
    },
    link: function(scope, elm) {

      scope.finished = false;

      scope.startSpinner = function() {
        elm.addClass('loading');
        elm.text(scope.loadingText);
        elm.attr("disabled", "disabled");


        scope.ajaxLoading()(function() {
          elm.text(scope.successText);
          elm.removeClass('loading');
          elm.addClass('success');
          elm.removeAttr("disabled");
          scope.$digest();
        });
      };

      elm.bind('click', scope.startSpinner);
    }
  };
});