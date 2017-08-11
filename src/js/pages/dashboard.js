class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, uuid, Store) {

        if (Store.user) {
            $scope.allFilters = Store.allFilters;
            $scope.allTasks = Store.allTasks;
            $scope.newTask = Store.newTask;
            $scope.taskStates = Store.taskStates;
            $scope.user = Store.user;
            $scope.taskStates.users = Store.otherUsers;
        }

		// Listen for user to log in
        $scope.$on('userLoggedIn', function(event){

            // Get user info
			Firebase.retrieveUserInfo().then(() => {
				$scope.user = Firebase.user;
				if ($scope.user.admin) {
                    $scope.otherUsers = Firebase.allUsers;
                }

                // Retrieve tasks
				Firebase.retrieveTasks($rootScope, activity);
			});
        });

        // Listen for tasks retrieved
        $scope.$on('userTasksUpdated', function(event, data){

            if (!Firebase.tasks) {

                Firebase.tasks = data;
                let updateTasks = TodoControls.retrieveTodos($scope,Firebase, uuid);

                console.log('Apply! >>>', data);
                $scope.$apply(function () {
                    $scope = updateTasks;
                    $scope.taskStates.users = $scope.otherUsers;
                    Store.allFilters = $scope.allFilters;
                    Store.allTasks = $scope.allTasks;
                    Store.newTask = $scope.newTask;
                    Store.taskStates = $scope.taskStates;
                    Store.user = $scope.user;
                    Store.otherUsers = $scope.otherUsers;
                });

            } else {
                Firebase.tasks = data;

                function updateDOM() {
                    let updateTasks = TodoControls.retrieveTodos($scope,Firebase, uuid);
                    $scope.allTasks = updateTasks.allTasks;
                    $scope.newTask = Store.newTask;
                    $scope.taskStates = Store.taskStates;
                }

                if(!$scope.$$phase) {
                    $scope.$apply(function() {
                        updateDOM();
                    });

                } else {
                    updateDOM();
                    $scope.$broadcast('updateArrayEvent');
                }
            }
        });

        $scope.$on('testMessage', function(event, data) {
            let updateTask = TodoControls.update(data, Firebase);
            Store.newTask = updateTask;

            if (updateTask == 'Please select a user') {
                alert(updateTask);
            } else {
                Firebase.updateTask(updateTask);
            }
        });

        $scope.view = function(taskId) {
            $location.path('overview/' + taskId);
        }
	}
}

module.exports = Dashboard;