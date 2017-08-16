
class Home {

	constructor() {
		this.isSignedIn = window.sessionStorage.password && window.sessionStorage.email ? true : false;
		this.hasAccount = false;
		this.error;
		this.action = 'create my account';
	}

	toggleAction($scope) {
		$scope.action = $scope.hasAccount === true ? 'login' : 'create my account';
	}

	submit(Firebase, $route, $location, $scope, $rootScope) {
		if ($scope.hasAccount) {
			Firebase.logIn($rootScope, $scope.user).then(
				(response) => {
                    this._redirectToDashboard($route, $location);

				}, (error) => {
					$scope.$apply(function () { 
						$scope.error = 'Sorry, login failed. Try again';
					});
				});

		} else {
			Firebase.create($scope.user).then(
				(response) => {
					this._redirectToDashboard($route, $location);

				}, (error) => {
					$scope.$apply(function () { 
						$scope.error = error;
					});
				})
		}
	}

	_redirectToDashboard($route, $location) {
		console.log('YAY!!!!');
        $location.path('dashboard/welcome')
        $route.reload();
	}
}

module.exports = Home;