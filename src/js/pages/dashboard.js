class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, Store) {

        $scope.userIsSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;
        if (!$scope.userIsSignedIn) {
            setTimeout(() => {
                $location.path('home/');
                $route.reload();
            }, 2000);

        } else {
            if (Store.user) {
                $scope.allFilters = Store.allFilters;
                $scope.allTasks = Store.allTasks;
                $scope.currentTask = Store.currentTask;
                $scope.taskFilters = Store.taskFilters;
                $scope.user = Store.user;

                if ($route.current.params.filter && ($route.current.params.filter != 'create' && $route.current.params.filter != 'welcome')) {
                    $scope.currentTask = TodoControls.retrieveSingleTodo($route.current.params.filter, $scope.allTasks);
                    Store.currentTask = $scope.currentTask;
                }

                if ($route.current.params.filter === 'create') {
                    $scope.currentTask = TodoControls.createTodo($scope.user);
                }
            }

            // Listen for user to log in
            if ($route.current.params.filter === 'welcome') {
                Firebase.retrieveUserInfo($rootScope);

            } else {
                $scope.$on('userLoggedIn', function (event) {
                    Firebase.retrieveUserInfo($rootScope);
                });
            }

            $scope.$on('userDataUpdated', function (event, userData) {

                function replaceAndBackupUserData(data) {
                    Firebase.user = data;
                    Firebase.searchFilters = {
                        filter: 'organisation',
                        value: data.organisation
                    };
                    $scope.user = Firebase.user;
                    Store.user = $scope.user;
                    console.log('user data updated!', data);
                }

                if (!Firebase.tasks) {
                    replaceAndBackupUserData(userData);
                    Firebase.retrieveTasks($rootScope, activity);

                    if ($route.current.params.filter === 'welcome') {
                        $location.path('dashboard/');
                    }

                } else {
                    if (!$scope.$$phase) {
                        $scope.$apply(function () {
                            replaceAndBackupUserData(userData);
                        });

                    } else {
                        replaceAndBackupUserData(userData);
                    }
                }
            });

            $scope.$on('updateTaskCreator', function (event, taskUpdate) {
                Firebase.notifyTaskUser(taskUpdate);
            });

            $scope.removeNote = function (note) {
                Firebase.removeNote(note, $scope.user.id);
            }


            // Listen for tasks retrieved
            $scope.$on('userTasksUpdated', function (event, data) {

                if (!Firebase.tasks) {
                    Firebase.tasks = data;

                    let taskID = 0;
                    if ($route.current.params.filter && ($route.current.params.filter != 'create' && $route.current.params.filter != 'welcome')) {
                        taskID = $route.current.params.filter;
                    }
                    let updateTasks = TodoControls.retrieveTodos($scope, Firebase, taskID);

                    $scope.$apply(function () {
                        $scope = updateTasks;

                        Store.allFilters = $scope.allFilters;
                        Store.allTasks = $scope.allTasks;
                        Store.currentTask = $scope.currentTask;
                        Store.otherUsers = $scope.otherUsers;
                        Store.taskFilters = $scope.taskFilters;
                        Store.user = $scope.user;
                    });

                } else {
                    Firebase.tasks = data;

                    function updateDOM() {
                        let taskID = 0;
                        if ($route.current.params.filter && ($route.current.params.filter != 'create' && $route.current.params.filter != 'welcome')) {
                            taskID = $route.current.params.filter;
                        }
                        let updateTasks = TodoControls.retrieveTodos($scope, Firebase, taskID);
                        $scope.allTasks = updateTasks.allTasks;
                        if ($route.current.params.filter == 'create') {
                            $scope.currentTask = Store.currentTask;
                        }

                        Store.allTasks = $scope.allTasks;
                        Store.currentTask = $scope.currentTask;
                    }

                    if (!$scope.$$phase) {
                        $scope.$apply(function () {
                            updateDOM();
                        });

                    } else {
                        updateDOM();
                        $scope.$broadcast('updateArrayEvent');
                    }
                }
            });

            $scope.$on('newTaskData', function (event, data) {
                Store.currentTask = data;
                if ($route.current.params.filter === 'create') {
                    $scope.view($scope.currentTask.id);
                }
                Firebase.updateTask(data);
            });

            $scope.$on('updateMyTasks', function (event, data) {
                Firebase.updateMyTasks(data, $scope.user.id);
            });

            $scope.$on('deleteTask', function (event, taskID) {
                Firebase.deleteTask(taskID, 'tasks');
                $scope.view('');
            });

            $scope.$on('addComment', function (event, commentData) {
                Firebase.addComment($scope.currentTask.id, commentData);
            });

            $scope.$on('notifyTaskHolders', function (event, commentData) {
                Firebase.notifyTaskHolders(commentData);
            });

            $scope.$on('addReply', function (event, replyData) {
                Firebase.addReplyAndNotifyCommenter(replyData);
            })

            $scope.view = function (taskId) {
                $location.path('dashboard/' + taskId);
            }

            $scope.logout = function () {
                Firebase.logOut().then(() => {
                    location.reload();
                });
            }
        }
	}
}

module.exports = Dashboard;