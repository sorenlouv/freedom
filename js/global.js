// submit feed
$('#facebook-feed').submit(function(e){
    e.preventDefault();

    // hide all alerts
    $('.alert').hide();

    var originalFeed = $(this).children('input')[0].value;
    var queryString = originalFeed.match(/uid=(\d+)&key=(\w+)/);

    // not valid
    if(queryString === null){
        $(".alert-error")
        .text('Error: the URL was not valid')
        .fadeIn();

        // Add error to Google Analytics
        _gaq.push(['_trackEvent', 'feedSubmitted', 'error', originalFeed]);

        return false;
    }

    // Add succes event to GA
    _gaq.push(['_trackEvent', 'feedSubmitted', 'success', uid]);

    var uid = queryString[1];
    var key = queryString[2];
    var newLink = "http://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
    var newWebcal = "webcal://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
    var googleButton = '<a href="http://www.google.com/calendar/render?cid=' + encodeURIComponent(newLink) + '" target="_blank"><img src="//www.google.com/calendar/images/ext/gc_button6.gif" border=0></a>';

    // appear
    $(".alert-success")
    .html('<strong>Well done!</strong> Your can now <a href="' + newWebcal + '">download the feed</a> or ' + googleButton)
    .fadeIn();

    return false;
});