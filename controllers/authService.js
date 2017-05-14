var cognito = require('./aws_cognito.js');

exports.retreiveUserStatus = function (req,res) {
  var userLoggedIn = cognito.retrieveUserFromLocalStorage();
  userLoggedIn.then(function(successData) {
    console.log('userLoggedIn');
    cognito.getCognitoId();
    res.sendFile(req.buildDir +'/index.html');
  }, function() {
    res.redirect('/login');
  });
};

exports.userSignIn =  function () {
  var signIn = cognito.signInUser('admin', 'P@ssW0rd');
  signIn.then(function(data) {
    console.log('===post login data===', data);
  });
}

exports.userSignUp = function () {
  var signUp = cognito.signUpUser('jefree.sujit@gmail.com', 'admin', 'male', 'P@ssW0rd');
  signUp.then(function(data) {
    console.log('===post signup data===', data);
  });
}
