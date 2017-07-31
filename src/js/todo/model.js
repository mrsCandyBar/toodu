
class ModelProto {

	createModel(rawObj) {
		Object.keys(rawObj).forEach((rawObjKey) => {
			Object.keys(this).forEach((modelKey) => {
				if (modelKey === rawObjKey) {
					this[modelKey] = rawObj[rawObjKey];
				}
			});
		});
	}

	getModelFilters() {
		let filters = [];
		Object.keys(this).forEach((key) => {
			filters[filters.length] = key;
		});
		return filters;
	}
}

module.exports = ModelProto;