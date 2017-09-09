var path = require('path');
var AWS = require('aws-sdk');
var dbServ = require('./dbService');
var cognito = require('./aws_cognito.js');
var jwt = require('jsonwebtoken');

var docClient = new AWS.DynamoDB.DocumentClient();
    pathName = __dirname.substring(0, __dirname.lastIndexOf('/'));

var getEmailFromCookie = function (req) {
  var email = '';

  if (req.cookies['drive-it-access-token']) {
    var token = req.cookies['drive-it-access-token'],
        decoded = jwt.decode(token, {complete: true}).payload;
    email = decoded.username;
  } else {
    console.error('access token not found in cookie')
  }

  return email;
}

var checkUserSession  = function(req, success, errorCallback) {
  var emailId = getEmailFromCookie(req);
  var userLoggedIn = cognito.retrieveUserFromLocalStorage(emailId);
  userLoggedIn.then(success, errorCallback);
}

var getAuthInfo = function (req) {
  if (req.headers.authorization) {
    var dataHeader = req.headers.authorization.split(' ')[1],
        authInfo = new Buffer(dataHeader, 'base64').toString('ascii'),
        authData = authInfo.split(':');
    return authData;
  } else {
    return [];
  }
}

exports.homeController = function (req,res) {
  checkUserSession(req, function (successData) {
    // cognito.getCognitoId(); commented out temporarily
    res.sendFile(path.join(pathName, 'public', 'index.html'));
  }, function(err) {
    res.redirect('/login');
  });
};

exports.loginController = function (req,res) {
  checkUserSession(req, function (successData) {
    res.redirect('/');
  }, function(err) {
    res.sendFile(path.join(pathName, 'public', 'login.html'));
  });
}

exports.activityController = function (req,res) {
  checkUserSession(req, function (successData) {
    // cognito.getCognitoId(); commented out temporarily
    res.sendFile(path.join(pathName, 'public', 'activity.html'));
  }, function(err) {
    res.redirect('/login');
  });
};

exports.logoutController = function (req, res) {
  var emailId = getEmailFromCookie(req),
      signOut = cognito.signOutUser(emailId);
  signOut.then(function(data) { 
    dbServ.addActivityLogs({email: emailId, action: 'User Sign Out'});   
    res.clearCookie('drive-it-access-token');
    res.redirect('/login');
  }, function(err) {
    res.redirect('/');
  });
};

exports.userSignIn =  function (req, res) {
  var authData = getAuthInfo(req),
      signIn = cognito.signInUser.apply(null, authData);
  signIn.then(function(data) {
    dbServ.addActivityLogs({email: authData[0], action: 'User Sign In'});
    var responseData = {
      redirectUrl: '/',
      sessionToken: data.sessionToken,
      username: data.userData.name
    };
    res.cookie('drive-it-access-token', data.sessionToken);
    res.status(200).json(responseData);
  }, function(err) {
    res.status(500).json(err);
  });
}

exports.userSignUp = function (req, res) {
  var authData = getAuthInfo(req),
      signUp = cognito.signUpUser.apply(null, authData);
  signUp.then(function(data) {
    data.message = 'A verification code has been sent to your email. Kindly use the code to complete the process.';
    dbServ.addUserEntry({email: authData[0], username: authData[1], password: authData[2]});
    res.status(200).json(data);
  }, function(err) {
    res.status(500).json(err);
  });
}

exports.verifySignUp = function (req, res) {
  var authData = getAuthInfo(req),
      verify = cognito.verifyUserAccount.apply(null, authData);
  verify.then(function(data) {
      data.message = 'Registered successfully. Please login to continue.';
      res.status(200).json(data);
  }, function(err) {
      res.status(500).json(err);
  });
}

exports.forgotPassword = function (req, res) {
  // var signUp = cognito.signUpUser('jefree.sujit@gmail.com', 'admin', 'male', 'P@ssW0rd');
  // signUp.then(function(data) {
  //   console.log('===post signup data===', data);
  // });
  res.status(500).send('error resetting password');
}

exports.checkUserSession = checkUserSession;
