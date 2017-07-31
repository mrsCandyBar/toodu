
class Create {

	constructor(TodoControls, $scope, $route, uuid, Firebase) {
		this.todo 		= TodoControls.createTodo($route, uuid, Firebase.user);
		this.todoStates = TodoControls.retrieveTodoStates();
		this.allUsers 	= Firebase.allUsers;
		this.init(Firebase, $route);
	}

	init(Firebase, $route) {
		Firebase.retrieveUsers().then((response) => {
			_redirect($route);

		}, (reject) => {
			console.log('user data not changed', reject);
		});
	}
	
	submit($scope, Firebase) {
		if ($scope.todo.user) {
			let user = JSON.parse($scope.todo.user);
			$scope.todo.username = user['name'];
			$scope.todo.user = user['id'];
			console.log('todo >>>', $scope.todo);
		    Firebase.updateTask($scope.todo);
		    history.back();
		    
		} else {
			alert('Please select a user');
		}
	}
}

function _redirect($route, $location, routeValue) {
	if ($location && routeValue) { $location.path(routeValue); }
	$route.reload();
}

module.exports = Create;