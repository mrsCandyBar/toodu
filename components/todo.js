angular
    .module('todoComponent', [])
    .directive('todo', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                view: '=model'
            },

            controller: function($scope) {
                $scope = _buildScope($scope.view, $scope);
                $scope.update = function() {
                    if ($scope.view.editable) {
                        $scope.view.update($scope.view, $scope.view.Firebase)
                    } else {
                        $scope.view.backup = JSON.stringify($scope.view.todo);
                    }
                    $scope.view.editable = !$scope.view.editable;
                }

                $scope.cancel = function() 			{
                    $scope.view.todo = JSON.parse($scope.view.backup);
                    $scope.view.editable = !$scope.view.editable;
                }

                $scope.moveTodo = function() 		{ $scope.view.moveTodo($scope.view, $scope.view.Firebase, $scope.view.$route, $scope.view.$location) }
                $scope.deleteTodo = function() 		{ $scope.view.deleteTodo($scope.view, $scope.view.Firebase) }

                // Comments
                $scope.addComment = function()		{ view.addComment($scope.view, $scope.view.Firebase) }
                $scope.replyToComment = function(commentId)	{ view.replyToComment($scope.view, commentId, $scope.view.Firebase) }
            },

            templateUrl: 'template/todo.html',
            replace: true
        }
    });


function _redirect($route, $location, routeValue) {
    if ($location && routeValue) { $location.path(routeValue); }
    $route.reload();
}