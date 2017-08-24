angular
    .module('userComponent', [])
    .directive('user', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                user: '=model'
            },

            controller: function($scope) {
                $scope.updateUserDetails = function(user)   { $scope.$emit('updateUserInfo', user); };
                $scope.removeNote = function(note)          { $scope.$emit('removeNote', note); };
                $scope.logout = function()                  { $scope.$emit('logout', $scope.user); };
            },

            templateUrl: 'template/user.html',
            replace: true
        }
    });