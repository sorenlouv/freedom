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
        return false;
    }

    var uid = queryString[1];
    var key = queryString[2];
    var newLink = "http://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
    var newWebcal = "webcal://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;

    // appear
    $(".alert-success")
    .html('<strong>Well done!</strong> Your new, better feed is: <a href="' + newWebcal + '">' + newLink + "</a>")
    .fadeIn();
    return false;
});