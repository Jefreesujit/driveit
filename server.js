var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var multiparty = require('connect-multiparty')();
var attachRoutes = require('./routes');
var cookieParser = require('cookie-parser');
var middleware = require('./middleware');
require('./dbsetup.js');

// serve static files
app.use(express.static(path.join(__dirname, 'public', 'css')));
app.use(express.static(path.join(__dirname, 'public', 'js')));

app.get('/fonts/roboto/*', function(req ,res){
  var fileName = req.url.substring(req.url.indexOf('Roboto'));
  res.sendFile(path.join(__dirname, 'public/fonts/roboto/', fileName));
});

// attaching middlewares
app.use(cookieParser());
app.use([middleware.rawBodyParser, middleware.encodedBodyParser, middleware.jsonBodyParser]);
app.use(multiparty);

app.get('/.well-known/acme-challenge/:id', function(req,res) {
  res.sendFile(path.join(__dirname, '.well-known/acme-challenge', req.params.id));
});

// attaching routes
attachRoutes(app);

// start server
http.listen(process.env.PORT || 3000, function() {
  console.log("listening on port " + http.address().port);
});
http.timeout = 900000;

