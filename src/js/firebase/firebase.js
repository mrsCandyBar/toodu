
import Authorize from './firebase_authorization.js';
import User from './firebase_user.js';
import Query from './firebase_queries.js';
import Command from './firebase_commands.js';

class Firebase {
	
	constructor() {
    window.sessionStorage.userID        ? this.userID = window.sessionStorage.userID                            : this.userID;
		window.sessionStorage.user          ? this.user = JSON.parse(window.sessionStorage.user)                    : this.user;
    window.sessionStorage.tasks         ? this.tasks = JSON.parse(window.sessionStorage.tasks)                  : this.tasks;
    window.sessionStorage.searchFilters ? this.searchFilters = JSON.parse(window.sessionStorage.searchFilters)  : this.searchFilters;
    this.allUsers;
    this.firebase = initDB();
		this.database = this.firebase.database()
    this.auth = this.firebase.auth();
	}

  autoLogin($route) {
    let user = {
      email : window.sessionStorage.email,
      password : window.sessionStorage.password
    }

    this.logIn(user).then((response) => {
      console.log('logged in')
      
    }, (error) => {
      console.log('auto login failed >>>', error);
    });
  }

  create(userData) {
    let createUser = new Promise((resolve, reject) => {
      User.create(userData).then((data) => {
        Command.addUser(this.database, data.uid, userData);

        this.logIn(userData).then((response) => {
          resolve(response);
        }, (error) => {
          console.log('user created but signIn failed >>', error);
          reject(error);
        });
        
      }, (error) => {
        reject(error.message);
      });

    });

    return createUser;
  }

	logIn(user) {
    let logInUser = new Promise((resolve, reject) => {
      Authorize.signIn(this.auth, user).then((data) => {
        window.sessionStorage.email = user.email;
        window.sessionStorage.password = user.password;
        
        this.userID = firebase.auth().currentUser.uid;
        window.sessionStorage.userId = this.userID;
        resolve('User logged in successfully');
        
      }, (error) => {
        reject('Sign in attempt failed >>', error);
      });
    });

    return logInUser;
	}

  logOut() {
    let logOutUser = new Promise((resolve, reject) => {
      Authorize.signOut(this.auth).then((data) => {
        window.sessionStorage.clear();

        this.userID = '';
        resolve('User logged out successfully');

      }, (error) => {
        reject('Sign out attempt failed >>', error);
      });
    });

    return logOutUser;
  }

  retrieveUserInfo() {
    let dataRetrieved = new Promise((resolve, reject) => {
      Query.data(this.database, 'users/' + this.userID).then((userData) =>{
        this.user = userData;
        window.sessionStorage.user = JSON.stringify(this.user);
        
        this.searchFilters = _returnSearchFilters(userData.admin, userData.organisation, this.userID);
        window.sessionStorage.searchFilters = JSON.stringify(this.searchFilters);
        resolve(userData);

      }, (error) => {
        reject('problem fetching user data', error)
      });
    });

    return dataRetrieved
  }

  retrieveTasks($rootScope, activity) {
    this.database
      .ref('/' + activity)
      .orderByChild(this.searchFilters.filter)
      .equalTo(this.searchFilters.value)
      .on('value', function(snapshot) {
        let updates = snapshot.val() ? snapshot.val() : [];
        $rootScope.$broadcast('userTasksUpdated', updates);

      }, function(err) {
      console.log('denied >>>', err);
    });
  }

  retrieveUsers() {
    let dataRetrieved = new Promise((resolve, reject) => {
      Query.dataWithSpecificResults(this.database, 'users/', 'organisation', this.user.organisation).then((users) => {

        let userArray = [];
        if (users && users !== null && typeof users === 'object') {
          Object.keys(users).forEach((user) => {
            userArray[userArray.length] = users[user];
          });
        }

        let updated = _hasListBeenUpdated(this.allUsers, userArray);
        if (updated) {
          this.allUsers = userArray;
          resolve(this.allUsers);
        }
        reject('No changes to user data');

      }, (error) => {
        reject(error);
      });
    });

    return dataRetrieved;
  }

  updateTask(taskData) {
    if (!this.tasks) { this.tasks = {} };
    this.tasks[taskData.id] = taskData;
    Command.updateTask(this.database, taskData.id, taskData, '');
  }

  moveTask(taskData, location) {
    Command.moveTask(this.database, taskData.id, taskData, location);
  }

  deleteTask(taskId, location) {
    Command.deleteTask(this.database, taskId, location);
  }

  // Comments
  addComment(taskId, comment, uuid) {
    Command.addCommentToTask(this.database, taskId, comment, uuid);
  }

  addReplyToComment(taskId, comment, reply, uuid) {
    Command.addReplyToCommentInTask(this.database, taskId, comment, reply, uuid);
  }
}

function initDB() {
  var config = {
  	apiKey: "AIzaSyAHLGIuByAL6vrTfG7kbRtAwwf7kaCkt9k",
    authDomain: "starterproject-4e320.firebaseapp.com",
    databaseURL: "https://starterproject-4e320.firebaseio.com",
    projectId: "starterproject-4e320",
    storageBucket: "",
    messagingSenderId: "866187325341"
  };

  firebase.initializeApp(config);
  return firebase;
}

function _returnSearchFilters(isAdmin, organisation, userId) {
  let task = {
      filter: isAdmin ? 'organisation' : 'user', 
      value : isAdmin ? organisation : userId
    }

  return task;
}

function _hasListBeenUpdated(listOld, listNew) {
  let currentList = angular.toJson(listOld);
  let newList = JSON.stringify(listNew);

  if (currentList !== newList) {
    return true;
  } else {
    return false;
  }
}

module.exports = new Firebase();