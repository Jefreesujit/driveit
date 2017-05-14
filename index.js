var express = require('express');
var app = express();
var http = require('http').Server(app);
var multiparty = require('connect-multiparty')();
var controller = require('./s3service');
var getCognitoId = require('./auth.js');
require('./dbsetup.js');
var cognito = require('./aws_cognito.js');

// check for session
var retreiveUserStatus = function (req,res) {
  var userLoggedIn = cognito.retrieveUserFromLocalStorage();
  userLoggedIn.then(function(successData) {
    getCognitoId();
    res.sendFile(__dirname + '/index.html');
  }, function() {
    res.redirect('/login');
  });
};

var userSignIn =  function () {
  var signIn = cognito.signInUser('admin', 'P@ssW0rd');
  signIn.then(function(data) {
    console.log('===post login data===', data);
    res.redirect('/');
  });
}

// serve index file
app.get('/', function(req,res) {
  retreiveUserStatus(req,res);
});

app.get('/login', function(req,res) {
  res.sendFile(__dirname + '/login.html');
  userSignIn();
});

// serve static files
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));

app.get('/fonts/roboto/*', function(req ,res){
  var fileName = req.url.substring(req.url.indexOf('Roboto'));
  res.sendFile(__dirname + '/fonts/roboto/' + fileName);
});

// attach middlewares
app.use(multiparty);

// route end points
app.post('/api/file-upload', controller.upload);
app.get('/api/get-files-list', controller.listFiles);
app.get('/api/get-file/:fileKey', controller.getFile);
app.post('/api/delete-file/:fileKey', controller.deleteFile);

// start server
http.listen(process.env.PORT || 3000, function() {
  console.log("listening on port " + http.address().port);
});
