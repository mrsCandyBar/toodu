angular
    .module('todoComponent', [])
    .directive('todo', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                task: '=model',
                filter: '=filters',
                user: '=member'
            },

            controller: function($scope) {

                $scope.$watch('task.editable', function() {
                   if ($scope.task && $scope.task.editable) {
                       let unalteredTask = JSON.stringify($scope.task);
                       $scope.backup = unalteredTask;
                   }
                });

                $scope.cancel = function() {
                    $scope.task = JSON.parse($scope.backup);

                    if ($scope.task && ($scope.task.id != 0)) {
                        $scope.task.editable = false;
                    }
                }

                $scope.submit = function(type) {
                    if (type === 'newTask') {
                        $scope.task.id = 0;
                    }
                    $scope.task.editable = false;
                    $scope.$emit('newTaskData', $scope.task);
                }

                $scope.addComment = function()		{ task.addComment($scope, $scope.Firebase) }


                $scope.moveTodo = function() 		{ $scope.moveTodo($scope, $scope.Firebase, $scope.$route, $scope.$location) }
                $scope.deleteTodo = function() 		{ $scope.deleteTodo($scope.view, $scope.view.Firebase) }

                // Comments

                $scope.replyToComment = function(commentId)	{ view.replyToComment($scope, commentId, $scope.Firebase) }
            },

            templateUrl: 'template/todo.html',
            replace: true
        }
    });


function _redirect($route, $location, routeValue) {
    if ($location && routeValue) { $location.path(routeValue); }
    $route.reload();
}