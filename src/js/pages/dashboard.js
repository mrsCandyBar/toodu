
class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity) {
		if (Firebase.userID) {
			if (!Firebase.user) {
				Firebase.retrieveUserInfo().then(() => {
					Firebase.retrieveTasks(activity).then((resolve) => {
						_redirect($route);

					}, (error) => {
						alert('Oops something went wrong... this is awkward', error);
					});
				});

			} else {
				$scope.user = Firebase.user;
				$scope.taskList = TodoControls.retrieveTodos($scope, $route, Firebase);
			
				Firebase.taskUpdate(activity).then((response) => {
					_redirect($route);
					
				}, (reject) => { 
					console.log('No updates to Task Data recieved'); 
				})
			}
		}	

		$scope.goTo = function(route) {
			_redirect($route, $location, route);
		}
	}
}

function _redirect($route, $location, routeValue) {
	if ($location && routeValue) { $location.path(routeValue); }
	$route.reload();
}

module.exports = Dashboard;