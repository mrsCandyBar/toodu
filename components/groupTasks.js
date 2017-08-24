angular
    .module('groupTasksComponent', [])
    .directive('grouptasks', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                allTasks: '=tasks',
                user: '=member',
            },

            controller: function($scope) {

                /*$scope.$watch('allTasks', function() {
                   console.log('test', this.allTasks);
                });*/

                $scope.view = function(location, id) {
                    let task = {
                        location,
                        id
                    }
                    $scope.$emit('updateTaskPane', task);
                }
            },

            templateUrl: 'template/groupTasks.html',
            replace: true
        }
    });