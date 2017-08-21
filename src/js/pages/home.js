
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

            if ($scope.hasAccount) {
                Firebase.logIn($rootScope, $scope.user).then(
                    (response) => { _redirectToDashboard($route, $location);
                    }, (error) => {
                        $scope.$apply(function () { $scope.error = 'Sorry, login failed. Try again'; });
                    });

            } else {
                Firebase.create($rootScope, $scope.user).then(
                    (response) => { _redirectToDashboard($route, $location);
                    }, (error) => {
                        $scope.$apply(function () { $scope.error = error; });
                    });
            }
        }

        function _redirectToDashboard($route, $location) {
            $location.path('dashboard/welcome')
            $route.reload();
        }
	}
}

module.exports = Home;