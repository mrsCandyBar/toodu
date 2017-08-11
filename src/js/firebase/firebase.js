
import Authorize from './firebase_authorization.js';
import User from './firebase_user.js';
import Query from './firebase_queries.js';
import Command from './firebase_commands.js';

class Firebase {
	
	constructor() {
        window.sessionStorage.userID        ? this.userID = window.sessionStorage.userID                            : this.userID;window.sessionStorage.user          ? this.user = JSON.parse(window.sessionStorage.user)                    : this.user;
        window.sessionStorage.tasks         ? this.tasks = JSON.parse(window.sessionStorage.tasks)                  : this.tasks;
        window.sessionStorage.searchFilters ? this.searchFilters = JSON.parse(window.sessionStorage.searchFilters)  : this.searchFilters;
        this.allUsers;
        this.firebase = initDB();
        this.database = this.firebase.database()
        this.auth = this.firebase.auth();
	}

	// If user has not logged out and is still in the same tab
    autoLogin($rootScope, $route) {
        let user = {
          email : window.sessionStorage.email,
          password : window.sessionStorage.password
        }

        this.logIn($rootScope, user).then((response) => {},
            (error) => { console.log('auto login failed >>>', error) });
    }

    // Create a new user
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

    // Log user in
    logIn($rootScope, user) {
        let logInUser = new Promise((resolve, reject) => {
            Authorize.signIn(this.auth, user).then((data) => {
                window.sessionStorage.email = user.email;
                window.sessionStorage.password = user.password;

                this.userID = firebase.auth().currentUser.uid;
                window.sessionStorage.userId = this.userID;
                $rootScope.$broadcast('userLoggedIn');
                resolve('User logged in successfully');

            }, (error) => {
                reject('Sign in attempt failed >>', error);
            });
        });

        return logInUser;
	}

	// Log user out
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

    // Get user info
    retrieveUserInfo() {
        let dataRetrieved = new Promise((resolve, reject) => {
            Query.data(this.database, 'users/' + this.userID).then((userData) =>{
                this.user = userData;
                this.searchFilters = _returnSearchFilters(userData.admin, userData.organisation, this.userID);

                if (userData.admin) {
                  this.otherUsers = this._retrieveUsers().then(() => { resolve(userData);
                  }, error => { resolve(userData); });

                } else { resolve(userData); }

            }, (error) => {
                reject('problem fetching user data', error)
            });
        });

        return dataRetrieved
    }

    // retrieve tasks
    retrieveTasks($rootScope, activity) {
	    let TaskUpdater = this.tasks;

        this.database
            .ref('/' + activity)
            .orderByChild(this.searchFilters.filter)
            .equalTo(this.searchFilters.value)
            .on('value', function(snapshot) {
                let updates = snapshot.val() ? snapshot.val() : [];
                TaskUpdater = updates;
                $rootScope.$broadcast('userTasksUpdated', updates);

            }, function(err) {
                console.log('denied >>>', err);
        });
    }

    // retrieve users
    _retrieveUsers() {
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

    // update task
    updateTask(taskData) {
        Command.updateTask(this.database, taskData.id, taskData, '');
    }

    moveTask(taskData, location) {
        Command.moveTask(this.database, taskData.id, taskData, location);
    }

    deleteTask(taskId, location) {
        Command.deleteTask(this.database, taskId, location);
    }

    // Comments
    addComment(taskId, commentData) {
        Command.addCommentToTask(this.database, taskId, commentData);
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