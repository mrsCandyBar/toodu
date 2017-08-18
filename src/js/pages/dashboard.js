import TodoControls from '../todo/todo_controls.js';

class Dashboard {

	init(Firebase, $rootScope, $scope, $route, $location, activity, Store) {

        $scope.userIsSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;

        if (!$scope.userIsSignedIn) {
            setTimeout(() => {
                $location.path('home/');
                $route.reload();
            }, 2000);

        } else {

            function currentRoute() {
                let route = 'dashboard';
                if ($route.current.params.id) {
                    route = {
                        location: $route.current.params.filter,
                        id: $route.current.params.id
                    };
                }
                else if ($route.current.params.filter) {
                    route = $route.current.params.filter;
                }
                return route;
            }
            let activeRoute = currentRoute();
            $scope.allFilters = Store.allFilters;
            $scope.allTasks = Store.allTasks;
            $scope.currentTask = Store.currentTask;
            $scope.taskFilters = Store.taskFilters;
            $scope.user = Store.user ? Store.user : {};

            if (Store.user) {
                if (activeRoute && activeRoute.location) {
                    $scope.currentTask = TodoControls.retrieveSingleTodo(activeRoute, $scope.allTasks);
                    Store.currentTask = $scope.currentTask;
                } else {
                    $scope.currentTask = TodoControls.createTodo($scope.user);
                }
            }

            // Listen for user to log in
            if (!Store.user) {
                if (activeRoute === 'welcome') {
                    Firebase.retrieveUserInfo($rootScope);

                } else {
                    $scope.$on('userLoggedIn', function (event) {
                        Firebase.retrieveUserInfo($rootScope);
                    });
                }
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
                }

                if (!Firebase.tasks) {
                    replaceAndBackupUserData(userData);
                    Firebase.retrieveTasks($rootScope);

                    if (activeRoute === 'welcome') {
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

            $scope.removeNote = function (note) {
                Firebase.removeNote(note);
            }


            // Listen for tasks retrieved
            $scope.$on('userTasksUpdated', function (event, data) {

                function _returnTasks(data) {
                    Firebase.tasks = data;
                    let returnTask = { location: 'active', id: 0 };
                    if (activeRoute && activeRoute.location) {
                        returnTask = activeRoute;
                    }
                    return TodoControls.retrieveTodos($scope, Firebase, returnTask);
                }

                if (!Firebase.tasks) {

                    let updateTasks = _returnTasks(data);

                    $scope.$apply(function () {
                        $scope = updateTasks;
                        Store.allFilters = $scope.allFilters;
                        Store.allTasks = $scope.allTasks;
                        Store.currentTask = $scope.currentTask;
                        Store.otherUsers = $scope.otherUsers;
                        Store.taskFilters = $scope.taskFilters;
                        Store.user = $scope.user;

                        console.log('updateTasks >>> test', $scope.allTasks);
                    });

                } else {

                    function updateDOM() {
                        let updateTasks = _returnTasks(data)
                        $scope.allTasks = updateTasks.allTasks;
                        if (activeRoute === 'create') {
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
                if (activeRoute === 'create') {
                    $scope.view($scope.currentTask.location, $scope.currentTask.id);
                }
                Firebase.updateTask(data);
            });

            $scope.$on('updateMyTasks', function (event, data) {
                Firebase.updateMyTasks(data, $scope.user.id);
            });

            $scope.$on('updateTaskLocationChange', function (event, data) {
                Firebase.updateTaskHoldersOfLocationChange(data);
            })

            $scope.$on('updateTaskActivity', function(event, data) {
                Firebase.moveTask(data);
            })

            $scope.$on('deleteTask', function (event, task) {
                Firebase.deleteTask(task, 'active');
                $scope.view('');
            });

            $scope.$on('notifyTaskHolders', function (event, commentData)   { Firebase.sendUserNotification(commentData); });
            $scope.$on('addComment', function (event, commentData)          { Firebase.addComment(commentData); });
            $scope.$on('addReply', function (event, replyData)              { Firebase.addReplyAndNotifyCommenter(replyData); });

            $scope.view = function (location, taskId) {
                let reRouteToPath = '' + location + '/' + taskId;
                $location.path('task/' + reRouteToPath);
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