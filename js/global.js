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
        return false;
    }

    var uid = queryString[1];
    var key = queryString[2];
    var newFeedUrl = "http://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;

    // appear
    $(".alert-success")
    .html('<strong>Well done!</strong> Your new, better feed is: ' + newFeedUrl)
    .fadeIn();
    return false;
});