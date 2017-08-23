import TodoModel from './todo_model.js';

class TodoControls {
	retrieveTodos($scope, store, taskData) {
		let todoList = $scope;
		todoList.allFilters = _retrieve('search');
	    todoList.allTasks = store.tasks;

	    if (taskData.id != 0) {
	    	console.log('run from retrieved');
            todoList.currentTask = this.retrieveSingleTodo(taskData, todoList.allTasks);

            if (todoList.currentTask.status != 'notFound' && todoList.currentTask.comments != 1) {
                let getCommentsLength = 0;
                Object.keys(todoList.currentTask.comments).forEach((key) => {
					getCommentsLength++;
				});

                todoList.currentTask.allComments = getCommentsLength; }

		} else {
	    	todoList.currentTask = this.createTodo(store.user); }

	    todoList.taskFilters = this.retrieveTodoStates();
	    return todoList;
	}

	retrieveTodoFilters() { return _retrieve('search'); }
	retrieveTodoStates() { return _retrieve('state'); }

    retrieveSingleTodo(taskData, allTasks) {
		console.log('run', taskData, allTasks);
        let task = findTask(allTasks, taskData);
        task = _retrieve('single', task);
        return task;
    }

    createTodo(user) {
    	let todo = _retrieve('single', []);
	    return todo;
	}
}

function _retrieve(method, property) {
	if (method === 'search') {
		let emptyModel = new TodoModel([]);
		return emptyModel.getModelFilters(emptyModel)
	}
	else if (method === 'state') {		return new TodoModel([]).getStates(property) } 
	else if (method === 'single') {		return new TodoModel(property) }
}

function findTask(allTasks, taskData) {
	let taskState;
	for (let i = 0; i < allTasks.length; i++) {
		if (allTasks[i]['name'] == taskData.location) {
            taskState = allTasks[i]['tasks'];
        }
	}

	if (taskState) {
		for (let i = 0; i < taskState.length; i++) {
			if (taskState[i]['id'] == taskData.id) {
                taskState = taskState[i];
			}
		}
	} else {
        taskState = {
            status: 'notFound'
		}
	}

	return taskState;
}

module.exports = new TodoControls();