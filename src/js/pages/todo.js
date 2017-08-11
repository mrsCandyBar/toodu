
class Todo {

	constructor($scope, $route, Firebase, TodoControls) {
        this.todoStates = TodoControls.retrieveTodoStates();
        this.todo = TodoControls.retrieveSingleTodo($scope, $route, Firebase);
		this.editable = true; //false;
		this.user = Firebase.user;
		this.isAdmin = this.user.admin;
    	this.backup = JSON.stringify(this.todo);

		this.taskDates = {
			start : this.todo.dateStart,
			end : this.todo.dateEnd,
			total : moment(this.todo.dateEnd).fromNow()
		}

		this.comment = {};
		this.reply = [];
		this.Firebase = Firebase;
	}

	moveTodo($scope, Firebase, $route, $location) {
		let compareObj = JSON.stringify($scope.todo); 
		let location = $scope.todo.isActive === true ? 'archive' : 'tasks';
		Firebase.moveTask(JSON.parse(compareObj), location);

		if ($scope.todo.isActive === true) {
			$location.path(location);

		} else {
			$scope.editable = true;
			$scope.todo.status = 'Waiting';
		}
		
	}

	deleteTodo($scope, Firebase) {
		let location = $scope.todo.isActive === true ? 'tasks' : 'archive';
		Firebase.deleteTask($scope.todo.id, location);
		history.back();
	}


	replyToComment($scope, commentId, Firebase) {
		let buildReply = $scope.reply[commentId];
		buildReply.from = this.user.id;
		buildReply.name = this.user.name;

		Firebase.addReplyToComment($scope.todo.id, commentId, buildReply, new Date().getTime());
	}
}

module.exports = Todo;