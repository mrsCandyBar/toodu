class UserModel {

    constructor(rawObj) {
        this.description = 'All purple text can be replaced';
        this.email = '';
        this.group = {
            active: rawObj.id,
            list: this._retrieveGroups(rawObj.group.list ? rawObj.group.list : []),
        };
        this.id = '';
        this.name = '';
        this.notify = {};
        this.tasks = {};
        this.update = {
            name: rawObj.name,
            description: rawObj.description
        }
        this.createModel(rawObj);
    }

    createModel(rawObj) {
        Object.keys(rawObj).forEach((rawObjKey) => {
            Object.keys(this).forEach((modelKey) => {
                if (modelKey === rawObjKey) {
                    this[modelKey] = rawObj[rawObjKey];
                }
            });
        });
    }

    _retrieveGroups(rawObj) {
        if (rawObj && rawObj !== null && typeof rawObj === 'object') {
            let buildMap = [];

            Object.keys(rawObj).forEach((todoObj) => {
                let currentTodo = rawObj[todoObj];
                buildMap[buildMap.length] = currentTodo;
            });

            return buildMap;

        } else {
            return [];
        }
    }
}

module.exports = UserModel;