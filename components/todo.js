angular
    .module('todoComponent', [])
    .directive('todo', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                task: '=model',
                filter: '=filters',
                user: '=member'
            },

            controller: function($scope) {

                    $scope.comment = {
                        name: $scope.user && $scope.user.name ? $scope.user.name : '',
                        from: $scope.user && $scope.user.id ? $scope.user.id : '',
                        message: '',
                        id: 0
                    }

                    // Toggle Task Edit Mode
                    $scope.$watch('task.editable', function () {
                        if ($scope.task && $scope.task.editable) {
                            let unalteredTask = JSON.stringify($scope.task);
                            $scope.backup = unalteredTask;
                        }
                    });

                    // Toggle Task Edit Mode
                    $scope.$watch('task.status', function () {
                        if ($scope.task &&
                            ($scope.task.id && $scope.task.id.length > 0) &&
                            ($scope.task.status != 'Waiting')) {
                            let newTask = JSON.stringify($scope.task);
                            $scope.$emit('newTaskData', newTask);
                        }
                    });

                    $scope.cancel = function () {
                        $scope.task = JSON.parse($scope.backup);
                        if ($scope.task && ($scope.task.id != 0)) {
                            $scope.task.editable = false;
                        }
                    }


                    // Update Tasks
                    $scope.submit = function () {
                        if ($scope.task.id === 0) {
                            $scope.task.id = new Date().getTime();
                            $scope.task.createdby.name = $scope.user.name;
                            $scope.task.createdby.id = $scope.user.id;
                            $scope.task.group = $scope.user.group.active.id;
                            $scope.task.location = 'active';
                        }

                        $scope.task.editable = false;
                        let newTask = JSON.stringify($scope.task);
                        newTask = JSON.parse(newTask);

                        $scope.$emit('newTaskData', newTask);
                    }

                    // Accept/Return Task
                    $scope.accept = function (status) {

                        // Accept/Decline Task by user
                        $scope.task.assignee = {
                            name:   status === false ? 'available' : $scope.user.name,
                            id:     status === false ? '' : $scope.user.id,
                            start:  status === false ? '' : new Date().getTime() }

                        let newTask = $scope.task;
                        $scope.$emit('newTaskData', newTask);


                        // Add/Remove User from currentTask
                        let allUserTasks = $scope.user.tasks ? $scope.user.tasks : {};
                        let taskList = {};
                        Object.keys(allUserTasks).forEach((thisTask) => {
                            if (allUserTasks[thisTask]['id'] != $scope.task.id) {
                                taskList[allUserTasks[thisTask]['id']] = allUserTasks[thisTask];
                            }
                        });

                        let compareTasksBefore = JSON.stringify(allUserTasks);
                        let compareTasksAfter = JSON.stringify(taskList);
                        if (compareTasksBefore === compareTasksAfter) {
                            taskList[$scope.task.id] = {
                                id: $scope.task.id,
                                started: new Date().getTime(),
                                task: {
                                    title: $scope.task.title,
                                    id: $scope.task.id,
                                    location: $scope.task.location,
                                    urgency: $scope.task.urgency,
                                    group: $scope.task.group
                                }
                            }
                        }
                        $scope.$emit('updateMyTasks', taskList);


                        // Update Task user of current users decision involving this task
                        let taskState = (compareTasksBefore != compareTasksAfter) ? 'declined' : 'accepted';
                        let messageToSend = $scope.user.name + ' has ' + taskState + ' task :' + $scope.task.title;
                        let commentData = _buildComment(messageToSend);
                            commentData.for = _listMembers();

                        $scope.$emit('notifyTaskHolders', commentData);
                    }


                    // Comments
                    $scope.addComment = function (userComment) {
                        let commentData = _buildComment(userComment.message);
                            commentData.for = _listMembers();
                        $scope.$emit('addComment', commentData);
                    }

                    // Reply to Comments
                    $scope.replyToComment = function (replyData, commentData) {
                        let replyToComment = _buildComment(replyData.message);
                            replyToComment.origin = commentData.id;
                            replyToComment.for = _listMembers('AllUsersInThread', commentData.reply);
                        $scope.$emit('addReply', replyToComment);
                    }


                    $scope.deleteTodo = function () {
                        // Delete Task
                        let thisTask = {
                                id: $scope.task.id,
                                group: $scope.task.group,
                                location: $scope.task.location,
                                users: _listMembers('AllUsersInTask') }

                        $scope.$emit('deleteTask', thisTask);
                    }

                    $scope.moveTodo = function (moveStatus) {
                        // Move Task
                        $scope.task.move = {
                            status : moveStatus,
                            activity: $scope.task.isActive,
                            location: ($scope.task.isActive === true) ? moveStatus : 'active',
                            date: new Date().getTime()
                        };
                        $scope.task.location = ($scope.task.isActive === true) ? 'active' : moveStatus;
                        $scope.task.users = _listMembers('AllUsersInTask');
                        $scope.task.isActive = $scope.task.isActive === true ? false : true;

                        // Update users of task status
                        let massMessage = {
                            hold: $scope.task.title + ' has been placed on hold',
                            complete: $scope.task.title + ' is now complete',
                            tasks: $scope.task.title + ' has been reactivated'
                        };

                        let commentData = _buildComment(massMessage[$scope.task.move.location]);
                            commentData.for = $scope.task.users;
                            commentData.task.location = $scope.task.move.location;
                        $scope.task.updateContributers = commentData;
                        $scope.$emit('updateTaskActivity', $scope.task);

                        // De/Re Activate Task for TaskHolders
                        let taskUpdate = {
                            users: ($scope.task.assignee.name != 'available') ? [$scope.task.assignee.id] : [],
                            id: $scope.task.id,
                            location: $scope.task.move.location
                        };
                        $scope.$emit('updateTaskLocationChange', taskUpdate);
                    }


                function _buildComment(messageData) {
                    let comment = {
                        id: new Date().getTime(),
                        name: $scope.user.name,
                        from: $scope.user.id,
                        task: {
                            title: $scope.task.title,
                            id: $scope.task.id,
                            location: $scope.task.isActive === true ? 'active' : $scope.task.move.location,
                            group: $scope.user.group
                        },
                        message: messageData
                    }

                    return comment;
                }

                function _listMembers(condition, commentId) {
                    let state = [
                        'AllUsersInTask',
                        'AllUsersInThread'
                    ];

                    let UserMembers = [];

                    // If user is not the creator
                    if ($scope.user.id != $scope.task.createdby.id) {
                        UserMembers[0] = $scope.task.createdby.id;
                    }

                    // If user is not the assignee
                    if ($scope.user.id != $scope.task.assignee.id &&
                        $scope.task.assignee.name != 'available') {
                        UserMembers[0] = $scope.task.assignee.id;
                    }

                    // If user wants to notify all first commenters in the task
                    if (condition === state[0]) {
                        let checkIfUserExists;
                        Object.keys($scope.task.comments).forEach((comment) => {
                            for (let i = 0; i < UserMembers.length; i++) {
                                if (UserMembers[i] === $scope.task.comments[comment]['from']) {
                                    checkIfUserExists = true; }
                            }

                            if (!checkIfUserExists &&
                                $scope.task.comments[comment]['from'] != $scope.user.id) {
                                    UserMembers[UserMembers.length] = $scope.task.comments[comment]['from']; }
                        });
                    }

                    // If user wants to notify all commenters in the thread
                    if (condition === state[1]) {
                        let checkIfUserExists;
                        if ($scope.task.comments &&
                            $scope.task.comments[commentId] &&
                            $scope.task.comments[commentId]['reply']) {
                            Object.keys($scope.task.comments[commentId]['reply']).forEach((comment) => {
                                for (let i = 0; i < UserMembers.length; i++) {
                                    if (UserMembers[i] === $scope.task.comments[commentId]['reply'][comment]['from']) {
                                        checkIfUserExists = true;
                                    }
                                }

                                if (!checkIfUserExists &&
                                    $scope.task.comments[commentId]['reply'][comment]['from'] != $scope.user.id) {
                                    UserMembers[UserMembers.length] = $scope.task.comments[commentId]['reply'][comment]['from'];
                                }
                            });
                        } else {
                            if ($scope.task.comments &&
                                $scope.task.comments[commentId] &&
                                $scope.task.comments[commentId]['from'] != $scope.user.id) {
                                UserMembers[UserMembers.length] = $scope.task.comments[commentId]['from']; }
                        }
                    }

                    return UserMembers;

                }

            },

            templateUrl: 'template/todo.html',
            replace: true
        }
    });