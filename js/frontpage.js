$(document).ready(function(){

    // click signin with facebook
    $('.facebook-connect-button').click(clickFacebookLogin);

    // click add to Google Calendar
    $('.google-calendar-button, a.download-feed').click(activateStepFinished);
});

var activateStepAddCalendarFeeds = function(secureHash, userId) {
    // to avoid Google Calendar caching an old feed
    var dummy = Math.floor(Math.random() * 1000);

    // setup links
    var newWebcal = "webcal://freedom.konscript.com/feed.ics?user_id=" + userId + '&secure_hash=' + secureHash + '&dummy=' + dummy;
    var googleLink = "http://www.google.com/calendar/render?cid=" + encodeURIComponent(newWebcal);

    // Add success event to GA
    _gaq.push(['_trackEvent', 'feedSubmitted', 'success', 'facebook', userId]);

    // Update links
    $("a.google-calendar-button").attr('href', googleLink);
    $("a.download-feed").attr('href', newWebcal);

    // appear
    $(".step").addClass('inactive');
    $(".step.add-calendar-feed").removeClass('inactive');
};

var activateStepFinished = function(){
    $(".step").addClass('inactive');
    $(".step.finished").removeClass('inactive');
};

var clickFacebookLogin = function(e){
    e.preventDefault();

    // remove all alerts
    $('.alert').remove();

    // start spinner
    var spinner = new Spinner().spin(document.getElementById('clear-div'));

    FB.login(function(response) {
        if (response.authResponse) {

            // set facebook user id
            var userId = FB.getAuthResponse()['userID'];

            // extend access token
            $.getJSON('/handlers.php?f=saveAccessToken', function(response){
                // set callback method, depending on renewal of feed or new feed submission
                if( window.location.pathname == "/renew"){
                    activateStepFinished();
                }else{
                    var secureHash = response.secure_hash;
                    activateStepAddCalendarFeeds(secureHash, userId);
                }

                //stop spinner
                spinner.stop();
            });

        }else{
            $(".alert-error").text('').fadeIn();

            jQuery('<div/>', {
                "class": 'alert alert-error',
                text: 'Facebook connect failed'
            }).appendTo('.step-facebook-connect.active .content');

            //stop spinner
            spinner.stop();
        }
    }, {scope: 'user_events, user_groups'});
};