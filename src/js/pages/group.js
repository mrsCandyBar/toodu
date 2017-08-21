
class Group {

    init(Firebase, $rootScope, $scope, $route, $location, activity, Store) {

        $scope.userIsSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;

        if (!$scope.userIsSignedIn) {
            setTimeout(() => {
                $location.path('home/');
                $route.reload();
            }, 2000);

        } else {

            $scope.$on('userLoggedIn', function (event, user) {

                // Retrieve group info and tasks
                Firebase.retrieveGroupInfo($rootScope);
                $scope.$on('groupDataUpdated', function (event, userData) {
                    function _replaceAndBackupUserData(data) {
                        $scope.user = data;
                    }

                    if (!Firebase.tasks) {
                        _replaceAndBackupUserData(userData);
                        Firebase.retrieveTasks($rootScope, $scope.user);

                    } else {
                        if (!$scope.$$phase) {
                            $scope.$apply(function () {
                                _replaceAndBackupUserData(userData);
                            });

                        } else {
                            _replaceAndBackupUserData(userData);
                        }
                    }
                });

                // Listen for task updates
                $scope.$on('userTasksUpdated', function (event, data) {
                    function _returnTasks(data) {
                        Firebase.tasks = data;
                        $scope.tasks = Firebase.tasks;
                    }

                    if (!Firebase.tasks) {
                        $scope.$apply(function () {
                            _returnTasks(data);
                        });

                    } else {
                        function updateDOM() {
                            _returnTasks(data);
                        }

                        if (!$scope.$$phase) {
                            $scope.$apply(function () {
                                updateDOM();
                            });

                        } else {
                            updateDOM();
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

                $scope.logout = function () {
                    Firebase.logOut().then(() => {
                        location.reload();
                    });
                }

            });
        }
    }
}

module.exports = Group;