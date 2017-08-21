
class Command {
	
	addUser(database, userId, userData) {
		database.ref('users/' + userId).set({
			id: userId,
			name: userData.name,
			email: userData.email,
			password: userData.password
		});
	}

    addGroup(database, groupId, groupData) {
        database.ref('users/' + groupId).set({
            id: groupId,
            name: groupData.name,
            email: groupData.email,
            password: groupData.password
        });
    }

    updateUser(database, userData) {
		database.ref('users/' + userData.id).update({
			name: userData.update.name ? userData.update.name : userData.name,
			group: userData.update.group ? userData.update.group : userData.group,
			email: userData.update.email ? userData.update.email : userData.email
		});
	}

    updateUserGroup(database, userData) {
        database.ref('users/' + userData.id).update({
            group: userData.group ? userData.group : userData.group,
            hideGroup: userData.hideGroup ? userData.hideGroup : ''
        });
    }

	removeUser(database, userId) {
		database.ref('users/' + userId).remove();
	}

	updateTask(database, taskData) {
		console.log('updates >>>', database, taskData)
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
		console.log('replyData >>', replyData);
		this.addCommentToTask(database, replyData);
        this.sendUserNotification(database, replyData);
	}

    removeUserNotesForTask(database, userId, noteId) 	{ database.ref('users/' + userId + '/notify/' + noteId).remove(); }
    removeSingleUserNote(database, note) 				{ database.ref('users/' + note.for[0] + '/notify/' + note.task.id + '/' + note.id).remove();
    }
}

module.exports = new Command();