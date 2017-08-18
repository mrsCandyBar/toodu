
class Command {
	
	addUser(database, userId, userData) {
		database.ref('users/' + userId).set({
			id: userId,
			name: userData.name,
			email: userData.email,
			organisation: userData.organisation,
			password: userData.password
		});
	}

	updateUser(database, userId, userData) {
		database.ref('users/' + userId).update({
			id: userId,
			name: userData.name,
			email: userData.email,
			organisation: userData.organisation
		});
	}

	removeUser(database, userId) {
		database.ref('users/' + userId).remove();
	}

	updateTask(database, taskData) {
		database.ref('tasks/' + taskData.organisation + '/' + taskData.location + '/' + taskData.id).update({
			id: taskData.id,
			createdby: taskData.createdby,
            assignee: taskData.assignee,
			title: taskData.title,
			description: taskData.description,
			organisation: taskData.organisation,
			status: taskData.status,
			comments: taskData.comments,
			isActive: taskData.move ? taskData.move : taskData.isActive,
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
		database.ref('tasks/' + taskData.organisation + '/' + taskData.location + '/' + taskData.id).remove();
		for (let i = 0; i < taskData.users.length; i++) {
            this.removeUserNotesForTask(database, taskData.users[i], taskData.id);
        }
	}

	moveTask(database, taskData) {
		let taskId = taskData.id;
		let newLocation = taskData.move.location;
		let removeLocation = (newLocation === 'active') ? newLocation : 'active';

        taskData.location = newLocation;
		this.updateTask(database, taskData);
        taskData.location = removeLocation;
		this.deleteTask(database, taskData);
	}

	// Comments
	addCommentToTask(database, commentData) {
		let url = 'active/' + commentData.task.id + '/comments/' + commentData.id;
		if (commentData.origin) { url = 'active/' + commentData.task.id + '/comments/' + commentData.origin + '/reply/' + commentData.id; }

		database.ref('tasks/' + commentData.task.org + '/' + url).update({
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
					org: commentData.task.org
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