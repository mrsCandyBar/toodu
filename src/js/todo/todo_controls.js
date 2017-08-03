import TodoModel from './todo_model.js';

class TodoControls {

	retrieveTodos($scope, $route, store) {
		let todoList = $scope;
		todoList.filters = _retrieve('search');
	    todoList.todos = _retrieveTodos(store.tasks);

	    if ($route.current.params) {
	      todoList.todos = _filterResults($route.current.params['filter'], todoList.todos);
	    }

	    return todoList;
	}

	retrieveTodoFilters() {
		return _retrieve('search');
	}

	retrieveTodoStates() {
		return _retrieve('state');
	}

    retrieveSingleTodo($scope, $route, store) {
    	$scope.todo = store.tasks[$route.current.params.id];
	    $scope.todo = _retrieve('single', $scope.todo);

	    return $scope.todo;
    }

    createTodo(uuid, user) {
    	let todo = _retrieve('single', []);
    	todo.id = uuid;
    	todo.organisation = user.organisation;
	    return todo;
	}
}

function _retrieve(method, property) {
	if (method === 'search') {			return new TodoModel([]).getModelFilters(property) } 
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

module.exports = new TodoControls();