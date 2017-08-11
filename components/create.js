angular
	.module('createTodoComponent', [])
	.directive('create', function() {
		return {
			restrict: 'E',
			transclude: true,
			scope: {
				newObject: '=model',
                task: '=filters'
			},
			
			//controller: 'createControls',
			controller: function($scope) {
				$scope.submit = function(type) {
					if (type === 'newTask') {
                        $scope.newObject.id = 0;
					}
					$scope.$emit('testMessage', $scope.newObject);
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