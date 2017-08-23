import TodoControls from '../todo/todo_controls.js';
import TodoModel from '../todo/todo_model.js';

class Dashboard {

	init(Firebase, $rootScope, $scope, $route, $location, Store) {

        $scope.userIsSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;

        if (!$scope.userIsSignedIn) {
            setTimeout(() => {
                $location.path('home/');
                $route.reload();
            }, 2000);

        } else {

            // SETUP DATA
            function _currentRoute() {
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
            let activeRoute = _currentRoute();
            Object.keys(Store).forEach((obj) => {
                $scope[obj] = Store[obj];
            });

            // Determine if user has logged in/not
            if (Store.user) {
                _recoverCurrentTask();
            }
            else {
                Firebase.listenForEvents($rootScope);
                $scope.user = {};
                if (activeRoute === 'welcome') {
                    Firebase.retrieveUserInfo($rootScope); }
                else {
                    $scope.$on('userLoggedIn', function (event) {
                        Firebase.retrieveUserInfo($rootScope);
                    }); }
            }

            // UPDATE USER DATA
            $scope.$on('userDataUpdated', function (event, userData) {

                function replaceAndBackupUserData(data) {
                    if (($scope.user.group && $scope.user.group.length > 0) &&
                        data.group.active != $scope.user.group.active) {
                        location.reload();

                    } else {
                        Firebase.user = data;
                        Firebase.searchFilters = {
                            filter: 'group',
                            value: data.group ? data.group.active.id : data.id
                        };
                        $scope.user = Firebase.user;
                        if (data.group && data.group.list) {
                            $scope.user.group.list = _retrieveGroups(data.group && data.group.list ? data.group.list : {});
                        }
                        $scope.user.update = {
                            name: data.name,
                            description: data.description
                        }
                        Store.user = $scope.user;
                    }
                }
                if (!Firebase.tasks) {
                    replaceAndBackupUserData(userData);
                    Firebase.retrieveTasks($rootScope, $scope.user);

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
            $scope.updateUserDetails = function(user) {
                Firebase.updateUserInfo(user);
            }
            $scope.removeNote = function (note) {
                Firebase.removeNote(note);
            }
            $scope.logout = function () {
                Firebase.logOut().then(() => {
                    location.reload();
                });
            }

            // USER TASKS
            $scope.$on('newTaskData', function (event, data) {
                Store.currentTask = data;
                if (activeRoute === 'create') {
                    $scope.view($scope.currentTask.location, $scope.currentTask.id);
                }
                Firebase.updateTask(data);
            });
            $scope.$on('userTasksUpdated', function (event, data) {

                function _returnTasks(data) {
                    Firebase.tasks = _retrieveTodos(data);
                    let returnTask = { location: 'active', id: 0 };
                    if (activeRoute && activeRoute.location) {
                        returnTask = activeRoute;
                    }
                    return returnTask;
                }

                if (!Firebase.tasks) {

                    let returnTask = _returnTasks(data);
                    let updateTasks = TodoControls.retrieveTodos($scope, Firebase, returnTask);;

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

                    function updateDOM() {
                        let returnTask = _returnTasks(data);
                        $scope.allTasks = _retrieveTodos(data);
                        Store.allTasks = $scope.allTasks;

                        if (activeRoute === 'create') {
                            $scope.currentTask = TodoControls.createTodo($scope.user);
                            Store.currentTask = $scope.currentTask;
                        } else {
                            _recoverCurrentTask();
                        }
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

            // CURRENT TASK UPDATES
            $scope.$on('updateTaskActivity', function(event, data) {
                Firebase.moveTask(data);
                $scope.view(data.move.location, data.id);
            })
            $scope.$on('deleteTask', function (event, task) {
                Firebase.deleteTask(task, 'active');
                $scope.view('');
            });

            // REROUTE
            $scope.view = function (location, taskId) {
                let reRouteToPath = '' + location + '/' + taskId;
                $location.path('task/' + reRouteToPath);
            }

            // GROUP
            $scope.$on('groupsReturned', function(event, groupsReturned) {
                if ($scope.user.group && $scope.user.group.list) {
                    Object.keys(groupsReturned).forEach((group) => {
                        for (let i = 0; i < $scope.user.group.list.length; i++) {

                            if ($scope.user.group.list[i].id === groupsReturned[group].id) {
                                groupsReturned[group].joined = true;
                            }
                        }
                    });
                }

                $scope.allGroups = groupsReturned;
            });
            $scope.findGroup = function(email) {
                Firebase.retrieveGroups($rootScope, email);
            }
            $scope.sendMemberRequest = function(groupId) {
                let memberRequest = {
                    id: $scope.user.id,
                    name: $scope.user.name,
                    email: $scope.user.email,
                    group: {
                        id: groupId
                    }
                }
                Firebase.sendMemberRequest(memberRequest);
            }
            $scope.switchGroup = function(group) {
                if (group) {
                    $scope.user.hideGroup = '';
                    $scope.user.group.active = group;
                } else {
                    $scope.user.hideGroup = $scope.user.group.active;
                    $scope.user.group.active.id = $scope.user.id;

                }

                Firebase.updateUserGroup($scope.user);
                location.reload();
            }
            $scope.removeGroup = function (group) {
                let groupData = {
                    id: $scope.user.id,
                    name: $scope.user.name,
                    group: {
                        name: group.name,
                        id: group.id
                    }
                }
                Firebase.removeMember(groupData);
            }

            function _recoverCurrentTask() {
                $scope.currentTask = activeRoute.location ? TodoControls.retrieveSingleTodo(activeRoute, $scope.allTasks) : TodoControls.createTodo($scope.user);
                Store.currentTask = $scope.currentTask;
            }
        }
	}
}

module.exports = Dashboard;

function _retrieveGroups(rawObj) {
    if (rawObj && rawObj !== null && typeof rawObj === 'object') {
        let buildMap = [];

        Object.keys(rawObj).forEach((todoObj) => {
            let currentTodo = rawObj[todoObj];
            buildMap[buildMap.length] = currentTodo;
        });

        return buildMap;

    } else {
        return []; }
}
function _retrieveTodos(rawObj) {
    if (rawObj && rawObj !== null && typeof rawObj === 'object') {
        let buildMap = [];

        Object.keys(rawObj).forEach((state) => {
            buildMap[buildMap.length] = {
                name: state, // States will always be : active|hold|complete
                tasks: []
            };

            let stateMap = buildMap[buildMap.length - 1];
            Object.keys(rawObj[state]).forEach((task) => {
                let currentTodo = rawObj[state][task];
                let buildTask = stateMap['tasks'];

                buildTask[buildTask.length] = new TodoModel(currentTodo);
            })
        });

        return buildMap;

    } else {
        return [];
    }
}