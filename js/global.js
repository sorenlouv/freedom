// sdk loaded
window.fbAsyncInit = function() {
    // init
    FB.init({
      appId      : '408564152572106', // App ID from the App Dashboard
      channelUrl : '/channel.php', // Channel File for x-domain communication
      status     : true, // check the login status upon init?
      cookie     : true // set sessions cookies to allow your server to access the session?
    });

    $(document).trigger('afterFBInit');
};

(function(d, debug){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
 ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));