var s3Ctrl = require('../controllers/s3service');
var authCtrl = require('../controllers/authService');
// var router = require('express').Router();

// console.log(router.route);
var routes = function (app) {

  // serve index file
  app.get('/', function(req,res) {
    authCtrl.homeController(req,res);
  });

  // router.route('/login')
  //   .get(mw.redirect);

  app.get('/login', function(req,res) {
    authCtrl.loginController(req,res);    
    // authController.userSignIn(req,res); // temporary login, should be removed
  });

  // s3 route end points
  app.post('/api/file-upload', s3Ctrl.upload);
  app.get('/api/get-files-list', s3Ctrl.listFiles);
  app.get('/api/get-file/:fileKey', s3Ctrl.getFile);
  app.post('/api/delete-file/:fileKey', s3Ctrl.deleteFile);

  // user auth route end points
  app.post('/api/user-sign-in', authCtrl.userSignIn);
  app.post('/api/user-sign-up', authCtrl.userSignUp);
  app.post('/api/verify-sign-up', authCtrl.verifySignUp);
  app.post('/api/forgot-password', authCtrl.forgotPassword);

};

module.exports = routes;