var port = process.env.PORT || 8080;

var express = require('express');

var app = express();
app.use(express.static('static', {index: 'index.html'}));

app.listen(port);
