
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
				resolve('passed');

			}).catch(function(error) {
				reject('failed', error);
			});
		});

		return signOutStatus;
	};
}

module.exports = new Authorize();