
class Home {

	init(Firebase, $rootScope, $scope, $location, $route) {
        $scope.isSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;
        $scope.hasAccount = false;
        $scope.error;
        $scope.action;

        if ($scope.isSignedIn) {
            _redirectToDashboard($route, $location);
        }

        $scope.$watch('hasAccount',function() 	{
            let loginText = {
                true: 'login',
                false: 'create my account',
                createGroup: 'create group'
            };
            $scope.action = loginText[$scope.hasAccount];
		}, true);

        $scope.login = function() {

            if ($scope.hasAccount === true) {
                Firebase.logIn($rootScope, $scope.user).then(
                    (response) => {
                        _redirectToDashboard($route, $location);
                    }, (error) => {
                        $scope.$apply(function () { $scope.error = 'Sorry, login failed. Try again'; });
                    });

            } else {
                console.log('account >>>', $scope.hasAccount);
                if ($scope.hasAccount === false) {
                    Firebase.createUser($rootScope, $scope.user).then(
                        (response) => {
                            _redirectToDashboard($route, $location);
                        }, (error) => {
                            $scope.$apply(function () {
                                $scope.error = error;
                            });
                        });
                } else {
                    console.log('account >>> yes', $scope.hasAccount);
                    Firebase.createGroup($rootScope, $scope.user).then(
                        (response) => {
                            $location.path('group');
                            $route.reload();

                        }, (error) => {
                            $scope.$apply(function () {
                                $scope.error = error;
                            });
                        });
                }
            }
        }

        function _redirectToDashboard($route, $location) {
            $location.path('dashboard/welcome')
            $route.reload();
        }
	}
}

module.exports = Home;