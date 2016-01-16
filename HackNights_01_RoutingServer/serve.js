var express = require('express');
var fs = require('fs');

var app = express();
app.use(express.static('static', {index: 'index.html'}));

var imageFiles = fs.readdirSync('images/');

app.get('/cat', function(req, res){
    var fName = '';
    while(fName.substring(0,3) != 'cat'){
        // grab a random image and check if file name starts with 'cat'
        fName = imageFiles[Math.floor(Math.random()*imageFiles.length)];
    }
    res.sendFile('images/'+fName, {root:'./'});
});

app.listen(8080, function(){});
