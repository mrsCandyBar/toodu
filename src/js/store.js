class Store {
    constructor() {
        this.allFilters = {};
        this.allTasks = {};
        this.currentTask = {};
        this.taskFilters = {};
        this.user;
    }
}

module.exports = new Store();