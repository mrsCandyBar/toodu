import Create from './todo_create.js';

class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, uuid) {

		let createObj = new Create(TodoControls, $scope, $route, uuid, Firebase);
		$scope.myObj = createObj;

		if (Firebase.userID) {
			Firebase.retrieveUserInfo().then(() => {
				$scope.user = Firebase.user;
				Firebase.retrieveTasks($rootScope, activity);
			});
		}	

		$scope.goTo = function(route) {
			_redirect($route, $location, route);
		}

		$scope.$on('userTasksUpdated', function(event, data){
			Firebase.tasks = data;
			let updateTasks = TodoControls.retrieveTodos($scope, $route, Firebase);

			$scope.$apply(function () { 
				$scope.taskList = updateTasks;
            });
        });
	}
}

function _redirect($route, $location, routeValue) {
	if ($location && routeValue) { $location.path(routeValue); }
	$route.reload();
}

module.exports = Dashboard;