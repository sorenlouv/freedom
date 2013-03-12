// submit feed
$('#facebook-feed').submit(function(e){
    e.preventDefault();

    // hide all alerts
    $('.alert').hide();

    var originalFeed = $(this).children('input')[0].value;
    var queryString = originalFeed.match(/uid=(\d+)&key=(\w+)/);

    // not valid
    if(queryString === null){
        $(".alert-error").fadeIn();

        // Add error to Google Analytics
        _gaq.push(['_trackEvent', 'feedSubmitted', 'error', originalFeed]);

        return false;
    }

    var uid = queryString[1];
    var key = queryString[2];
    var newLink = "http://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
    var newWebcal = "webcal://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
    var googleLink = "http://www.google.com/calendar/render?cid=" + encodeURIComponent(newLink);

    // Add succes event to GA
    _gaq.push(['_trackEvent', 'feedSubmitted', 'success', uid]);

    // Update links
    $("a.import-feed").attr('href', googleLink);
    $("a.download-feed").attr('href', newWebcal);

    // appear
    $(".alert-success").fadeIn();

    return false;
});