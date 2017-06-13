var s3Ctrl = require('../controllers/s3service');
var authCtrl = require('../controllers/authService');
var expressjwt = require('express-jwt');
var jwt = require('jsonwebtoken');
// var router = require('express').Router();

function getAuthToken(req) {
  if (req.headers.authorization) {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query) {
    console.log(req.query);
    return req.query.Authorization.split(' ')[1];;
  }
}

// should be moved to middleware
var jwtValidator = function (req, res, next) {
  var authToken = getAuthToken(req);
  if (!authToken) {
    console.log('Access token not found');
    res.status(401).send('UnAuthorized: Invalid access token');
  }

  // pems genenrated from jwt token set based on userpool id and region
  var pems = {
    'TiGFVEk127LB0De5GxZ2PHul8EprtWLwJERnw52k97k=': '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAgEtZ6rjjDUEJfu3b7USScTBpuyEC2+PVS5H4Hi2Gowz/SGHE1CJc\n0D1qcMkqzx9GsAlDkSrvDk6YPkLaufRzkXG2wQx/ZS6/E2FDxftYbm2CQc4Ct9ob\nSqDViIG9a95oAEN8Fs1ft4l7QyqEmxces8hcgNjCXCQc1eiGjo/iwZdh0lj+WA49\nvPxvmQ+2JOfmeSgb7puRa3oSOSj9brd5ic9CcJc8R7skSLMwdq8Tw9kkD2KolJvF\na2x91E+kYzzCKGW47geUsLVLlQEEB+Z1IwpZWz6U/0hL29FuOi5oAP0CDaoJmFOl\nlHIrYqrY5DKNOEmX6Y4yakCpCOmdBIaTZwIDAQAB\n-----END RSA PUBLIC KEY-----\n',
    'vxMqpjNLIYNUKiPDnLOlzWmxDKVpN0hNm5MCqJV5bC4=': '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA3SRmAmPIA9i+79kV/sglG/APsT/MioLRNikIxJQavYqaSbvywnB5\nG5bJyzIi8a0G2m+D3cGMPzOn+NinviWrI3PRIzD7WH3lp8VC5xQEztJKC4i0Qjwi\nCpLOgIXFBl/qAHVsIrDmm1o1RmV8iNvWN5mYLODCONaGtBwqQUsScCoTkqE+Gtri\n7Fv3mvVknCGsMSckKY9TIoFRBW7UK8qDIOckR4yH291gGu8ADLSetGHpgqjnZWb1\nWOFVnzod5oaOgCtnTtd83h9ywHqi3DjJ2adyp17Ij3GyHNP3MfvRKtc4kdkEscK9\n0rzXbLcTBAd9qM+oF+J16bud0RTMdOLz+wIDAQAB\n-----END RSA PUBLIC KEY-----\n' 
  };

  var decodedJwt = jwt.decode(authToken, {complete: true});
  var kid = decodedJwt.header.kid;
  var pem = pems[kid];

  if (!pem) {
    console.log('Invalid access token');
    res.status(401).send('UnAuthorized: Invalid access token');
  }

  jwt.verify(authToken, pem, { issuer: decodedJwt.payload.iss }, function(err, payload) {
    if(err) {
      // authCtrl.checkUserSession
      console.log(err);
      res.status(401).send('UnAuthorized: Invalid access token');
    } else {
      next();
    }
  });
}

var routes = function (app) {

  // serve index file
  app.get('/', function(req,res) {
    authCtrl.homeController(req,res);
  });

  app.get('/login', function(req,res) {
    authCtrl.loginController(req,res);    
  });

  // user auth route end points
  app.post('/api/user-sign-in', authCtrl.userSignIn);
  app.post('/api/user-sign-up', authCtrl.userSignUp);
  app.post('/api/verify-sign-up', authCtrl.verifySignUp);
  app.post('/api/forgot-password', authCtrl.forgotPassword);

  //attaching middleware
  app.use(jwtValidator);

  // s3 route end points
  app.post('/api/file-upload', s3Ctrl.upload);
  app.get('/api/get-files-list', s3Ctrl.listFiles);
  app.get('/api/get-file/:fileKey', s3Ctrl.getFile);
  app.post('/api/delete-file/:fileKey', s3Ctrl.deleteFile);
};

module.exports = routes;