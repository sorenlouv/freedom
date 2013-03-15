$(document).ready(function(){

    // submit feed
    $('#facebook-feed').submit(function(e){
        e.preventDefault();

        // hide all alerts
        $('.alert').hide();

        var originalFeed = $(this).find('input')[0].value;
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

        var newWebcal = "webcal://freedom.pagodabox.com/feed.ics?uid=" + uid + "&key=" + key;
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

        var spinner = new Spinner().spin(document.getElementById('clear-div'));

        FB.login(function(response) {
            if (response.authResponse) {

                // short lived access token
                var accessTokenShort = FB.getAuthResponse()['accessToken'];

                // extend access token
                $.getJSON('/extend_token.php?access_token_short=' + accessTokenShort, function(response) {
                    var accessTokenLong = response.access_token;

                    var newWebcal = "webcal://freedom.pagodabox.com/feed.ics?access_token=" + accessTokenLong;
                    var googleLink = "http://www.google.com/calendar/render?cid=" + encodeURIComponent(newWebcal);

                    // Add success event to GA
                    _gaq.push(['_trackEvent', 'feedSubmitted', 'success', 'facebook']);

                    // Update links
                    $("a.import-feed").attr('href', googleLink);
                    $("a.download-feed").attr('href', newWebcal);

                    // appear
                    $(".alert-success").fadeIn();

                    //stop spinner
                    spinner.stop();

                });

            }else{
                $(".alert-error").text('Facebook connect failed').fadeIn();
            }
        }, {scope: 'user_events'});
    });
});