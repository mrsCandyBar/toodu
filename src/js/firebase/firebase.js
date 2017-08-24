
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

    autoLogin($rootScope, $route) {
        let user = {
            email: window.sessionStorage.email,
            password: window.sessionStorage.password }

        this.logIn($rootScope, user).then((response) => {},
            (error) => {
                console.log('auto login failed >>>', error) });
    }

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

    logOut() {
        let logOutUser = new Promise((resolve, reject) => {
            Authorize.signOut(this.auth).then((data) => {
                window.sessionStorage.clear();
                resolve('User logged out successfully');

            }, (error) => {
                reject('Sign out attempt failed >>', error);
            });
        });

        return logOutUser;
    }

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

    retrieveGroupInfo($rootScope) {
        this.database
            .ref('/groups/' + this.userID)
            .on('value', function (snapshot) {
                let userData = snapshot.val() ? snapshot.val() : [];
                $rootScope.$broadcast('groupDataUpdated', userData);

            }, function (err) {
                console.log('denied >>>', err);
            });
    }

    // Update group info
    updateGroupInfo(userData) {
        Command.updateUser(this.database, userData);
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

    listenForEvents($rootScope) {
        let database = this.database;

        // User
        $rootScope.$on('updateUserInfo', function(event, userData)          { Command.updateUser(database, userData); });
        $rootScope.$on('removeNote', function(event, note)                  { Command.removeSingleUserNote(database, note) });

        // Task Updates
        $rootScope.$on('newTaskData', function (event, taskData)            { Command.updateTask(database, taskData); })
        $rootScope.$on('updateMyTasks', function (event, watchTasks)        { Command.updateMyTasks(database, watchTasks, this.userId); });
        $rootScope.$on('updateTaskLocationChange', function (event, taskData) { Command.updateTaskHoldersOfLocationChange(database, taskData); })
        $rootScope.$on('deleteTask', function (event, taskData)             { Command.deleteTask(database, taskData); })
        $rootScope.$on('moveTask', function (event, taskData)               {
            Command.moveTask(this.database, taskData);
            Command.sendUserNotification(this.database, taskData.updateContributers);
        });

        // Comments
        $rootScope.$on('notifyTaskHolders', function (event, commentData)   { Command.sendUserNotification(database, commentData); });
        $rootScope.$on('addComment', function (event, commentData)          { Command.addReplyAndNotifyCommenter(database, commentData); });
        $rootScope.$on('addReply', function (event, replyData)              { Command.addReplyAndNotifyCommenter(database, replyData); });

        // Groups
        $rootScope.$on('removeMember', function (event, memberData)         { Command.removeMember(database, memberData); });
        $rootScope.$on('updateUserGroup', function (event, userData)        { Command.updateUserGroup(database, userData); });
        $rootScope.$on('sendMemberRequest', function (event, memberRequest) { Command.sendMemberRequest(database, memberRequest); });
        $rootScope.$on('retrieveGroups', function (event, email)            {
            database
                .ref('/groups/')
                .orderByChild('email')
                .equalTo(email)
                .once('value', function (snapshot) {
                    let updates = snapshot.val() ? snapshot.val() : [];
                    $rootScope.$broadcast('groupsReturned', updates);

                }, function (err) {
                    console.log('denied >>>', err);
                });
        });
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