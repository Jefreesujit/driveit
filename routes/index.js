var s3Ctrl = require('../controllers/s3service');
var authCtrl = require('../controllers/authService');
var middleware = require('../middleware');
// var router = require('express').Router();

var routes = function (app) {

  // serve index file
  app.get('/', function(req,res) {
    authCtrl.homeController(req,res);
  });

  app.get('/login', function(req,res) {
    authCtrl.loginController(req,res);    
  });

  app.get('/logout', function(req,res) {
    authCtrl.loginController(req,res);    
  });

  // user auth route end points
  app.post('/api/user-sign-in', authCtrl.userSignIn);
  app.post('/api/user-sign-up', authCtrl.userSignUp);
  app.post('/api/verify-sign-up', authCtrl.verifySignUp);
  app.post('/api/forgot-password', authCtrl.forgotPassword);

  //attaching autnenticator middleware
  app.use(middleware.jwtValidator);

  // s3 route end points
  app.post('/api/file-upload', s3Ctrl.upload);
  app.get('/api/get-files-list', s3Ctrl.listFiles);
  app.get('/api/get-file/:fileKey', s3Ctrl.getFile);
  app.post('/api/delete-file/:fileKey', s3Ctrl.deleteFile);
};

module.exports = routes;