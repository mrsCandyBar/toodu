angular
	.module('createTodoComponent', [])
	.directive('create', function() {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				myObj: '=model',
				states: '=filters'
			},
			
			//controller: 'createControls',
			controller: function($scope) {
				$scope = _buildScope($scope.myObj, $scope);

				$scope.submit = function() { 
					$scope.myObj.submit($scope);
				}
			},

			templateUrl: 'template/todo_create.html',
			replace: true
		}
	});


function _buildScope(pageObj, $scope) {
	Object.keys(pageObj).forEach((key) => {
		$scope[key] = pageObj[key];
	});

	return $scope;
}