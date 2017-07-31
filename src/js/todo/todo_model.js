import ModelProto from './model.js';

class TodoModel extends ModelProto {

	constructor(rawObj) {
		super();
		this.id = '';
		this.user = '';
		this.username = '';
		this.title = '';
		this.description = '';
		this.organisation = '';
		this.status = 'Waiting';
		this.urgency = 'Waiting';
		this.comments = 0;
		this.isActive = true;
		this.dateStart = '';
		this.dateEnd = '';
		this.createModel(rawObj);
	}

	getStates(property) {
		let states = {
			status: 	['Waiting', 'Busy', 'Done', 'Hold'], 
			urgency: 	['Waiting', 'Important', 'Urgent', 'Done', 'Hold']
		}
		return states;
	}
}

module.exports = TodoModel;