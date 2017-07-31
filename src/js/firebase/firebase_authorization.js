
class Authorize {

	signIn(auth, userData) {
		let signInStatus = new Promise((resolve, reject) => {
			auth.signInWithEmailAndPassword(userData.email, userData.password).then((response) => { 
				resolve(response);

			}, (error) => {
				reject(error)
			});
		});

		return signInStatus;
	}

	signOut(auth) { 
		let signOutStatus = new Promise((resolve, reject) => {
			auth.signOut().then(function() { 
				resolve('sign out >>> passed');

			}).catch(function(error) {
				reject('sign out >>> failed', error);
			});
		});

		return signOutStatus;
	};

	state(auth) {
		let authState = new Promise((resolve, reject) => {
			auth.onAuthStateChanged(function(user) {
				if (user) {
					resolve(user);
					
				} else {
					reject('auth state >>> signed out', user);
				}
			});
		});

		return authState;
	};
	//checkAuthState >> listenToDB();

	reAuthenticate(user, credential) {
		let reAuthStatus = new Promise((resolve, reject) => {
			if (user) {
				user.reauthenticate(credential).then(function() {
					resolve('reauthenticate >>> passed');

				}, function(error) {
					reject('reauthenticate >>> failed');
				});
			}
			reject('reauthenticate >>> failed');
		});

		return reAuthStatus;
	}
}

module.exports = new Authorize();