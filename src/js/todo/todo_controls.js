import TodoModel from './todo_model.js';

class TodoControls {

	retrieveTodos($scope, store, uuid, taskid) {
		let todoList = $scope;
		todoList.allFilters = _retrieve('search');
	    todoList.allTasks = _retrieveTodos(store.tasks);

	    if (taskid) {
            todoList.currentTask = this.retrieveSingleTodo(taskid, todoList.allTasks);

		} else {
            todoList.currentTask = this.createTodo(store.user);
		}

	    if (store.user.admin) {
            todoList.taskFilters = this.retrieveTodoStates();
		}

		this.genUUID = uuid;
	    return todoList;
	}

	retrieveTodoFilters() {
		return _retrieve('search');
	}

	retrieveTodoStates() {
		return _retrieve('state');
	}

    retrieveSingleTodo(index, allTasks) {
        let task = findTask(allTasks, 'id', index);
        console.log('single >>>', task);
        task = _retrieve('single', task);

	    return task;
    }

    createTodo(user) {
    	let todo = _retrieve('single', []);
    	todo.id = 0;
    	todo.organisation = user.organisation;
	    return todo;
	}

    update($scope, taskId) {
		let checkUsername = JSON.stringify($scope.user);
        if (checkUsername.indexOf('{') === -1) {
        	return 'Please select a user';

        } else {
            if ($scope.id === 0 || taskId == 'create') {
                let UUID = this.genUUID.v4();
                $scope.id = UUID;
            }

            let newTask = JSON.stringify($scope);
            newTask = JSON.parse(newTask);
            let user = $scope.user;
            newTask.username = user['name'];
            newTask.userid = user['id'];
            return newTask;
        }
    }
}

function _retrieve(method, property) {

	console.log('property >>>', method, property)

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
			let currentTodo = rawObj[todoObj];
			currentTodo.id = todoObj; 
			buildMap[buildMap.length] = new TodoModel(currentTodo);
		})

		return buildMap;

	} else {
	  return [];
	}
}

function _filterResults(params, store) {
    if (params != 'title') {
      	return _filterByProperty(params, store);
    } 
    return _filterByOrder(params, store);
} 


// Private functions
function _filterByProperty(filter, store) {
	let sortedList = [];

  	for(let item = 0; item < store.length;) {
      let sortFilter = store[item][filter];

      	for(let todo = 0; todo < store.length;) {
            if (store[todo][filter] === sortFilter) {
              	let filterMatch = store.splice(todo, 1);
              	sortedList.push(filterMatch[0]);

            } else {
              	todo++;
            }
      	}
    }

    return _filterByOrder(filter, sortedList);
}

function _filterByOrder(param, store) {
  	let allNames = [];
    store.forEach((todo) => {
      	allNames[allNames.length] = todo[param];
    });

    allNames.sort();
    let sortedList = [];

    allNames.forEach((name) => {
    	
    	for (let item = 0; item < store.length; item++) {
			
			if (name === store[item][param]) {
				let storeItem = JSON.stringify(store[item]);
				store.splice(item, 1);
	          	sortedList[sortedList.length] = JSON.parse(storeItem);

	          	break;
	        }
    	};
    });
    return sortedList;
}

function findTask(allTasks, property, value) {
	for (let i = 0; i < allTasks.length; i++) {
        if (allTasks[i][property] == value) {
            return allTasks[i];
        }
	}

	return [];
}

module.exports = new TodoControls();