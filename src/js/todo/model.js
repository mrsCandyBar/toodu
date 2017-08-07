
class ModelProto {

	createModel(rawObj) {
		Object.keys(rawObj).forEach((rawObjKey) => {
			/*console.log('rawObj >>> model', rawObjKey);*/
			Object.keys(this).forEach((modelKey) => {
				if (modelKey === rawObjKey) {
					this[modelKey] = rawObj[rawObjKey];
				}
			});
		});
	}

	getModelFilters(rawObj) {
		let filters = [];
		Object.keys(rawObj).forEach((key) => {
			filters[filters.length] = key;
		});
		return filters;
	}
}

module.exports = ModelProto;