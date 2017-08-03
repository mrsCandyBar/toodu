
class Create {

	constructor(TodoControls, $scope, $route, uuid, Firebase) {
		this.todo 		= TodoControls.createTodo(uuid, Firebase.user);
		this.todoStates = TodoControls.retrieveTodoStates();
		this.allUsers 	= Firebase.allUsers;
		this.Firebase 	= Firebase;
		this.uuidGen 	= uuid;
		this.init(Firebase, $scope, $route);
	}

	init(Firebase, $scope, $route) {
		Firebase.retrieveUsers().then((response) => {
          	$scope.allUsers = response;
            _redirect($route);

		}, (reject) => {
			console.log('user data not changed', reject);
		});
	}
	
	submit($scope) {
		let newTask = JSON.stringify($scope.todo);

        if ($scope.todo.user) {
            newTask = JSON.parse(newTask);
			let user = $scope.todo.user;
            newTask.username = user['name'];
            newTask.user = user['id'];

			let UUID = this.uuidGen.v4();
            newTask.id = UUID;
		    this.Firebase.updateTask(newTask);

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