var s3Controller = require('../controllers/s3service');
var authController = require('../controllers/authService');
var routes = function (app) {

  // serve index file
  app.get('/', function(req,res) {
    authController.retreiveUserStatus(req,res);
  });

  app.get('/login', function(req,res) {
    res.sendFile(req.buildDir + '/login.html');
    authController.userSignIn('admin', 'P@ssW0rd');
  });

  // s3 route end points
  app.post('/api/file-upload', s3Controller.upload);
  app.get('/api/get-files-list', s3Controller.listFiles);
  app.get('/api/get-file/:fileKey', s3Controller.getFile);
  app.post('/api/delete-file/:fileKey', s3Controller.deleteFile);

};

module.exports = routes;