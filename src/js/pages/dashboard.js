class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, uuid, Store) {

        if (Store.user) {
            $scope.allFilters = Store.allFilters;
            $scope.allTasks = Store.allTasks;
            $scope.currentTask = Store.currentTask;
            $scope.taskFilters = Store.taskFilters;
            $scope.user = Store.user;
            $scope.taskFilters.users = Store.otherUsers;

            if ($route.current.params.filter && ($route.current.params.filter != 'create')) {
                console.log('page reload?');
                $scope.currentTask = TodoControls.retrieveSingleTodo($route.current.params.filter, $scope.allTasks);
                Store.currentTask.user = findUser(Store.otherUsers, Store.currentTask.userid);
                $scope.currentTask = Store.currentTask.user;
            }

            if ($route.current.params.filter != 'create') {
                $scope.currentTask = TodoControls.createTodo($scope.user);
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

                let taskID = 0;
                if ($route.current.params.filter && ($route.current.params.filter != 'create')) {
                    taskID = $route.current.params.filter;
                }
                let updateTasks = TodoControls.retrieveTodos($scope,Firebase, uuid, taskID);

                console.log('Apply! >>>', Firebase.tasks, updateTasks);

                $scope.$apply(function () {
                    $scope = updateTasks;
                    $scope.taskFilters.users = $scope.otherUsers;

                    Store.allFilters = $scope.allFilters;
                    Store.allTasks = $scope.allTasks;
                    Store.currentTask = $scope.currentTask;
                    Store.taskFilters = $scope.taskFilters;
                    Store.user = $scope.user;
                    Store.otherUsers = $scope.otherUsers;

                    if ($route.current.params.filter && ($route.current.params.filter != 'create')) {
                        Store.currentTask.user = findUser(Store.otherUsers, Store.currentTask.userid);
                    }
                });

            } else {
                Firebase.tasks = data;

                function updateDOM() {
                    let taskID = 0;
                    if ($route.current.params.filter && ($route.current.params.filter != 'create')) {
                        taskID = $route.current.params.filter;
                    }
                    let updateTasks = TodoControls.retrieveTodos($scope,Firebase, uuid, taskID);
                    $scope.allTasks = updateTasks.allTasks;
                    if ($route.current.params.filter == 'create') {
                        $scope.currentTask = Store.currentTask;
                    }

                    Store.allTasks = $scope.allTasks;
                    Store.currentTask = $scope.currentTask;
                    if ($route.current.params.filter && ($route.current.params.filter != 'create')) {
                        Store.currentTask.user = findUser(Store.otherUsers, Store.currentTask.userid);
                    }
                }

                if(!$scope.$$phase) {
                    $scope.$apply(function() {
                        console.log('new data!! >>> non phase', Store);
                        updateDOM();
                    });

                } else {
                    updateDOM();
                    console.log('new data! >>>', Store);
                    $scope.$broadcast('updateArrayEvent');
                }
            }
        });

        $scope.$on('newTaskData', function(event, data) {
            let updateTask = TodoControls.update(data, $route.current.params.filter);
            Store.currentTask = updateTask;

            if (updateTask == 'Please select a user') {
                alert(updateTask);
            } else {
                console.log('new data >>>', updateTask);
                Firebase.updateTask(updateTask);
            }
        });

        $scope.$on('addComment', function(event, commentData) {
            Firebase.addComment($scope.currentTask.id, commentData);
        });

        $scope.view = function(taskId) {
            $location.path('dashboard/' + taskId);
        }
	}
}

function findUser(allUsers, userID) {
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i]['id'] === userID) {
            return allUsers[i];
        }
    }

    return 'Select a User';
}

module.exports = Dashboard;