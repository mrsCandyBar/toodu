import Home from './pages/home.js';

class Pages {

	home($rootScope, $scope, $location, $route, Firebase) {
		let homeObj = new Home();
		$scope = _buildScope(homeObj, $scope);

		$scope.$watch('hasAccount',function() {
			homeObj.toggleAction($scope);
		}, true);
		$scope.submit = function() { homeObj.submit(Firebase, $route, $location, $scope, $rootScope); }

	};
}

function _buildScope(pageObj, $scope) {
	Object.keys(pageObj).forEach((key) => {
		$scope[key] = pageObj[key];
	});

	return $scope;
}

module.exports = new Pages();