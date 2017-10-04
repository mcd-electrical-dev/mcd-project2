var fs = require('fs');
var express = require('express');
var app = express();
var productDataExtractor = require(__dirname + '\\server\\product-data-extractor');
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/home', express.static(__dirname + '/client/'));

app.get('/home', function (req, res) {
     res.sendFile(__dirname + '\\client\\download.html');
});

app.use(express.static(__dirname + 'server/client-data'));
app.use('/client-data', serveIndex(__dirname + 'server/client-data'));



setInterval(setDownloadPathCallback, 500);
//reproduce the excel every 8 hours
setInterval(productDataExtractor.startDataPull, 28800000);



//file downloading path setting
function setDownloadPathCallback() {

    var fileName = "";

    fs.readdir(__dirname + '/server/client-data', (err, files) => {
        fileName = files[0];
    })

    app.get('/downloadit', function (req, res) {
        var file = __dirname + '/server/client-data/' + fileName;
        res.download(file);
    });
}




app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})


