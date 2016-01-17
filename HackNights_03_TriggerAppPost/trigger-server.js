var express = require('express');
var session = require('express-session');
var multer = require('multer');
var Flutter = require('flutter');
var Twitter = require('twitter');
var keys = require('./oauth.json');

var app = express();
app.use(session({secret: 'bangbangbang'}));

var upload = multer();

var lastTweet = ""

// serve login.html at /
app.get('/', function(req, res){
    res.sendFile("front-end/login.html", {root:'./'});
});

var flutter = new Flutter({
    cache: false,
    consumerKey: keys['CONSUMER_KEY'],
    consumerSecret: keys['CONSUMER_SECRET'],
    loginCallback: 'http://127.0.0.1:8080/callback',

    // called eventually once user is logged in
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

        // get user name
        tClient.get('account/settings', function(error, response){
            if(error){
                return;
            }

            // set up a stream and track tweets that mention me
            tClient.stream('statuses/filter', {track: '@'+response.screen_name},  function(stream){
                stream.on('data', function(tweet) {
                    console.log(tweet.text);
                    lastTweet = tweet;
                });

                stream.on('error', function(error) {
                    console.log(error);
                });
            });
        });

        // Enable the tweet endpoints
        app.get('/tweet', function(req, res){
            res.send(lastTweet);
        });
        app.post('/post', upload.single(), function(req, res){
            if(req.body.dataurl.length > 10000){
                tClient.post('media/upload', {media_data: req.body.dataurl}, function (error, media, response) {
                    if (!error) {
                        // Lets tweet it
                        var status = {
                            status: ' ',
                            media_ids: media.media_id_string
                        }
                        tClient.post('statuses/update', status, function(){});
                    }
                });
            }
        });

        // Enable serving the app front-end
        app.get('/bang.html', function(req, res){
            res.sendFile("front-end/bang.html", {root:'./'});
        });
        app.get('/utils.js', function(req, res){
            res.sendFile("front-end/utils.js", {root:'./'});
        });

        // and redirect user there, now that they are logged in
        res.redirect('/bang.html');

        /* 1337 H4X0r version: serve all .html and .js in front-end/
        app.get(/^(.*).(html|js)/, function(req, res){
            res.sendFile("front-end/"+req.params[0]+"."+req.params[1], {root:'./'});
        }); */
    }
});

app.get('/connect', flutter.connect);
app.get('/callback', flutter.auth);

// Direct users to /connect to initiate oauth flow.
app.listen(8080, function(){});
