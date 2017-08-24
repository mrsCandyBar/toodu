import TodoControls from '../todo/todo_controls.js';
import TodoModel from '../todo/todo_model.js';
import UserModel from '../user_model';

class Group {

    init(Firebase, $rootScope, $scope, $route, $location, Store) {

        $scope.userIsSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;

        if (!$scope.userIsSignedIn) {
            setTimeout(() => {
                $location.path('home/');
                $route.reload();
            }, 2000);

        } else {

            $scope.$on('userLoggedIn', function (event, user) {
                Firebase.listenForEvents($rootScope);
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

                // Retrieve group info and tasks
                Firebase.retrieveGroupInfo($rootScope);
                $scope.$on('groupDataUpdated', function (event, userData) {
                    function _replaceAndBackupUserData(data) {
                        $scope.user = new UserModel(data);
                        $scope.user.location = 'groups';
                    }

                    if (!Firebase.tasks) {
                        _replaceAndBackupUserData(userData);
                        Firebase.retrieveTasks($rootScope, $scope.user);

                    } else {
                        if (!$scope.$$phase) {
                            $scope.$apply(function () {
                                _replaceAndBackupUserData(userData); });

                        } else {
                            _replaceAndBackupUserData(userData); }
                    }
                });
                $scope.$on('logout', function(event, data) {
                    Firebase.logOut().then(() => {
                        location.reload();
                    });
                })

                // Listen for task updates
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
                            Object.keys(Store).forEach((obj) => {
                                Store[obj] = $scope[obj];
                            });
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
                $scope.memberRequest = function(request, member) {
                    let messageText = {
                        accept: "Welcome to " + $scope.user.name,
                        decline: "Sorry, your request to " + $scope.user.name + " has been declined.",
                        remove: "You have been removed from " + $scope.user.name + "."
                    };

                    let groupData = {
                        id: $scope.user.id,
                        name: $scope.user.name,
                        status: request,
                        member: member,
                        notify: {
                            id: new Date().getTime(),
                            from: $scope.user.id,
                            name: $scope.user.name,
                            message: messageText[request],
                            for: [member.id],
                            task: {
                                title: $scope.user.name,
                                id: $scope.user.id,
                                location: 'groups',
                                group: $scope.user.name
                            }
                        }
                    }

                    Firebase.memberRequest(groupData);
                }

            });
        }
    }
}

module.exports = Group;

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
        return []; }
}