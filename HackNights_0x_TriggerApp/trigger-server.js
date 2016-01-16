var express = require('express');
var session = require('express-session');
var Flutter = require('flutter');
var keys = require('./oauth.json');

var flutter = new Flutter({
    cache: false,
    consumerKey: keys['CONSUMER_KEY'],
    consumerSecret: keys['CONSUMER_SECRET'],
    loginCallback: 'http://127.0.0.1:8080/callback',

    authCallback: function(req, res, next) {
        if (req.error) {
            console.log(req.error);
            return;
        }
        var accessToken = req.session.oauthAccessToken;
        var secret = req.session.oauthAccessTokenSecret;

        // TODO: log into twitter

        // Enable serving the app front-end
        app.get('/bang', function(req, res){
            res.sendFile("front-end/bang.html", {root:'./'});
        });

        // and redirect user there, now that they are logged in
        res.redirect('/bang');
    }
});

var app = express();
app.use(session({secret: 'bangbangbang'}));

// serve login.html at /
app.get('/', function(req, res){
    res.sendFile("front-end/login.html", {root:'./'});
});

app.get('/connect', flutter.connect);
app.get('/callback', flutter.auth);

// Direct users to /connect to initiate oauth flow.
app.listen(8080, function(){});
