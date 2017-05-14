var express = require('express');
var app = express();
var http = require('http').Server(app);
var multiparty = require('connect-multiparty')();
var attachRoutes = require('./routes');
require('./dbsetup.js');

// serve static files
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));

app.get('/fonts/roboto/*', function(req ,res){
  var fileName = req.url.substring(req.url.indexOf('Roboto'));
  res.sendFile(__dirname + '/fonts/roboto/' + fileName);
});

// attach middlewares
app.use(multiparty);

app.use(function(req, res, next) {
  req.buildDir = __dirname;
  next();
});
// attaching routes
attachRoutes(app);

// start server
http.listen(process.env.PORT || 3000, function() {
  console.log("listening on port " + http.address().port);
});
