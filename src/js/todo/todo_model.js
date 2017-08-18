import ModelProto from './model.js';

class TodoModel extends ModelProto {

	constructor(rawObj) {
		super();

		this.id = '';
		this.createdby = {
			name: '',
			id: '',
		};
        this.assignee = {
        	name: 'available',
			id: '',
			start: '',
			end: ''
		};
		this.title = 'Your Title goes here...';
		this.description = 'Your description starts here, click to select the text of the title and of the description';
		this.organisation = '';
		this.status = 'Waiting';
		this.urgency = 'Waiting';
		this.comments = 0;
		this.isActive = true;
		this.editable = true;
		this.location = '';
		this.getDate();
		this.createModel(rawObj);
	}

	getDate() {
		let startDate = new Date().getFullYear() + '-';
        	startDate += (new Date().getMonth() + 1) + '-';
        	startDate += new Date().getDate();

        this.dateStart = startDate;
        this.dateEnd = startDate;
	}

	getStates(property) {
		let states = {
			status: 	['Waiting', 'Busy', 'Done', 'Completed', 'Hold'],
			urgency: 	['Waiting', 'Important', 'Urgent', 'Done', 'Hold']
		}
		return states;
	}
}

module.exports = TodoModel;