var express = require('express');
var session = require('express-session');
var multer = require('multer');
var Flutter = require('flutter');
var Twitter = require('twitter');
var keys = require('./oauth.json');

var port = process.env.PORT || 8080;

var app = express();
app.use(session({resave:true, saveUninitialized:false, secret:'bangbangbang'}));

var upload = multer();

// serve login.html at /
app.get('/', function(req, res){
    res.sendFile("front-end/login.html", {root:'./'});
});

// this is to keep track of separate users' names and tweets
var userInfo = {};

var flutter = new Flutter({
    cache: false,
    consumerKey: keys['CONSUMER_KEY'],
    consumerSecret: keys['CONSUMER_SECRET'],
    loginCallback: 'http://127.0.0.1:'+port+'/callback',

    // called eventually once user is logged in
    authCallback: function(req, res, next) {
        if (req.error) {
            console.log(req.error);
            return;
        }

        // initialize the session information
        userInfo[req.sessionID] = {
            screen_name: '',
            lastTweet: ''
        };

        // get a twitter client
        userInfo[req.sessionID].tClient = new Twitter({
            consumer_key: keys['CONSUMER_KEY'],
            consumer_secret: keys['CONSUMER_SECRET'],
            access_token_key: req.session.oauthAccessToken,
            access_token_secret: req.session.oauthAccessTokenSecret
        });

        // get user name
        userInfo[req.sessionID].tClient.get('account/settings', function(error, response){
            if(error){
                return;
            }
            userInfo[req.sessionID].screen_name = response.screen_name;

            // set up a stream and track tweets that mention me
            userInfo[req.sessionID].tClient.stream('statuses/filter', {track: '@'+response.screen_name}, function(stream){
                stream.on('data', function(tweet) {
                    console.log(tweet.text);
                    userInfo[req.sessionID].lastTweet = tweet;
                });

                stream.on('error', function(error) {
                    console.log(error);
                });
            });
        });

        // Enable the tweet endpoints
        app.get('/tweet', function(req, res){
            res.send(userInfo[req.sessionID].lastTweet);
        });
        app.post('/post', upload.single(), function(req, res){
            if(req.body.dataurl.length > 10000){
                userInfo[req.sessionID].tClient.post('media/upload',{media_data: req.body.dataurl}, function (error, media, response) {
                    if (!error) {
                        // Tweet it
                        var status = {
                            status: '@'+userInfo[req.sessionID].lastTweet.user.screen_name,
                            media_ids: media.media_id_string
                        }
                        // prevents posting this image many times
                        req.body.dataurl = '';
                        userInfo[req.sessionID].tClient.post('statuses/update', status, function(){});
                    }
                });
            }
            res.sendStatus(200);
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
app.listen(port, function(){});
