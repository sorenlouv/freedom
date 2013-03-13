// submit feed
$('#facebook-feed').submit(function(e){
    e.preventDefault();

    // hide all alerts
    $('.alert').hide();

    var originalFeed = $(this).children('input')[0].value;
    var queryString = originalFeed.match(/uid=(\d+)&key=(\w+)/);

    // not valid
    if(queryString === null){
        $(".alert-error").text('Error: the URL was not valid').fadeIn();

        // Add error to Google Analytics
        _gaq.push(['_trackEvent', 'feedSubmitted', 'error', originalFeed]);

        return false;
    }

    var uid = queryString[1];
    var key = queryString[2];

    var newWebcal = "webcal://fcalendar.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
    var googleLink = "http://www.google.com/calendar/render?cid=" + encodeURIComponent(newWebcal);

    // Add succes event to GA
    _gaq.push(['_trackEvent', 'feedSubmitted', 'success', uid]);

    // Update links
    $("a.import-feed").attr('href', googleLink);
    $("a.download-feed").attr('href', newWebcal);

    // appear
    $(".alert-success").fadeIn();

    return false;
});

// click signin with facebook
$('.facebook-connect-button').click(function(e){
    e.preventDefault();

    // hide all alerts
    $('.alert').hide();

    FB.login(function(response) {
        if (response.authResponse) {
            var accessToken = FB.getAuthResponse()['accessToken'];

            var newWebcal = "webcal://fcalendar.pagodabox.com/feed.ics?access_token=" + accessToken;
            var googleLink = "http://www.google.com/calendar/render?cid=" + encodeURIComponent(newWebcal);

            // Add success event to GA
            _gaq.push(['_trackEvent', 'feedSubmitted', 'success', 'facebook']);

            // Update links
            $("a.import-feed").attr('href', googleLink);
            $("a.download-feed").attr('href', newWebcal);

            // appear
            $(".alert-success").fadeIn();

        }else{
            $(".alert-error").text('Facebook connect failed').fadeIn();
        }
    }, {scope: 'offline_access, user_events'});
});
