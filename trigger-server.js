var express = require('express');
var session = require('express-session');
var Flutter = require('flutter');

var flutter = new Flutter({
    cache: false,
    consumerKey: 'sCUoTw2btSMsiaeTIkrSK8JvP',
    consumerSecret: 'wF1dYmz3ca34JjUh7rpHAJ6m6PrAxhw6IYeyYVmimv9K1lUKm8',
    loginCallback: 'http://127.0.0.1:8080/callback',

    authCallback: function(req, res, next) {
        if (req.error) {
            console.log(req.error);
            return;
        }
        var accessToken = req.session.oauthAccessToken;
        var secret = req.session.oauthAccessTokenSecret;

        // Redirect user back to your app 
        res.redirect('bang.html');
    }
});

var app = express();
app.use(session({secret: 'foo'}));
app.use(express.static('front-end'));

app.get('/connect', flutter.connect);
app.get('/callback', flutter.auth);

app.get('/', function (req, res) {
    res.redirect('login.html');
});

// Direct users to /connect to initiate oauth flow.
app.listen(8080, function(){});
