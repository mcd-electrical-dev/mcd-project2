var fs = require('fs');
var express = require('express');
var app = express();
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const path = require('path');
var productDataExtractor = require(path.join(__dirname,'server','product-data-extractor.js'));


app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/home', express.static(path.join(__dirname,'client')));

app.get('/home', function (req, res) {
     res.sendFile(path.join(__dirname,'client','download.html'));
});

app.use(express.static(path.join(__dirname,'server/client-data')));
app.use('/client-data', serveIndex(path.join(__dirname,'server/client-data')));

productDataExtractor.startDataPull();
//productDataExtractor.startDataPull;
setInterval(setDownloadPathCallback, 500);
//reproduce the excel every 8 hours
setInterval(productDataExtractor.startDataPull, 28800000);



//file downloading path setting
function setDownloadPathCallback() {

    var fileName = "";

    fs.readdir(path.join(__dirname,'/server/client-data'), (err, files) => {
        fileName = files[0];
    })

    app.get('/downloadit', function (req, res) {
        var file = path.join(__dirname,'server','client-data',fileName);
        res.download(file);
    });
}




app.listen(8080, function () {
    console.log('Example app listening on port 8080!')
})


