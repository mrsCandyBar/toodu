
class Query {

	data(database, url) {
		let retrievedData = new Promise((resolve) => {
			database.ref(url).once('value').then(function(snapshot) {
				resolve(snapshot.val());
			});
		});

		return retrievedData;
	}

	dataWithSpecificResults(database, url, property, value) {
		let retrievedData = new Promise((resolve) => {
			database
				.ref(url)
				.orderByChild(property)
				.equalTo(value)
				.once('value').then(function(snapshot) {
					resolve(snapshot.val());
			});
		});

		return retrievedData;
	}

	dataAndsubscribeToUpdates(database, url) {
		let data = new Promise((resolve, reject) => {
			database.ref(url).on('value', function(snapshot) {
				resolve(snapshot.val());

			}, function(err) {
				reject('data >>> denied retrieval and subscription', err);
			});
		});

		return data;
	}

	dataAndsubscribeToUpdatesForSpecificResults(database, url, property, value) {
		let data = new Promise((resolve, reject) => {
			database
				.ref(url)
				.orderByChild(property)
				.equalTo(value)
				.on('value', function(snapshot) {
					resolve(snapshot.val()); //see .indexOn to add to rules for large DB queries

			}, function(err) {
				reject('data >>> denied retrieval and subscription', err);
			});
		});

		return data;
	}

	unsubscribeFromUpdates(database, url) {
		let data = new Promise((resolve, reject) => {
			database.ref(url).off('value', function(snapshot) {
				resolve('data >>> unsubscribed', snapshot.val());

			}, function(err) {
				reject('data >>> unsubscribe error', err);
			});	
		});

		return data;
	}
}

module.exports = new Query();