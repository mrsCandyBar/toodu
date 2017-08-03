import Home from './pages/home.js';
import Todo from './pages/todo.js';
import Create from './pages/todo_create.js';

class Pages {

	home($scope, $location, $route, Firebase) {
		let homeObj = new Home();
		$scope = _buildScope(homeObj, $scope);

		$scope.$watch('hasAccount',function() {
			homeObj.toggleAction($scope);
		}, true);
		$scope.submit = function() { homeObj.submit(Firebase, $route, $location, $scope); }
		$scope.logout = function() { homeObj.logout(Firebase); }
	};

	todo($scope, $route, $location, Firebase, TodoControls, uuidGen) {
		let todoObj = new Todo($scope, $route, Firebase, TodoControls);
		$scope = _buildScope(todoObj, $scope);
		
		$scope.update = function() 			{ todoObj.update($scope, Firebase) }
    	$scope.cancel = function() 			{ todoObj.cancel($scope) }
		$scope.moveTodo = function() 		{ todoObj.moveTodo($scope, Firebase, $route, $location) }
		$scope.deleteTodo = function() 		{ todoObj.deleteTodo($scope, Firebase) }

		// Comments
		$scope.addComment = function()		{ todoObj.addComment($scope, Firebase) }
		$scope.replyToComment = function(commentId)	{ todoObj.replyToComment($scope, commentId, Firebase) }
	};

	create($scope, $route, uuid, Firebase, TodoControls) {
		let createObj = new Create(TodoControls, $scope, $route, uuid, Firebase);
		$scope = _buildScope(createObj, $scope);

		$scope.submit = function() { createObj.submit($scope, Firebase) }
	};
}

function _buildScope(pageObj, $scope) {
	Object.keys(pageObj).forEach((key) => {
		$scope[key] = pageObj[key];
	});

	return $scope;
}

module.exports = new Pages();