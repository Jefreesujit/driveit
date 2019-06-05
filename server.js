var express = require('express');
var fs = require('fs');
var app = express();
var path = require('path');
var https = require('https');
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

app.get('/images/*', function(req ,res){
	var fileName = req.url.substring(req.url.indexOf('images'));
  res.sendFile(path.join(__dirname, 'public/', fileName));
});

app.get('/favicon.ico', function(req ,res){
  res.sendFile(path.join(__dirname, 'public/icons/favicon.ico'));
});

// attaching middlewares
app.use(cookieParser());
app.use([middleware.rawBodyParser, middleware.encodedBodyParser, middleware.jsonBodyParser]);
app.use(multiparty);

app.get('/.well-known/acme-challenge/:id', function(req,res) {
  res.sendFile(path.join(__dirname, '/.well-known/acme-challenge/', req.params.id));
});

// attaching routes
attachRoutes(app);

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

var server = https.createServer(options, app);

// start server
server.listen(process.env.PORT || 8443, function() {
  console.log("listening on port " + server.address().port);
});

server.timeout = 900000;

