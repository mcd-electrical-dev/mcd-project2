var fs = require('fs');
var express = require('express');
var app = express();
var productDataExtractor = require('./product-data-extractor');
var serveIndex = require('serve-index');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');

mongoose.createConnection('mongodb://localhost/MCD');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
//app.use(passport.session());


app.use('/login', express.static('C:/Users/Andy/Desktop/mcd-project/client/login'));

//app.use('/download', express.static('C:/Users/Andy/Desktop/mcd-project/client/protected/'));

//mongoose



//serializing / deserializing
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


//


/*
app.get('/loginSuccess', (req, res) => {
    if (req.user) {
        res.sendFile('C:/Users/Andy/Desktop/mcd-project/client/protected/download.html', { user: req.user });
    } else {
        res.sendFile('C:/Users/Andy/Desktop/mcd-project/client/public/login.html');
    }
});
*/
app.use(express.static(__dirname + 'server/client-data'));
app.use('/client-data', serveIndex(__dirname + 'server/client-data'));






app.get('/login', function (req, res) {
    res.sendFile('C:/Users/Andy/Desktop/mcd-project/client/login.html');
});

app.get('/loginFailure', function (req, res) {
    res.send('Failed to authenticate');
});

app.get('/loginSuccess', function (req, res) {
    res.send('Succedddd to authenticate');
});


var Schema = mongoose.Schema;
var UserDetail = new Schema({
    username: String,
    password: String
}, {
        collection: 'userInfo'
    });
var UserDetails = mongoose.model('userInfo', UserDetail);


//login strategy
passport.use(new LocalStrategy(function(username, password, done) {

      UserDetails.findOne({
        'username': username, 
      }, function(err, user) {
        if (err) {
          return done(err);
        }
  
        if (!user) {
          return done(null, false);
        }
  
        if (user.password != password) {
          return done(null, false);
        }
  
        return done(null, user); 
      });
  }));

//

//login auth////
//success / failure routes
app.post('/login',
passport.authenticate('local', {
  successRedirect: '/loginSuccess',
  failureRedirect: '/loginFailure'
})
);






setInterval(setDownloadPathCallback, 500);
//reproduce the excel every 8 hours
setInterval(productDataExtractor.startDataPull, 28800000);
















//file downloading path setting
function setDownloadPathCallback() {

    var fileName = "";

    fs.readdir('./server/client-data', (err, files) => {
        fileName = files[0];
    })

    app.get('/downloadit', function (req, res) {
        var file = __dirname + '/client-data/' + fileName;
        res.download(file);
    });
}




app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})


