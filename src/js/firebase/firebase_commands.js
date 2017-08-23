
class Command {
	
	addUser(database, userId, userData) {
		database.ref('users/' + userId).set({
			id: userId,
			name: userData.name,
			email: userData.email,
			password: userData.password,
			group: {
				active: {
					id: userId
				},
			},
            description: 'Your description goes here, hit the edit button beside your name to edit your details.',

		});
	}

    addGroup(database, groupId, groupData) {
        database.ref('groups/' + groupId).set({
            id: groupId,
            description: 'click to select and edit all purple text. \n' +
                            'A description of your group should go here',
            name: groupData.name,
            email: groupData.email,
            password: groupData.password,
            group: {
                active: {
                    id: groupId
                },
            },
        });
    }

    updateUser(database, userData) {
		database.ref('users/' + userData.id).update({
			name: userData.update.name ? userData.update.name : userData.name,
			email: userData.update.email ? userData.update.email : userData.email,
            description: userData.update.description ? userData.update.description : userData.description
		});
	}

    updateUserGroup(database, userData) {
        database.ref('users/' + userData.id + '/group').update({
            active: {
                id: userData.group.active.id,
                name: userData.group.active.name
            },
			hideGroup: userData.hideGroup ? userData.hideGroup : ''
        });
    }

    sendMemberRequest(database, memberRequest) {
        database.ref('groups/' + memberRequest.group.id + '/members/requests/' + memberRequest.id).update({
			name: memberRequest.name,
			email: memberRequest.email,
			id: memberRequest.id
		});
    }

    memberRequest(database, groupData) {
        if (groupData.status === 'remove') {
            database.ref('groups/' + groupData.id + '/members/active/' + groupData.member.id).remove();
            database.ref('users/' + groupData.member.id + '/group/list/' + groupData.id).remove();

        } else {
            if (groupData.status === 'accept') {
                database.ref('groups/' + groupData.id + '/members/active/' + groupData.member.id).update({
                    name: groupData.member.name,
                    email: groupData.member.email,
                    id: groupData.member.id
                });

                database.ref('users/' + groupData.member.id + '/group/list/' + groupData.id).update({
                    name: groupData.name,
                    id: groupData.id
                });
            }
            database.ref('groups/' + groupData.id + '/members/requests/' + groupData.member.id).remove();
        }
        this.sendUserNotification(database, groupData.notify);
	}

    removeMember(database, memberData) {
        database.ref('groups/' + memberData.group.id + '/members/active/' + memberData.id).remove();
        database.ref('users/' + memberData.id + '/group/list/' + memberData.group.id).remove();
    }

	removeUser(database, userId) {
		database.ref('users/' + userId).remove();
	}

	updateTask(database, taskData) {
		database.ref('tasks/' + taskData.group + '/' + taskData.location + '/' + taskData.id).update({
			id: taskData.id,
			createdby: taskData.createdby,
            assignee: taskData.assignee,
			title: taskData.title,
			description: taskData.description,
            group: taskData.group,
			status: taskData.status,
			comments: taskData.comments,
			isActive: taskData.isActive,
			move: taskData.move ? taskData.move : {},
            editable: false,
            location: taskData.location,
			urgency: taskData.urgency,
			dateStart: taskData.dateStart,
			dateEnd: taskData.dateEnd
		});
	}

    updateMyTasks(database, watchTasks, userId) {
        database.ref('users/' + userId).update({
            tasks: watchTasks,
        });
    }
    updateTaskHoldersOfLocationChange(database, taskData) {
		for (let i = 0; i < taskData.users.length; i++) {
			database.ref('users/' + taskData['users'][i] + '/tasks/' + taskData['id'] + '/task/').update({
                location: taskData['location'],
            });
		}
	}

	deleteTask(database, taskData) {
		database.ref('tasks/' + taskData.group + '/' + taskData.location + '/' + taskData.id).remove();
		for (let i = 0; i < taskData.users.length; i++) {
            this.removeUserNotesForTask(database, taskData.users[i], taskData.id);
        }
	}

	moveTask(database, taskData) {
		let taskId = taskData.id;
		let newLocation = taskData.move.location;
		let removeLocation = taskData.location;

        taskData.location = newLocation;
		this.updateTask(database, taskData);
        taskData.location = removeLocation;
		this.deleteTask(database, taskData);
	}

	// Comments
	addCommentToTask(database, commentData) {
		let url = 'active/' + commentData.task.id + '/comments/' + commentData.id;
		if (commentData.origin) { url = 'active/' + commentData.task.id + '/comments/' + commentData.origin + '/reply/' + commentData.id; }

		database.ref('tasks/' + commentData.task.group + '/' + url).update({
			id: commentData.id,
			from: commentData.from,
			name: commentData.name,
			message: commentData.message,
			reply: {}
		});
	}

	// Notes
    sendUserNotification(database, commentData) {
        for (let i = 0; i < commentData.for.length; i++) {
            database.ref('users/' + commentData.for[i] + '/notify/' + commentData.task.id + '/' + commentData.id).update({
                id: commentData.id,
                from: commentData.from,
                name: commentData.name,
                message: commentData.message,
                for: commentData.for,
                task: {
                    title: commentData.task.title,
                    id: commentData.task.id,
					location: commentData.task.location,
                    group: commentData.task.group
                }
            });
        }
    }

    addReplyAndNotifyCommenter(database, replyData) {
		this.addCommentToTask(database, replyData);
        this.sendUserNotification(database, replyData);
	}

    removeUserNotesForTask(database, userId, noteId) 	{ database.ref('users/' + userId + '/notify/' + noteId).remove(); }
    removeSingleUserNote(database, note) 				{ database.ref('users/' + note.for[0] + '/notify/' + note.task.id + '/' + note.id).remove();
    }
}

module.exports = new Command();