// organizer-html-patterns.js
Organizer.HtmlPatterns = (function () {

    var formatPattern = function (format, params) {

        var params = params || {};
        for (var prop in params) {
            var pattern = new RegExp('{' + prop + '}', 'g');
            format = format.replace(pattern, params[prop]);
        }

        return format;
    }

    // the possible html patterns
    var PatternEnum = {
        ListButton: 1,
        ListingEntryEvent: 2,
        ListingEntryTask: 3,
        ListingEntryAnniversary: 4,
        FullEntryEvent: 5,
        FullEntryTask: 6,
        FullEntryAnniversary: 7,
        AddNewEntrySelector: 8
    }

    // Takes a value from the PatternEnum and returns the needed number of arguments.
    var getPatternNeededArguments = function (htmlPattern) {
        return patternArgsCount[htmlPattern];
    }

    // Takes an Organizer.HtmlPatterns.PatternEnum value and a number of arguments
    // to fill the pattern with. Returns the according formatted pattern.
    // Throws an error if the number of arguments for the pattern are different from
    // the defined number for the given pattern.
    var getHTMLByPatternArguments = function (patternOrConditionalCallback, patternArgsOrCallback) {
        debugger
        if (!patternOrConditionalCallback) {
            throw new Error('htmlPattern is not defined.');
        }

        htmlPattern = (typeof (patternOrConditionalCallback) == 'function')
            ? patternOrConditionalCallback()
            : patternOrConditionalCallback;

        var patternFormat = '';
        switch (htmlPattern) {
            
            case PatternEnum.ListButton:

                patternFormat = '<li><button>{listName}</button></li>';
                break;
            case PatternEnum.ListingEntryTask:

                patternFormat = 
'<li data-id="{itemId}"> \
    <p><input class="isdone" type="checkbox" {isDone} /> <span class="entry-type">Task</span>: <a href="#">{itemTitle}</a> / <em class="end-date">to {endDate}</em><span class="priority-color {priority}" title="Priority: {priority}"></span></p> \
</li>';
                break;
            case PatternEnum.ListingEntryEvent:

                patternFormat =
'<li data-id="{itemId}"> \
    <p><input class="isdone" type="checkbox" {isDone} /> <span class="entry-type">Event</span>: <a href="#">{itemTitle}</a> / <em class="start-date">{startDate}</em> -  <em class="end-date">{endDate}</em><span class="priority-color {priority}" title="Priority: {priority}"></span><span class="map-thumb-wrap"><a class="map-thumb viewMap" href="#" title="View on map."></a></span></p> \
</li>';
                break;
            case PatternEnum.ListingEntryAnniversary:

                patternFormat =
'<li data-id="{itemId}"> \
	<p><input class="isdone" type="checkbox" {isDone} /><span class="entry-type">Anniversary</span>: <a href="#">{itemTitle}</a> / <em class="start-date">{date}</em><span class="priority-color {priority}" title="Priority: {priority}"></span></p> \
</li>';
                break;
            case PatternEnum.FullEntryEvent:

                patternFormat =
'<aside class="single-entry"> \
	<input class="title" type="text" placeholder="Event Title" value="{title}"/> \
	<p class="entry-type">Type: <em>Event</em></p> \
	<p class="start-date"><em>Start date:</em><input type="text" placeholder="none" class="datepicker" value="{startdate}" /></p> \
	<p class="end-date"><em>End date:</em><input type="text" placeholder="none" class="datepicker" value="{enddate}"/></p> \
	<p class="priority"> \
		<em>Priority: </em> \
		<select class="priority"> \
			<option value="1" {isLowSelected} >low</option> \
			<option value="2" {isNormalSelected} >normal</option> \
			<option value="3" {isHighSelected} >high</option> \
		</select> \
	</p> \
	<p class="location"><em>Location:</em><input type="text" placeholder="none" value="{location}" /></p> \
	<div class="description"> \
		Description: \
		<textarea class="inner" placeholder="Entry description...">{description}</textarea> \
	</div> \
    <button class="save inactive">Save</button> \
</aside>' ;
                break;
            case PatternEnum.FullEntryTask:

                patternFormat = 

'<aside class="single-entry"> \
	<input class="title" type="text" placeholder="Task Title" value="{title}" /> \
	<p class="entry-type">Type: <em>Task</em></p> \
	<p class="end-date"><em>End date:</em><input type="text" placeholder="none" class="datepicker" value="{enddate}" /></p> \
	<p class="priority"> \
		<em>Priority: </em> \
		<select class="priority"> \
			<option value="1" {isLowSelected} >low</option> \
			<option value="2" {isNormalSelected} >normal</option> \
			<option value="3" {isHighSelected} >high</option> \
		</select> \
	</p> \
	<div class="description"> \
		Description: \
		<textarea class="inner" placeholder="Entry description...">{description}</textarea> \
	</div> \
    <button class="save inactive">Save</button> \
</aside>';
                break;
            case PatternEnum.FullEntryAnniversary:

                patternFormat = 
'<aside class="single-entry"> \
	<input class="title" type="text" placeholder="Anniversary Title" value="{title}" /> \
	<p class="entry-type">Type: <em>Anniversary</em></p> \
	<p class="date"><em>Date:</em><input type="text" placeholder="none" class="datepicker" / value="{date}" ></p> \
	<p class="priority"> \
		<em>Priority: </em> \
		<select class="priority"> \
			<option value="1" {isLowSelected} >low</option> \
			<option value="2" {isNormalSelected} >normal</option> \
			<option value="3" {isHighSelected} >high</option> \
		</select> \
	</p> \
	<div class="description"> \
		Description: \
		<textarea class="inner" placeholder="Entry description...">{description}</textarea> \
	</div> \
    <button class="save inactive">Save</button> \
</aside>';
                break;
            case PatternEnum.AddNewEntrySelector:

                patternFormat = 
'<div class="adding-entry"> \
	<p class="entry-type">Type: \
	    <select> \
		    <option value="0">Entry Type</option> \
		    <option value="1">Task</option> \
		    <option value="2">Event</option> \
		    <option value="3">Anniversary</option> \
	    <select> \
    </p> \
</div>';
                break;

            default:
                throw new Error('No such pattern exists.');
        }

        patternArgsOrCallback = (typeof patternArgsOrCallback === 'function')
            ? patternArgsOrCallback() : patternArgsOrCallback;

        if (patternArgsOrCallback === undefined) {
            return patternFormat.replace('/{[^}/', 'g', '');
        }
        return formatPattern(patternFormat, patternArgsOrCallback);
    }

    // Returns the whole html for a collection of identical items formatted by a given pattern.
    // Takes the collection to iterate, a callback function that takes a single argument - 
    // the CURRENT item in the collection and must return the pattern argument (extracted
    // from the properties of that 'current' object).
    // The 'patternOrConditionalCallback' argument takes a pattern (value) from the
    //  OR a callback that returns such a value (here we can specify some condition for that value).
    var getHTMLByPatternForCollection = function (collection,
        patternOrConditionalCallback, patternArgumentscallback) {

        var html = '',
            currentItem,
            patternArgs,
            htmlPattern;

        for (var i = 0, len = collection.length; i < len; i++) {
            currentItem = collection[i];
            patternArgs = patternArgumentscallback(currentItem);
            if (patternArgs === undefined || (typeof(patternArgs) !== 'object')) {
                throw new Error('The callback doesn\'t return pattern arguments object.');
            }

            htmlPattern = (typeof (patternOrConditionalCallback) == 'function')
                ? patternOrConditionalCallback(currentItem)
                : patternOrConditionalCallback;

            html += getHTMLByPatternArguments(htmlPattern, patternArgs);
        }

        return html;
    }

    return {
        PatternEnum: PatternEnum,
        getHTMLByPatternArguments: getHTMLByPatternArguments,
        getHTMLByPatternForCollection: getHTMLByPatternForCollection
    }

    /*
        working examples: 

        // Get html by a pattern.
        var html = Organizer.HtmlPatterns.getHTMLByPatternArguments  (
            Organizer.HtmlPatterns.PatternEnum.ListButton, 3432432);
            
        // Get html by a pattern (array of arguments).
        var html = Organizer.HtmlPatterns.getHTMLByPatternArrayOfArgs(
            Organizer.HtmlPatterns.PatternEnum.ListButton, [3432432])

        // Iterate over a collection with a pattern and get its html:
        var html = HtmlPatterns.getHTMLByPatternForCollection(lists,
        HtmlPatterns.PatternEnum.ListButton, function (currentItem) {

            var patternArgs = [currentItem.name];
            return patternArgs;
        });

    */
})();