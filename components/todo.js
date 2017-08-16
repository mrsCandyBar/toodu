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
                $scope.$watch('task.editable', function() {
                    if ($scope.task && $scope.task.editable) {
                        let unalteredTask = JSON.stringify($scope.task);
                        $scope.backup = unalteredTask;
                    }
                });

                // Toggle Task Edit Mode
                $scope.$watch('task.status', function() {
                    if ($scope.task && $scope.task.status != '..' && $scope.task.status != 'Waiting') {
                        let newTask = $scope.task;
                        $scope.$emit('newTaskData', newTask);
                    }
                });

                $scope.cancel = function() {
                    $scope.task = JSON.parse($scope.backup);

                    if ($scope.task && ($scope.task.id != 0)) {
                        $scope.task.editable = false;
                    }
                }


                // Update Tasks
                $scope.submit = function() {

                    if ($scope.task.id === 0) {
                        $scope.task.id = new Date().getTime();
                        $scope.task.createdby.name = $scope.user.name;
                        $scope.task.createdby.id = $scope.user.id;
                    }

                    $scope.task.editable = false;
                    let newTask = JSON.stringify($scope.task);
                    newTask = JSON.parse(newTask);

                    $scope.$emit('newTaskData', newTask);
                }

                // Accept/Return Task
                $scope.accept = function(status) {

                    // Accept/Decline Task by user
                    $scope.task.assignee.name    = status === false ? 'available' : $scope.user.name;
                    $scope.task.assignee.id      = status === false ? '' : $scope.user.id;
                    $scope.task.assignee.start   = status === false ? '' : new Date().getTime();

                    let newTask = $scope.task;
                    $scope.$emit('newTaskData', newTask);


                    // Add/Remove User from currentTask
                    let tasks = $scope.user.tasks ? $scope.user.tasks : [];
                    let taskList = [];
                    for (let i = 0; i < tasks.length; i++) {
                        if (tasks[i].id == $scope.task.id) {
                        } else {
                            taskList[taskList.length] = tasks[i];
                        }
                    }

                    if (taskList.length == tasks.length) {
                        taskList[tasks.length] = {
                            id: $scope.task.id,
                            started: new Date().getTime(),
                            title: $scope.task.title,
                            urgency: $scope.task.urgency
                        }
                    }
                    $scope.$emit('updateMyTasks', taskList);


                    // Update Task user of current users decision involving this task
                    let taskUpdate = {
                        taskCreator: $scope.task.createdby,
                        taskAssignee: $scope.task.assignee,
                        taskId: $scope.task.id,
                        taskName: $scope.task.title,
                        date: new Date().getTime()
                    }
                    $scope.$emit('updateTaskCreator', taskUpdate);
                }


                // Comments
                $scope.addComment = function(commentData) {
                    commentData.id = new Date().getTime();
                    commentData.name = !commentData.name ? $scope.user.name : commentData.name;
                    commentData.from = !commentData.from ? $scope.user.id : commentData.from;
                    commentData.task = {
                        title: $scope.task.title,
                        id: $scope.task.id
                    };
                    $scope.$emit('addComment', commentData);


                    // Notify Task Holders
                    let notifyNames = [];
                    let notifyIds = [];

                    // If commenter is a member of the task holders
                    if (($scope.user.id === $scope.task.createdby.id ||
                         $scope.user.id === $scope.task.assignee.id) &&
                        ($scope.task.assignee.name != 'available')

                    ) {
                        if ($scope.task.createdby.id != $scope.task.assignee.id) {
                            if ($scope.user.id === $scope.task.createdby.id) {
                                notifyNames[0] = $scope.task.assignee.name;
                                notifyIds[0] = $scope.task.assignee.id;
                            } else {
                                notifyNames[0] = $scope.task.createdby.name;
                                notifyIds[0] = $scope.task.createdby.id;
                            }
                        }
                    }

                    // Else commenter is not a member of the task holders
                    else if (   $scope.user.id != $scope.task.createdby.id &&
                                $scope.user.id != $scope.task.assignee.id) {

                        if ($scope.task.createdby.id === $scope.task.assignee.id) {
                            notifyNames[0] = $scope.task.assignee.name;
                            notifyIds[0] = $scope.task.assignee.id;

                        } else {
                            notifyNames[0] = $scope.task.createdby.name;
                            notifyIds[0] = $scope.task.createdby.id;

                            if ($scope.task.assignee.name != 'available') {
                                notifyNames[1] = $scope.task.assignee.name;
                                notifyIds[1] = $scope.task.assignee.id;
                            }
                        }
                    }

                    commentData.for = {
                        taskTitle: $scope.task.title,
                        name: notifyNames,
                        id: notifyIds
                    }

                    commentData.date = new Date().getTime();
                    $scope.$emit('notifyTaskHolders', commentData);
                }


                // Reply to Comments
                $scope.replyToComment = function(replyData, commentData) {
                    replyData.id = new Date().getTime();
                    replyData.name = $scope.user.name;
                    replyData.from = $scope.user.id;
                    replyData.task = {
                        title: $scope.task.title,
                        id: $scope.task.id
                    };

                    let replyToUsersInThread = [];
                    if (commentData.reply) {
                        Object.keys(commentData.reply).forEach((index) => {
                            if (commentData.reply[index]['from'] != $scope.user.id) {
                                let checkIfUserExists = false;
                                for (let user = 0; user < replyToUsersInThread.length; user++) {
                                    if (replyToUsersInThread[user] == commentData.reply[index]['from']) {
                                        checkIfUserExists = true;
                                    }
                                }

                                if (!checkIfUserExists) {
                                    replyToUsersInThread[replyToUsersInThread.length] = commentData.reply[index]['from'];
                                }
                            }
                        })

                    } else {
                        replyToUsersInThread = [commentData.from];
                    }

                    replyData.for = {
                        name: commentData.name,
                        id: replyToUsersInThread,
                        commentId: commentData.id
                    };

                    replyData.date = new Date().getTime();
                    $scope.$emit('addReply', replyData);
                }




                // Re/Move Task
                $scope.deleteTodo = function() {
                    $scope.$emit('deleteTask', $scope.task.id);
                }

                $scope.moveTodo = function() {
                    $scope.moveTodo($scope, $scope.Firebase, $scope.$route, $scope.$location)
                }

            },

            templateUrl: 'template/todo.html',
            replace: true
        }
    });


function _redirect($route, $location, routeValue) {
    if ($location && routeValue) { $location.path(routeValue); }
    $route.reload();
}