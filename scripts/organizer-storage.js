// organizer-storage.js
Organizer.Storage = (function () {
    var LocalStorage = {};

    var organizerDBObject =
        [{
            'id': 1,
            'type': 'task',
            'title': "Throw the garbage.",
            'enddate_day': 30,
            'enddate_month': 6,
            'enddate_year': 2013,
            'priority': 1,
            'active': true,
            'description': 'The full description for this entry.'
        },
        {
            'id': 2,
            'type': 'event',
            'title': "Mountain adventure with the group.",
            'startdate_day': 25,
            'startdate_month': 6,
            'startdate_year': 2013,
            'enddate_day': 29,
            'enddate_month': 6,
            'enddate_year': 2013,
            'priority': 2,
            'active': true,
            'description': 'This is, once again, our regular walk/climb in the ' +
            'mountain, me and my buddies: John, Jack, Mathew and Bachi Kiko.',
            'location': 'Bulgaria, Vitosha'
        },
                {
                    'id': 3,
                    'type': 'anniversary',
                    'title': "Andi\'s BDay",
                    'date_day': 14,
                    'date_month': 7,
                    'date_year': 2013,
                    'priority': 2,
                    'active': true,
                    'description': ''
                },
                {
                    'id': 4,
                    'type': 'task',
                    'title': "Make (buy) dinner for the honey.",
                    'enddate_day': 30,
                    'enddate_month': 6,
                    'enddate_year': 2013,
                    'priority': 2,
                    'active': false,
                    'description': ''
                },
                {
                    'id': 5,
                    'type': 'task',
                    'title': "Get the dog for a walk.",
                    'enddate_day': 30,
                    'enddate_month': 6,
                    'enddate_year': 2013,
                    'priority': 3,
                    'active': true,
                    'description': ''
                },
                {
                    'id': 6,
                    'type': 'event',
                    'title': "A meeting of the vipusk.",
                    'startdate_day': 3,
                    'startdate_month': 07,
                    'startdate_year': 2013,
                    'enddate_day': 10,
                    'enddate_month': 07,
                    'enddate_year': 2013,
                    'priority': 2,
                    'active': true,
                    'description': '',
                    'location': 'Bulgaria, Sunny Beach'
                },
                {
                    'name': 'Default List',
                    'type': 'list',
                    'entries': [1, 2, 3] // list of entry IDs
                },
                {
                    'name': 'List 2',
                    'type': 'list',
                    'entries': [5, 6] // list of entry IDs
                }];


    var TaffyDB = (function () {

        // TODO: load from the local storage 
        var organizerDb = TAFFY(organizerDBObject);

        return {

            insertNewEntry: function (dataId, dbObject) {
                throw new Error('Not implemented.');
            },
            replaceEntryProperties: function (dataId, replacementJson) {
                organizerDb({ id: { '==': dataId } }).update(replacementJson);
            },
            getEntryByIDField: function (dataId) {
                var entry = organizerDb({ id : { '==': dataId } }).get()[0];
                return entry;
            },
            getEntryField: function (dataId, field) {
                var entry = organizerDb({ id: { '==': dataId } }).get()[0];
                var fieldValue = entry[field];
                return fieldValue;
            },
            getAllLists: function () {
                var lists = organizerDb({ type: 'list' }).get();
                return lists;
            },
            // Returns a collection of all organizer entries in the DB.
            getAllEntries: function () {
                var entries = organizerDb({ type: ['task', 'event', 'anniversary'] }).get();
                return entries;
            },
            // Returns a collection of all the entries for a given list in the DB.
            getListEntries: function (listName) {
                var listEntryIDs =
                    organizerDb({ type: 'list', name: listName }).first().entries;
                var entries = organizerDb({ type: ['task', 'event', 'anniversary'] },
                    { id: listEntryIDs }).get()
                //Organizer.getInstance().addList()
                return entries;
            },

            // currently unused:
            getEntriesTillEndOfDay: function () {

                // for the current day month and year
                var day = date.getUTCDate();
                var month = date.getMonth() + 1;
                var year = date.getUTCFullYear();

                var entries = organizer_db(
                [   // and one of those: 
                    { startdate_day: day },
                    { enddate_day: day },
                    { date_day: day }],
                [   // and one of those: 
                    { enddate_month: month },
                    { date_month: month }
                ],
                [   // and one of those: 
                    { enddate_year: { '==': year } },
                    { date_year: { '==': year } }
                ]).get();
                return entries;
            },
            getEntriesTillEndOfMonth: function () {
                var day = date.getUTCDate();
                var month = date.getMonth() + 1;
                var year = date.getUTCFullYear();
                var daysInMonth = new Date(year, month, 0).getDate();

                var monthEntries = organizer_db(
                [   // one of those: 
                    { enddate_day: { '<=': daysInMonth, '>=': day } }, // or
                    { date_day: { '<=': daysInMonth, '>=': day } }
                ],
                [   // and one of those: 
                    { enddate_month: month },
                    { date_month: month }
                ],
                [   // and one of those: 
                    { enddate_year: year },
                    { date_year: year }
                ]).get();
                return monthEntries;
            }
        }
    })();



    return {
        LocalStorage: LocalStorage,
        GetOrganizerDataFromLocalStorage: function () {
            return organizerDBObject;
        },
        TaffyDB: TaffyDB
    }
})();