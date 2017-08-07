import Todo from './todo.js';
import Create from './todo_create.js';

class Dashboard {

	init(Firebase, TodoControls, $scope, $route, $location, activity, $rootScope, uuid, Store) {

        if (Store.user) {
            $scope.allFilters = Store.allFilters;
            $scope.allTasks = Store.allTasks;
            $scope.newTask = Store.newTask;
            $scope.taskStates = Store.taskStates;
            $scope.user = Store.user;
            $scope.otherUsers = Store.otherUsers;
            console.log('page reload >>>', $scope, Store);
        }

        console.log('loaded', $scope, Store);

		// Listen for user to log in
        $scope.$on('userLoggedIn', function(event){

            // Get user info
			Firebase.retrieveUserInfo().then(() => {
				$scope.user = Firebase.user;
				if ($scope.user.isAdmin) {
                    $scope.otherUsers = Firebase.otherUsers;
                }

                // Retrieve tasks
				Firebase.retrieveTasks($rootScope, activity);
			});
        });

        // Listen for tasks retrieved
        $scope.$on('userTasksUpdated', function(event, data){
            Firebase.tasks = data;

            // Order tasks
            let updateTasks = TodoControls.retrieveTodos($scope,Firebase, uuid);

            $scope.$apply(function () {
                $scope = updateTasks;

                Store.allFilters = $scope.allFilters;
                Store.allTasks = $scope.allTasks;
                Store.newTask = $scope.newTask;
                Store.taskStates = $scope.taskStates;
                Store.user = $scope.user;
                Store.otherUsers = $scope.otherUsers;
                console.log('tasks returned >>>', $scope, Store);
            });
        });

        $scope.view = function(taskId) {
            $location.path('overview/' + taskId);
        }
	}
}

module.exports = Dashboard;