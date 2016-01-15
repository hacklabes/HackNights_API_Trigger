var express = require('express');

var app = express();
app.use(express.static('static', {index: 'index.html'}));

app.listen(8080, function(){});
