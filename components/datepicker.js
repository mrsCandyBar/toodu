
angular.module('datePickerComponent', [])
 
  .directive('datepicker', function() {
    return {
      	restrict: 'E',
      	transclude: true,
      	scope: {
      		newDate: '=info'
      	},
      	controller: function($scope) {

      		document.getElementById("main").onclick = function () {
      			if ($scope.menuStatus === 'isOpen') {
      				$scope.menuStatus = 'isClosed';
      				$scope.dp__Controls['openSelection'] =  '';
      			}
      		};

      		$scope.menuStatus = 'isClosed';

	      	$scope.dp_createDays = function(monthTitle, amount) {
				let month = {
					title: monthTitle,
					days: [],
					placeholder: []
				};
				for( let i = 0; i <= amount; i++) { 
					month.days[i] = i=== 0 ? '' : i; 
				};
				return month;
			}

			$scope.dp_createYears = function(currentYear, amount) {
				let year = []
				for( let i = 0; i < amount; i++) { 
					year[i] = currentYear + i; 
				};
				return year;
			}

	      	$scope.dp__Controls = {
	      		days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
	      		months: [
		      		$scope.dp_createDays('January',  31),
		      		$scope.dp_createDays('February', 29),
					$scope.dp_createDays('March', 	 31),
					$scope.dp_createDays('April',  	 30),
					$scope.dp_createDays('May', 	 31),
					$scope.dp_createDays('June', 	 30),
					$scope.dp_createDays('July', 	 31),
					$scope.dp_createDays('August', 	 31),
					$scope.dp_createDays('September', 30),
					$scope.dp_createDays('October',  31),
					$scope.dp_createDays('November', 30),
					$scope.dp_createDays('December', 31)
				],
				years: $scope.dp_createYears(new Date().getFullYear(), 8),
				selected: {
					year: 	new Date().getFullYear(),
					month: 	new Date().getMonth() + 1,
					day: 	new Date().getDate()
				},

				dateSelection: ['year','month','day'],
				openSelection: ''
			}
			

			
			if ($scope.newDate) {
				let date = $scope.newDate.split('-')
				$scope.dp__Controls['selected']['year'] 	= parseInt(date[0]);
				$scope.dp__Controls['selected']['month'] 	= parseInt(date[1]);
				$scope.dp__Controls['selected']['day'] 		= parseInt(date[2]);
				$scope.newDate = $scope.newDate;

			} else {
				$scope.newDate = new Date();
			}
			
			_dp_calculateDayMonthStartsOn(
				$scope.dp__Controls['selected']['month']
			);
			
			$scope.dp_showOptions = function(option) {
				$scope.menuStatus = 'isOpen';

				if ($scope.dp__Controls['openSelection'] === option) {
					$scope.dp__Controls['openSelection'] =  '';
				} else {
		        	$scope.dp__Controls['openSelection'] =  option;
		        }
	        }

			// Update DOM with values selected
	        $scope.dp_setDate = function(value) {
	        	if (value) {
		        	if ($scope.dp__Controls['openSelection'] === 'year') {
		        		$scope.dp__Controls['selected']['year'] = value;
		        	} 
		        	else if ($scope.dp__Controls['openSelection'] === 'month') {
		        		$scope.dp__Controls['selected']['month'] = value;
		        		_dp_calculateDayMonthStartsOn($scope.dp__Controls['selected']['month'] - 1);

		        	} else {
		        		$scope.dp__Controls['selected']['day'] = value;
		        	}

		          	_dp_update();
		      	}
	        }

	        function _dp_update() {
	        	$scope.menuStatus = 'isClosed';

	        	let createDate = '';
	        	createDate += $scope.dp__Controls['selected']['year'] + '-';
	        	createDate += $scope.dp__Controls['selected']['month'] < 10 ? '0' + $scope.dp__Controls['selected']['month'] + '-': $scope.dp__Controls['selected']['month'] + '-';
	        	createDate += $scope.dp__Controls['selected']['day'] < 10 ? '0' + $scope.dp__Controls['selected']['day'] : $scope.dp__Controls['selected']['day'];

	        	_dp_isLeapYear($scope.dp__Controls['selected']['year']);
	        	$scope.newDate = createDate;
	        	$scope.dp__Controls['openSelection'] = '';
	        }

	        function _dp_calculateDayMonthStartsOn(month) {

	        	let date = new Date();
	        	let selectedMonth = $scope.dp__Controls['selected']['month'] - 1;
	        	date.setFullYear($scope.dp__Controls['selected']['year'], selectedMonth,1);

	        	let _placeHolder = $scope.dp__Controls['months'][selectedMonth]['placeholder'];
	        	_placeHolder = [];
	        	for (let i = 1; i < date.getDay(); i++) {
	        		_placeHolder.unshift(i);
	        	}

	        	let _selectedMonth = $scope.dp__Controls['selected']['month'] - 1
	        	if ($scope.dp__Controls['selected']['day'] > $scope.dp__Controls['months'][_selectedMonth]['days'].length) {
	    			$scope.dp__Controls['openSelection'] = '';
	    			$scope.dp_setDate($scope.dp__Controls['months'][_selectedMonth]['days'].length - 1);
	    		}
	        }

	        function _dp_isLeapYear(year) {
	        	if (year % 4 == 0 && year % 100 != 0 || 
	        		year % 400 == 0) {
	         		if ($scope.dp__Controls['months'][1]['days'].length < 30) {
			    	 	$scope.dp__Controls['months'][1]['days'][29] = 29;
			    	} 
			    	
			    } else {
			    	if ($scope.dp__Controls['months'][1]['days'].length > 29) {
			    		$scope.dp__Controls['months'][1]['days'].splice(29,1);
			    	}
			    };
	        }
	      },
	      template:
	        '<div class="dp__holder">' +

	        	'<h3>' +
	        		'<a ng-click="dp_showOptions(dp__Controls[\'dateSelection\'][0])">{{ dp__Controls[\'selected\'][\'year\'] }}</a> - ' +
	        		'<a ng-click="dp_showOptions(dp__Controls[\'dateSelection\'][1])">{{ dp__Controls[\'selected\'][\'month\'] }}</a> - ' +
	        		'<a ng-click="dp_showOptions(dp__Controls[\'dateSelection\'][2])">{{ dp__Controls[\'selected\'][\'day\'] }}</a>' +
	        	'</h3>' +

	        	'<ul class="dp__dateYear" ng-show="dp__Controls[\'openSelection\'] === dp__Controls[\'dateSelection\'][0]">' +
		            '<li ng-repeat="year in dp__Controls[\'years\']" ng-click="dp_setDate(year)" ' +
		            	'class="{{ dp__Controls[\'selected\'][\'year\'] === year ? \'active\' : \'\' }}">' +
		            	'<a>{{ year }}</a>' +
		            '</li>' +
	            '</ul>' +

	        	'<ul class="dp__dateTitle" ng-show="dp__Controls[\'openSelection\'] === dp__Controls[\'dateSelection\'][1]">' +
		            '<li ng-repeat="month in dp__Controls[\'months\']" ng-click="dp_setDate($index + 1)"' +
		            	'class="{{ dp__Controls[\'selected\'][\'month\'] === $index + 1 ? \'active\' : \'\' }}">' +
		            	'<a>{{ month.title }}</a>' +
		            '</li>' +
		        '</ul>' +


		        '<ul class="dp__dateDay" ng-show="dp__Controls[\'openSelection\'] === dp__Controls[\'dateSelection\'][2]">' +
		            '<li ng-repeat="day in dp__Controls[\'days\']"><a>{{ day }} </a></li>' +
		        '</ul>' +

		        '<ul class="dp__dateMonth__holder" ng-show="dp__Controls[\'openSelection\'] === dp__Controls[\'dateSelection\'][2]">' +
		            '<li ng-repeat="day in dp__Controls[\'months\'][(dp__Controls[\'selected\'][\'month\'] - 1)][\'placeholder\']">' +
		          		'<a>&nbsp;</a>' +
		          	'</li>' +

		            '<li ng-repeat="day in dp__Controls.months[(dp__Controls[\'selected\'][\'month\'] - 1)].days" ng-click="dp_setDate(dp__Controls.months[(dp__Controls[\'selected\'][\'month\'] - 1)][\'days\'][day])"' +
		            	'class="{{ dp__Controls[\'selected\'][\'day\'] === dp__Controls[\'months\'][(dp__Controls[\'selected\'][\'month\'] - 1)][\'days\'][day] ? \'active\' : \'\' }}">' +
		          		'<a>&nbsp;{{ dp__Controls.months[(dp__Controls[\'selected\'][\'month\'] - 1)][\'days\'][day] }}</a>' +
		          	'</li>' +
		        '</ul>' +

	        '</div>',
	      	replace: true
	    }
  });