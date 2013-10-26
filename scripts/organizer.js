// organizer.js
var Organizer = (function () {

    var singletonClass = Class.create({
        initialize: function () {

            this.editedEntryDBId = null;
            this.editedEntryObject = null;
            this.editedEntryType = null;

            var TaffyDB = Organizer.Storage.TaffyDB;
            var HtmlPatterns = Organizer.HtmlPatterns;

            // add lists from the database to the html
            var lists = TaffyDB.getAllLists();
            var listsHtml = HtmlPatterns.getHTMLByPatternForCollection(lists,
                HtmlPatterns.PatternEnum.ListButton,
                function (currentItem) {
                    var patternArgs = {
                        'listName': currentItem.name
                    };
                    return patternArgs;
                });
            $j('#organizer .main-sidebar .middle ul:first-child').append(listsHtml);

            // list all organizer entries 
            listAllEntries();

            this.initEvents();

            return this;
        },
        setEditedEntry: function (dbId, entryObject, entryType) {
            this.editedEntryDBId = dbId;
            this.editedEntryObject = entryObject;
            this.editedEntryType = entryType;
        },
        // Returns  an object { id, entry } of the currently 'edited' entry 
        // (defined by setEditedEntry)
        getEditedEntry: function () {
            return this.editedEntryObject;
        },
        getEditedEntryID: function () {
            return this.editedEntryDBId;
        },
        getEditedEntryType: function () {
            return this.editedEntryType;
        },
        initEvents: function () {

            var that = this;

            // list button - list entries
            $j('#organizer .main-sidebar .middle button').on('click', function (ev) {
                $j("#organizer .main-sidebar .middle .active").removeClass("active");
                $j(this).addClass('active');

                var TaffyDB = Organizer.Storage.TaffyDB;
                var HtmlPatterns = Organizer.HtmlPatterns;

                if ($j(ev.target).is('.all-lists')) {
                    listAllEntries()
                } else {
                    var listName = this.innerHTML;
                    var entries = TaffyDB.getListEntries(listName);
                    var listEntriesHtml = parseListingHTMLFromDBEntryCollectionData(entries);
                    $j('#list-container').html(listEntriesHtml);
                }
            });

            $j('#list-container').on('click', function (ev) {

                // expanding the map
                if ($j(ev.target).is('a.viewMap')) {

                    ev.preventDefault();
                    var entryId
                        = $j(ev.target).parent().parent().parent().attr('data-id');
                    var address = Organizer.Storage.TaffyDB.getEntryField(entryId,
                        'location');

                    $j('#organizer .map-overlay').remove();
                    $j('#organizer').append('<div class="map-overlay"></div>');

                    var geocoder;
                    var map;

                    geocoder = new google.maps.Geocoder();
                    var latlng = new google.maps.LatLng(42.3755, 25.1629);
                    var mapOptions = {
                        zoom: 8,
                        center: latlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    }
                    map = new google.maps.Map($j('#organizer .map-overlay').get(0),
                        mapOptions);

                    geocoder.geocode({ 'address': address }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            map.setZoom(13);
                            var marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location
                            });
                        } else {
                            // TODO - put an image 'location not found'
                        }
                    });
                } else if ($j(ev.target).is('#list-container li a')) {
                    // if any other anchor inside a listed entry,
                    // open the entry for editing
                    var target = ev.target;
                    var entryDBId = $j(target).parent().parent().attr('data-id');
                    var TaffyDB = Organizer.Storage.TaffyDB;
                    var Entries = Organizer.Entries;

                    var entryJson = TaffyDB.getEntryByIDField(entryDBId);
                    var entryType = entryJson.type;
                    var loadedEntry = null;
                    switch (entryType) {
                        case 'task':
                            loadedEntry = new Entries.Task().loadFromDB(entryJson);
                            break
                        case 'event':
                            loadedEntry = new Entries.Event().loadFromDB(entryJson);
                            break
                        case 'anniversary':
                            loadedEntry = new Entries.Anniversary().loadFromDB(entryJson);
                            break
                    }

                    that.setEditedEntry(entryDBId, loadedEntry, entryType);

                    // open the EDIT box, according to the given pattern:
                    var HtmlPatterns = Organizer.HtmlPatterns;
                    var editBoxHTML = HtmlPatterns.getHTMLByPatternArguments
                        (function () {
                            switch (entryType) {
                                case 'task':
                                    return HtmlPatterns.PatternEnum.FullEntryTask;
                                case 'event':
                                    return HtmlPatterns.PatternEnum.FullEntryEvent;
                                case 'anniversary':
                                    return HtmlPatterns.PatternEnum.FullEntryAnniversary; (entryJson);
                            }
                        }, function () {

                            // append the additional arguments for the pattern
                            entryJson.isLowSelected = (entryJson.priority == 1)
                                ? 'selected' : '';
                            entryJson.isNormalSelected = (entryJson.priority == 2)
                                ? 'selected' : '';
                            entryJson.isHighSelected = (entryJson.priority == 3)
                                ? 'selected' : '';

                            entryJson.startdate = entryJson.startdate_day + '.' +
                                entryJson.startdate_month + '.' +
                                entryJson.startdate_year;
                            entryJson.enddate = entryJson.enddate_day + '.' +
                                entryJson.enddate_month + '.' + entryJson.enddate_year;
                            entryJson.date = entryJson.date_day + '.'
                                    + entryJson.date_month + '.' + entryJson.date_year;

                            return entryJson;
                        });
                    // append the HTML of the edit box to the 
                    $j('#organizer .single-entry').remove();
                    $j('#organizer .adding-entry').remove();
                    $j('#organizer').append(editBoxHTML);

                    // reinitialize the datepicker
                    $j(function () {
                        $j(".datepicker").datepicker(
                            { dateFormat: "d.m.yy", minDate: new Date() });
                    });
                }

                // handling organizer onclick
                $j('#organizer').on('click', function (ev) {

                    var target = ev.target;
                    if (!($j(target).is('.viewMap'))) {
                        var parentoftarget = $j(ev.target).parents(".map-overlay");
                        if (parentoftarget.length == 0) {
                            $j('#organizer .map-overlay').remove();
                        }
                    }

                    if (!($j(target).is('#list-container li a, .single-entry'))) {
                        if ($j('.map-overlay').length == 0) {
                            if (!($j(target).is('.single-entry *'))) {

                                $j('.single-entry').remove();
                            }
                        }
                    }

                    // single entry - SAVE button 
                    if (($j(target).is('.single-entry .save.active'))) {
                        $j(target).removeClass('active').addClass('inactive');

                        // get the currently edited object and reformat it
                        // for saving to the DB
                        var editedObjectID = that.getEditedEntryID();
                        var editedObjectType = that.getEditedEntryType();
                        var editedObject = that.getEditedEntry();
                        //parseDateFromString

                        var startDateString = $j('.single-entry .start-date input').val();
                        var endDateString = $j('.single-entry .end-date input').val();
                        var dateString = $j('.single-entry .date input').val();

                        var startDate = startDateString
                            ? $j.datepicker.parseDate('d.m.yy', startDateString) : '';
                        var endDate = endDateString
                            ? $j.datepicker.parseDate('d.m.yy', endDateString) : '';
                        var date = dateString
                            ? $j.datepicker.parseDate('d.m.yy', dateString) : '';

                        switch (editedObjectType) {
                            case 'task':
                                editedObject.endDate = endDate;
                                break
                            case 'event':
                                editedObject.startDate = startDate;
                                editedObject.endDate = endDate;
                                editedObject.location =
                                    $j('.single-entry .location input').val();
                                break
                            case 'anniversary':
                                editedObject.date = date;
                                break
                        }
                        var reformattedForDB = editedObject.reformatForDB({
                            'title': $j('.single-entry .title').val(),
                            'description': $j('.single-entry .description .inner').val(),
                            'priority': $j('.single-entry select.priority ').val(),
                        });
                        //$j.datepicker.parseDate('dd.mm.yy', '22.04.2010');
                        //var reformattedForDBentryJson
                        //    = parseEditedEntryDataToJson(editedObjectType);

                        Organizer.Storage.TaffyDB.replaceEntryProperties(editedObjectID,
                            reformattedForDB);

                        // reload an replace in the html
                        var reloadedFromDB = Organizer.Storage.TaffyDB.getEntryByIDField(editedObjectID)
                        var listingEntryReplacementHTML =
                            parseListingHTMLFromDBEntryCollectionData([reloadedFromDB]);
                        $j('#list-container li[data-id=' + editedObjectID + ']')
                            .replaceWith(listingEntryReplacementHTML);
                    }

                });

                // handling organizer onchange
                $j('#organizer').on('change', function (ev) {

                    var target = ev.target;
                    if ($j(target).is('.single-entry input, ' +
                        '.single-entry textarea, .single-entry select')) {
                        // on change of entry edit
                        $j(".single-entry button.inactive").removeClass("inactive").
                            addClass("active");
                    }

                });
            });


            $j('#organizer').on('change',
            function (ev) {
                var target = ev.target;
                if ($j(target).is('.adding-entry select')) {

                    var integerValue = parseInt(target.value);
                    if (integerValue > 0) {

                        var HtmlPatterns = Organizer.HtmlPatterns;
                        // set the correct box for an entry
                        var editBoxHTML = HtmlPatterns.getHTMLByPatternArguments(
                        function () {
                            switch (integerValue) {
                                case 1:
                                    return HtmlPatterns.PatternEnum.FullEntryTask;
                                case 2:
                                    return HtmlPatterns.PatternEnum.FullEntryEvent;
                                case 3:
                                    return HtmlPatterns.PatternEnum.FullEntryAnniversary; (entryJson);
                            };
                        });

                        $j('.adding-entry').remove();
                        $j('#organizer').append(editBoxHTML);


                        // deliberately remove the save button
                        $j('.single-entry .save').remove();
                    }
                }
            });

            $j('#organizer .main-sidebar .add-entry').on('click', function () {

                var TaffyDB = Organizer.Storage.TaffyDB;
                var HtmlPatterns = Organizer.HtmlPatterns;

                var addNewEntrySelector = HtmlPatterns.getHTMLByPatternArguments(
                    HtmlPatterns.PatternEnum.AddNewEntrySelector);

                $j('#organizer .adding-entry').remove();
                $j('#organizer').append(addNewEntrySelector);
            });
        }
    });

    // Uses the Organizer.HtmlPatterns module and by iterating a collection
    // of items from the DB, returns the corresponding HTML for the listing of entries,
    // according to the entry type (the correct pattern is used).
    var parseListingHTMLFromDBEntryCollectionData = function (collection) {

        var HtmlPatterns = Organizer.HtmlPatterns;

        var listEntriesHtml
        = HtmlPatterns.getHTMLByPatternForCollection(collection,
        function (entry) {
            var htmlPattern;
            switch (entry.type) {
                case 'task':
                    htmlPattern = HtmlPatterns.PatternEnum.ListingEntryTask
                    break;
                case 'event':
                    htmlPattern = HtmlPatterns.PatternEnum.ListingEntryEvent
                    break;
                case 'anniversary':
                    htmlPattern =
                        HtmlPatterns.PatternEnum.ListingEntryAnniversary
                    break;

            }
            return htmlPattern;

        }, function (currentItem) {

            var patternArgs = {
                'itemId': currentItem.id,
                'itemTitle': currentItem.title,
                'startDate': currentItem.startdate_day + '.' +
                    currentItem.startdate_month + '.' +
                    currentItem.startdate_year,
                'endDate': currentItem.enddate_day + '.' +
                    currentItem.enddate_month + '.' + currentItem.enddate_year,
                'date': currentItem.date_day + '.' + currentItem.date_month +
                    '.' + currentItem.date_year,
                'priority': function () {
                    switch (currentItem.priority) {
                        case 1: return 'low';
                        case 2: return 'normal';
                        case 3: return 'high';
                    }
                },
                'isDone': (currentItem.active) ? '' : 'checked'
            };
            return patternArgs;
        });

        return listEntriesHtml;
    }

    var listAllEntries = function () {
        // list all organizer entries 
        var TaffyDB = Organizer.Storage.TaffyDB;
        var allEntries = TaffyDB.getAllEntries();
        var listingEntryReplacementHTML =
            parseListingHTMLFromDBEntryCollectionData(allEntries);
        $j('#list-container').html(listingEntryReplacementHTML);
    }

    var instance;
    return {
        getInstance: function () {
            if (!instance) {
                instance = new singletonClass();

                // Hide the constructor so the returned object can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
    };
})();
