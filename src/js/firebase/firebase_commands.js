
class Command {
	
	addUser(database, userId, userData) {
		database.ref('users/' + userId).set({
			id: userId,
			name: userData.name,
			email: userData.email,
			organisation: userData.organisation,
			admin: userData.admin,
			password: userData.password
		});
	}

	updateUser(database, userId, userData) {
		database.ref('users/' + userId).update({
			id: userId,
			name: userData.name,
			email: userData.email,
			organisation: userData.organisation,
			admin: userData.admin
		});
	}

	removeUser(database, userId) {
		database.ref('users/' + userId).remove();
	}

	updateTask(database, taskId, taskData, newLocation) {
		let location = newLocation ? newLocation : 'tasks';
		database.ref(location + '/' + taskId).update({
			id: taskData.id,
			userid: taskData.userid,
			username: taskData.username,
			title: taskData.title,
			description: taskData.description,
			organisation: taskData.organisation,
			status: taskData.status,
			comments: taskData.comments,
			isActive: taskData.isActive,
			urgency: taskData.urgency,
			dateStart: taskData.dateStart,
			dateEnd: taskData.dateEnd
		});
	}

	deleteTask(database, taskId, location) {
		database.ref(location + '/' + taskId).remove();
		console.log('task deleted >>>', location)
	}

	moveTask(database, taskId, taskData, newLocation) {
		let removeLocation = newLocation === 'archive' ? 'tasks' : 'archive';
		taskData.isActive = (newLocation === 'archive') ? false : true;
		
		this.updateTask(database, taskId, taskData, newLocation);
		this.deleteTask(database, taskId, removeLocation);
	}

	// Comments
	addCommentToTask(database, taskId, commentData, commentId) {
		database.ref('tasks/' + taskId + '/comments/' + commentId).update({
			id: commentId,
			from: commentData.from,
			name: commentData.name,
			message: commentData.message,
			reply: {},
		});

		console.log('çomment added');
	}

	addReplyToCommentInTask(database, taskId, comment, replyData, replyId) {
		database.ref('tasks/' + taskId + '/comments/' + comment + '/reply/' + replyId).update({
			id: replyId,
			from: replyData.from,
			name: replyData.name,
			message: replyData.message,
			reply: {}
		});

		console.log('reply added');
	}
}

module.exports = new Command();