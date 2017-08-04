import Todo from './todo.js';
import Create from './todo_create.js';

class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, uuid) {

		$scope.newTask = [];
        $scope.viewTodo = [];

        if (Firebase.userID) {
			Firebase.retrieveUserInfo().then(() => {
				$scope.user = Firebase.user;
				Firebase.retrieveTasks($rootScope, activity);

                let createObj = new Create(TodoControls, $scope, $route, uuid, Firebase);
                $scope.newTask = createObj;
			});
		}	

		$scope.goTo = function(route) {
			_redirect($route, $location, route);
		}

		$scope.$on('userTasksUpdated', function(event, data){
			Firebase.tasks = data;

			let updateTasks = TodoControls.retrieveTodos($scope, $route, Firebase);
			let viewTodoObject = new Todo($scope, $route, Firebase, TodoControls);


			$scope.$apply(function () { 
				$scope.taskList = updateTasks;
				$scope.viewTodo = viewTodoObject;
                $scope.newTask = createObj;
            });
        });
	}
}

function _redirect($route, $location, routeValue) {
	if ($location && routeValue) { $location.path(routeValue); }
	$route.reload();
}

module.exports = Dashboard;