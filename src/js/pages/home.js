
class Home {

	constructor() {
		this.isSignedIn 	= window.sessionStorage.password && window.sessionStorage.email ? true : false;
		this.hasAccount 	= false;
		this.user = {
			admin : false
		};
		this.error;
		this.action 		= 'create my account';
	}

	toggleAction($scope) {
		$scope.action = $scope.hasAccount === true ? 'login' : 'create my account';
	}

	submit(Firebase, $route, $location, $scope) {
		if ($scope.hasAccount) {
			Firebase.logIn($scope.user).then(
				(response) => { _redirect($route, $location, 'overview') }, 
				(error) => {
					$scope.$apply(function () { 
						$scope.error = 'Sorry, login failed. Try again';
					});
				});

		} else {
			Firebase.create($scope.user).then(
				(response) => { _redirect($route, $location, 'overview') }, 
				(error) => {
					$scope.$apply(function () { 
						$scope.error = error;
					});
				})
		}
	}

	logout(Firebase) {
		Firebase.logOut().then(() => { location.reload() });
	}
}

function _redirect($route, $location, routeValue) {
	if ($location && routeValue) { $location.path(routeValue); }
	$route.reload();
}

module.exports = Home;