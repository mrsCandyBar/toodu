
class User {

	create(user) {
		let newUser = new Promise((resolve, reject) => {
			if (user.email && user.password) {
				firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
					.then((data) => {
						resolve(data);

					}, (error) => {
						reject(error)
					});
			} else {
				reject('Empty Data');
			}
		});

		return newUser;
	}

	update(user, displayName, photoURL) {
		let updates = new Promise((resolve, reject) => {
			user.updateProfile({
				displayName,
				photoURL
			}).then(function(data) {
				resolve(firebase.auth().currentUser);

			}, function(error) {
				reject(error);
			});
		});

		return updates;
	}

	changePassword(newPassword) {
		let passwordStatus = new Promise ((resolve, reject) => {
			firebase.auth().currentUser.updatePassword(newPassword).then(function() {
				resolve('user >>> password updated');

			}, function(error) {
				reject('user >>> password update failed', error);
			});
		});

		return passwordStatus;
	}

	changeEmailAddress(email) {
		let resetEmail = new Promise ((resolve, reject) => {
			firebase.auth().sendPasswordResetEmail(email).then(function() {
				resolve('user >>> password sent');

			}, function(error) {
				reject('user >>> password email failed', error);
			});
		});

		return resetEmail;
	}
}

module.exports = new User();