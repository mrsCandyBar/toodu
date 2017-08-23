class Store {
    constructor() {
        this.allFilters = {};
        this.allTasks = [];
        this.currentTask = {};
        this.taskFilters = {};
        this.allGroups = {};
        this.user;
    }
}

module.exports = new Store();