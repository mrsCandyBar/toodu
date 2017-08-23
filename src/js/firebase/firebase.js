
import Authorize from './firebase_authorization.js';
import User from './firebase_user.js';
import Command from './firebase_commands.js';

class Firebase {

    constructor() {
        window.sessionStorage.userID ? this.userID = window.sessionStorage.userID : this.userID;
        window.sessionStorage.user ? this.user = JSON.parse(window.sessionStorage.user) : this.user;
        window.sessionStorage.tasks ? this.tasks = JSON.parse(window.sessionStorage.tasks) : this.tasks;
        this.allUsers;
        this.firebase = initDB();
        this.database = this.firebase.database()
        this.auth = this.firebase.auth();
        this.user;
    }

    // If user has not logged out and is still in the same tab
    autoLogin($rootScope, $route) {
        let user = {
            email: window.sessionStorage.email,
            password: window.sessionStorage.password
        }

        this.logIn($rootScope, user).then((response) => {
            },
            (error) => {
                console.log('auto login failed >>>', error)
            });
    }

    // Create a new user
    createUser($rootScope, userData) {
        let createUser = new Promise((resolve, reject) => {
            User.create(userData).then((data) => {
                Command.addUser(this.database, data.uid, userData);

                this.logIn($rootScope, userData).then((response) => {
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

    // Create a new group
    createGroup($rootScope, userData) {
        let newGroup = new Promise((resolve, reject) => {
            User.create(userData).then((data) => {
                Command.addGroup(this.database, data.uid, userData);

                this.logIn($rootScope, userData).then((response) => {
                    resolve(response);
                }, (error) => {
                    console.log('user created but signIn failed >>', error);
                    reject(error);
                });

            }, (error) => {
                reject(error.message);
            });

        });

        return newGroup;
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
    retrieveUserInfo($rootScope) {
        console.log('UserID', this.userID)
        this.database
            .ref('/users/' + this.userID)
            .on('value', function (snapshot) {
                let userData = snapshot.val() ? snapshot.val() : [];
                $rootScope.$broadcast('userDataUpdated', userData);

            }, function (err) {
                console.log('denied >>>', err);
            });
    }

    // Update user info
    updateUserInfo(userData) {
        Command.updateUser(this.database, userData);
    }

    // Update user group
    updateUserGroup(userData) {
        Command.updateUserGroup(this.database, userData);
    }

    // Get group info
    retrieveGroupInfo($rootScope) {
        console.log('returns >>>', this.userID);
        this.database
            .ref('/groups/' + this.userID)
            .on('value', function (snapshot) {
                let userData = snapshot.val() ? snapshot.val() : [];
                console.log('returns >>>', snapshot);
                $rootScope.$broadcast('groupDataUpdated', userData);

            }, function (err) {
                console.log('denied >>>', err);
            });
    }

    // Update group info
    updateGroupInfo(userData) {
        Command.updateUser(this.database, userData);
    }

    // Member Request
    sendMemberRequest(memberRequest) {
        Command.sendMemberRequest(this.database, memberRequest);
    }

    removeMember(memberData) {
        Command.removeMember(this.database, memberData);
    }

    memberRequest(groupData) {
        Command.memberRequest(this.database, groupData);
    }

    // retrieve tasks
    retrieveTasks($rootScope, user) {
        this.database
            .ref('/tasks/' + user.group.active.id)
            .on('value', function (snapshot) {
                let updates = snapshot.val() ? snapshot.val() : [];
                $rootScope.$broadcast('userTasksUpdated', updates);

            }, function (err) {
                console.log('denied >>>', err);
            });
    }

    retrieveGroups($rootScope, email) {
        this.database
            .ref('/groups/')
            .orderByChild('email')
            .equalTo(email)
            .once('value', function (snapshot) {
                let updates = snapshot.val() ? snapshot.val() : [];
                $rootScope.$broadcast('groupsReturned', updates);

            }, function (err) {
                console.log('denied >>>', err);
            });
    }

    // update task
    updateTask(taskData) {
        Command.updateTask(this.database, taskData);
    }

    deleteTask(taskData) {
        Command.deleteTask(this.database, taskData);
    }

    moveTask(taskData) {
        Command.moveTask(this.database, taskData);
        Command.sendUserNotification(this.database, taskData.updateContributers);
    }

    removeNote(note) {
        Command.removeSingleUserNote(this.database, note)
    }

    listenForEvents($rootScope) {
        let database = this.database;

        // Task Updates
        $rootScope.$on('updateMyTasks', function (event, watchTasks)        { Command.updateMyTasks(database, watchTasks, this.userId); });
        $rootScope.$on('updateTaskLocationChange', function (event, taskData) { Command.updateTaskHoldersOfLocationChange(database, taskData); })

        // Comments
        $rootScope.$on('notifyTaskHolders', function (event, commentData)   { Command.sendUserNotification(database, commentData); });
        $rootScope.$on('addComment', function (event, commentData)          { Command.addReplyAndNotifyCommenter(database, commentData); });
        $rootScope.$on('addReply', function (event, replyData)              { Command.addReplyAndNotifyCommenter(database, replyData); });
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