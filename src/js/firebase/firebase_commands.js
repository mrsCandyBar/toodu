
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

	updateTask(database, taskId, taskData, newLocation) {
		let location = newLocation ? newLocation : 'tasks';
		database.ref(location + '/' + taskId).update({
			id: taskData.id,
			createdby: taskData.createdby,
            assignee: taskData.assignee,
			title: taskData.title,
			description: taskData.description,
			organisation: taskData.organisation,
			status: taskData.status,
			comments: taskData.comments,
			isActive: taskData.isActive,
            editable: false,
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

    updateUserNotification(database, taskUpdate, userId) {
        database.ref('users/' + userId + '/notify/' + taskUpdate.date).update({
            assigneeId: taskUpdate.taskAssignee.id,
            assigneeName: taskUpdate.taskAssignee.name,
			taskId: taskUpdate.taskId,
			taskName: taskUpdate.taskName,
			date: taskUpdate.date
        });
    }

    removeUserNote(database, note, userId) {
        database.ref('users/' + userId + '/notify/' + note).remove();
    }

	deleteTask(database, taskId, location) {
		database.ref(location + '/' + taskId).remove();
	}

	moveTask(database, taskId, taskData, newLocation) {
		let removeLocation = newLocation === 'archive' ? 'tasks' : 'archive';
		taskData.isActive = (newLocation === 'archive') ? false : true;
		
		this.updateTask(database, taskId, taskData, newLocation);
		this.deleteTask(database, taskId, removeLocation);
	}

	// Comments
	addCommentToTask(database, taskId, commentData) {
		database.ref('tasks/' + taskId + '/comments/' + commentData.id).update({
			id: commentData.id,
			from: commentData.from,
			name: commentData.name,
			message: commentData.message,
			reply: {}
		});
	}

    notifyTaskHolders(database, commentData) {

		for (let i = 0; i < commentData.for.id.length; i++) {
            database.ref('users/' + commentData.for.id[i] + '/notify/' + commentData.date).update({
                id: commentData.date,
                from: commentData.from,
                name: commentData.name,
                message: commentData.message,
                for: commentData.for,
                date: commentData.date,
				task: {
					title: commentData.for.taskTitle,
					id: commentData.id
				}
            });
		}
    }

    addReplyAndNotifyCommenter(database, replyData) {
		this.addReplyToCommentInTask(database, replyData.task.id, replyData.for.commentId, replyData.id, replyData);
        for (let i = 0; i < replyData.for.id.length; i++) {
            database.ref('users/' + replyData.for.id[i] + '/notify/' + replyData.id).update({
                id: replyData.id,
                from: replyData.from,
                name: replyData.name,
                message: replyData.message,
                for: replyData.for,
                date: replyData.date,
				task: replyData.task
            });
        }
	}

	addReplyToCommentInTask(database, taskId, commentId, replyId, replyData) {
		database.ref('tasks/' + taskId + '/comments/' + commentId + '/reply/' + replyId).update({
			id: replyData.id,
			from: replyData.from,
			name: replyData.name,
			message: replyData.message
		});
	}
}

module.exports = new Command();