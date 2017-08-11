
angular.module('dropdownComponent', [])
 
  .directive('dropdown', function() {
    return {
      	restrict: 'E',
      	transclude: true,
      	scope: {
      		allOptions: '=options',
      		selectedOption: '=selected'
      	},
      	controller: function($scope) {

      		if ($scope.allOptions && $scope.allOptions !== null && typeof $scope.allOptions === 'object') {
      			let getOptions = [];
	          	Object.keys($scope.allOptions).forEach((option) => {
	            	getOptions[getOptions.length] = option['name'] ? option : $scope.allOptions[option];
	          	});

	          	$scope.allOptions = getOptions;
	        }

	        if (!$scope.selectedOption) {
                $scope.selectedOption = '..'
			}

      		$scope.menuStatus;
      		$scope.openMenu = function() {
      			$scope.menuStatus = $scope.menuStatus === 'isOpen' ? 'isClosed' : 'isOpen';
	      	};
	      	$scope.closeMenu = function(option) {
	      		$scope.selectedOption = option;
	      		$scope.menuStatus = 'isClosed';
	      	};
			
			$scope.closeMenu($scope.selectedOption);
            document.getElementById("main").onclick = function () {
                if ($scope.menuStatus === 'isOpen') {
                    $scope.menuStatus = 'isClosed';
                }
            };

            $scope.$on('updateArrayEvent', function(event, data) {
            	let selected = JSON.stringify($scope.selectedOption);

            	if (selected.indexOf('{') > -1) {
                    console.log('broadcast recieved >>', $scope.selectedOption);
                    $scope.selectedOption = $scope.selectedOption.name ? $scope.selectedOption.name : $scope.selectedOption;
				}
			});


	      },
	      template:
	      	'<div class="form-group dd__container">' +
		        '<p ng-click="openMenu()">{{ selectedOption[\'name\'] ? selectedOption[\'name\'] : selectedOption }}</p>' +
		        '<div class="dd__holder {{ menuStatus }}">' +
		        	'<div class="form-group dd__holder__menu">' +
			            '<span ng-repeat="option in allOptions">' +
			                '<input type="radio" name="option" value="{{ option }}" ng-click="closeMenu(option)"> {{ option[\'name\'] ? option[\'name\'] : option }}<br>' +
			            '</span>' +
			        '</div>' +
		        '</div>' +
		    '</div>',

	      	replace: true
	    }
  });