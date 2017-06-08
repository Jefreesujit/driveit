var cognito = require('./aws_cognito.js');

function checkUserSession (success, errorCallback) {
  var userLoggedIn = cognito.retrieveUserFromLocalStorage();
  userLoggedIn.then(success, errorCallback);
}

exports.homeController = function (req,res) {
  checkUserSession(function (successData) {
    console.log('userLoggedIn');
    cognito.getCognitoId();
    res.sendFile(req.buildDir +'/index.html');
  }, function() {
    res.redirect('/login');
  });
};

exports.loginController = function (req,res) {
  checkUserSession(function (successData) {
    res.redirect('/');
  }, function() {
    res.sendFile(req.buildDir + '/login.html');
  });
}

exports.userSignIn =  function (req, res) {
  console.log(req.body.email, req.body.password);
  var signIn = cognito.signInUser(req.body.email, req.body.password);
  signIn.then(function(data) {
    console.log('===post login data===', data);
      data.redirectUrl = '/';
      res.status(200).json(data);
  }, function(err) {
      res.status(500).json(err);
  });
}

exports.userSignUp = function (req, res) {
  var signUp = cognito.signUpUser(req.body.email, req.body.username, req.body.password);
  signUp.then(function(data) {
    console.log('===post signup data===', data);
      res.status(200).json(data);
  }, function(err) {
      res.status(500).json(err);
  });
}

exports.verifySignUp = function (req, res) {
  var verify = cognito.verifyUserAccount(req.body.email, req.body.pin);
  verify.then(function(data) {
    console.log('===post verify data===', data);
      res.status(200).json(data);
  }, function(err) {
      res.status(500).json(err);
  });
}

exports.forgotPassword = function () {
  // var signUp = cognito.signUpUser('jefree.sujit@gmail.com', 'admin', 'male', 'P@ssW0rd');
  // signUp.then(function(data) {
  //   console.log('===post signup data===', data);
  // });
}
