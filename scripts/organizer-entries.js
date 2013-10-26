// organizer-entries.js
Organizer.Entries = (function () {

    var Entry = Class.create({
        initialize: function (title, description, priority) {
            this.title = title;
            this.description = description;
            this.priority = priority;
            this.active = true;

            return this;
        },
        // Returns a json suitable for saving into the DB.
        reformatForDB: function (json) {
            json.priority = parseInt(json.priority);
            return json;
        },
        // Loads the properties in the given object from a json coming from the db.
        loadFromDB: function (dbJson) {
            this.title = dbJson.title;
            this.description = dbJson.description;
            this.priority = dbJson.priority;
            this.active = dbJson.active;
            return this;
        },
    });

    var Task = Class.create(Entry, {
        initialize: function ($super, title, description, priority, endDate) {
            $super(title, description, priority);
            this.endDate = endDate;
            return this;
        },
        reformatForDB: function ($super, json) {

            var json = $super(json);

            var endDate = this.endDate;
            json.enddate_day = endDate.getUTCDate() + 1;
            json.enddate_month = endDate.getMonth() + 1;
            json.enddate_year = endDate.getUTCFullYear();

            return json;
        },
        loadFromDB: function ($super, json) {
            $super(json);
            this.endDate = new Date(
                json.enddate_year,
                json.enddate_month,
                json.enddate_day);
            return this;
        },
    });

    var Event = Class.create(Entry, {
        initialize: function ($super, title, description, priority, startDate, endDate, location) {
            $super(title, description, priority);
            this.startDate = startDate;
            this.endDate = endDate;
            this.location = location;

            return this;
        },
        reformatForDB: function ($super, json) {
            debugger
            var json = $super(json);
            var startDate = this.startDate;
            json.startdate_day = startDate.getUTCDate() + 1;
            json.startdate_month = startDate.getMonth() + 1;
            json.startdate_year = startDate.getUTCFullYear();
            var endDate = this.endDate;
            json.enddate_day = endDate.getUTCDate() + 1;
            json.enddate_month = endDate.getMonth() + 1;
            json.enddate_year = endDate.getUTCFullYear();
            json.enddate_year = endDate.getUTCFullYear();
            json.location = this.location;

            return json;
        },
        loadFromDB: function ($super, json) {

            $super(json);
            this.startDate = new Date(
                json.startdate_year,
                json.startdate_month,
                json.startdate_day);
            this.endDate = new Date(
                json.enddate_year,
                json.enddate_month,
                json.enddate_day);

            this.location = json.location;
            return this;
        },
    });

    var Anniversary = Class.create(Entry, {
        initialize: function ($super, title, description, priority, date) {
            $super(title, description, priority);
            this.date = date;
            return this;
        },
        reformatForDB: function ($super, json) {

            var json = $super(json);
            var date = this.date;
            json.date_day = date.getUTCDate() + 1;
            json.date_month = date.getMonth() + 1;
            json.date_year = date.getUTCFullYear();

            return json;
        },
        loadFromDB: function ($super, dbJson) {

            $super(dbJson);
            this.date = new Date(
                dbJson.date_year,
                dbJson.date_month,
                dbJson.date_day);
            return this;
        },
    });

    var Priority = {
        Low: 1,
        Normal: 2,
        High: 3
    };

    return {
        Task: Task,
        Event: Event,
        Anniversary: Anniversary,
        Priority: Priority
    }
})();