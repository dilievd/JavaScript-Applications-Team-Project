// organizer-list.js
Organizer.EntryList = Class.create({
	initialize: function(title){
		this.title = title;
		this.data = [];
		return this;
	},
	addEntry: function(entry){
		this.data.push(entry);

		return this;
	}
});