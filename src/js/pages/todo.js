
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
}

module.exports = Todo;