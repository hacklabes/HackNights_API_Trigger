var express = require('express');
var session = require('express-session');
var Flutter = require('flutter');
var Twitter = require('twitter');
var keys = require('./oauth.json');

var lastTweet = ""

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
        var accessTokenSecret = req.session.oauthAccessTokenSecret;

        // get a twitter client
        var tClient = new Twitter({
            consumer_key: keys['CONSUMER_KEY'],
            consumer_secret: keys['CONSUMER_SECRET'],
            access_token_key: accessToken,
            access_token_secret: accessTokenSecret
        });

        // set up a stream and track tweets that mention me
        tClient.stream('statuses/filter', {track: '@thiagohersan'},  function(stream){
            stream.on('data', function(tweet) {
                console.log(tweet.text);
                lastTweet = tweet;
            });

            stream.on('error', function(error) {
                console.log(error);
            });
        });

        // Enable the tweet endpoint
        app.get('/tweet', function(req, res){
            res.send(lastTweet);
        });

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
