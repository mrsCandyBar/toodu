class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, uuid, Store) {

        if (Store.user) {
            $scope.allFilters = Store.allFilters;
            $scope.allTasks = Store.allTasks;
            $scope.currentTask = Store.currentTask;
            $scope.taskFilters = Store.taskFilters;
            $scope.user = Store.user;
            $scope.taskFilters.users = Store.otherUsers;

            if ($route.current.params.filter) {
                console.log('page reload?');
                $scope.currentTask = TodoControls.retrieveSingleTodo($route.current.params.filter, $scope.allTasks);
            }
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

                console.log('Apply! >>>', updateTasks);
                $scope.$apply(function () {
                    $scope = updateTasks;
                    $scope.taskFilters.users = $scope.otherUsers;

                    Store.allFilters = $scope.allFilters;
                    Store.allTasks = $scope.allTasks;
                    Store.currentTask = $scope.currentTask;
                    Store.taskFilters = $scope.taskFilters;
                    Store.user = $scope.user;
                    Store.otherUsers = $scope.otherUsers;
                });

            } else {
                Firebase.tasks = data;

                function updateDOM() {
                    let updateTasks = TodoControls.retrieveTodos($scope,Firebase, uuid);
                    $scope.allTasks = updateTasks.allTasks;
                    $scope.currentTask = Store.currentTask;
                    $scope.taskFilters = Store.taskFilters;
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

        $scope.$on('newTaskData', function(event, data) {
            let updateTask = TodoControls.update(data, Firebase);
            Store.currentTask = updateTask;

            if (updateTask == 'Please select a user') {
                alert(updateTask);
            } else {
                Firebase.updateTask(updateTask);
            }
        });

        $scope.view = function(taskId) {
            $location.path('dashboard/' + taskId);
        }
	}
}

module.exports = Dashboard;