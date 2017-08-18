import TodoModel from './todo_model.js';

class TodoControls {
	retrieveTodos($scope, store, taskData) {
		let todoList = $scope;
		todoList.allFilters = _retrieve('search');
	    todoList.allTasks = _retrieveTodos(store.tasks);

	    if (taskData.id != 0) {
            todoList.currentTask = this.retrieveSingleTodo(taskData, todoList.allTasks);
            if (todoList.currentTask.status != 'notFound' && todoList.currentTask.comments != 1) {
                let getCommentsLength = 0;
                Object.keys(todoList.currentTask.comments).forEach((key) => {
					getCommentsLength++;
				});
                todoList.currentTask.allComments = getCommentsLength;
            }

		} else {
            todoList.currentTask = this.createTodo(store.user);
		}

	    todoList.taskFilters = this.retrieveTodoStates();
	    return todoList;
	}

	retrieveTodoFilters() {
		return _retrieve('search');
	}

	retrieveTodoStates() {
		return _retrieve('state');
	}

    retrieveSingleTodo(taskData, allTasks) {
        let task = findTask(allTasks, taskData);
        task = _retrieve('single', task);

        return task;
    }

    createTodo(user) {
    	let todo = _retrieve('single', []);
    	todo.id = 0;
    	todo.organisation = user.organisation;
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

function _retrieveTodos(rawObj) {
	if (rawObj && rawObj !== null && typeof rawObj === 'object') {
		let buildMap = [];

        Object.keys(rawObj).forEach((todoObj) => {
            buildMap[todoObj] = [];

            Object.keys(rawObj[todoObj]).forEach((innertodoObj) => {
                let currentTodo = rawObj[todoObj][innertodoObj];

                buildMap[todoObj][buildMap[todoObj].length] = new TodoModel(currentTodo);

            })
        });

		return buildMap;

	} else {
	  return [];
	}
}

function findTask(allTasks, taskData) {
	if (allTasks[taskData.location]) {
        for (let i = 0; i < allTasks[taskData.location].length; i++) {
            if (allTasks[taskData.location][i]['id'] == [taskData.id]) {
                return allTasks[taskData.location][i];
            }
        }
    }

	let newTask = {};
    newTask.status = 'notFound';
	return newTask;
}

module.exports = new TodoControls();