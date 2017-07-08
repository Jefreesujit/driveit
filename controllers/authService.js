var path = require('path');
var AWS = require('aws-sdk');
var cognito = require('./aws_cognito.js');

var docClient = new AWS.DynamoDB.DocumentClient();
    pathName = __dirname.substring(0, __dirname.lastIndexOf('/'));

var checkUserSession  = function(success, errorCallback, email) {
  cognito.getUserSession('e.jefree110@gmail.com');
  var userLoggedIn = cognito.retrieveUserFromLocalStorage();
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
  console.log('home', req.cookies);
  checkUserSession(function (successData) {
    console.log('userLoggedIn');
    // cognito.getCognitoId(); commented out temporarily
    res.sendFile(path.join(pathName, 'public', 'index.html'));
  }, function() {
    res.redirect('/login');
  });


  // var sessionToken = (req.user && req.user.tokens) ? req.user.tokens.sessionToken : undefined;
  // console.log('sessionToken', sessionToken); 
  // res.cookie('drive-it-access-token', sessionToken);

  // // if (req.headers.referer && req.headers.referer.indexOf('/login') !== -1) {
  // //   res.sendFile(path.join(pathName, 'public', 'index.html'));
  // // } else {
  // //   res.redirect('/login');
  // // }
  // res.sendFile(path.join(pathName, 'public', 'index.html'));
};

exports.loginController = function (req,res) {
  console.log('login', req.cookies);
  checkUserSession(function (successData) {
    res.redirect('/');
  }, function() {
    res.sendFile(path.join(pathName, 'public', 'login.html'));
  });

  // if ((req.headers.referer && req.headers.referer.indexOf('/logout') === -1) || req.cookies['drive-it-access-token']) {
  //   res.redirect('/');
  // } else {
  //   res.sendFile(path.join(pathName, 'public', 'login.html'));
  // }
}

exports.logoutController = function (req, res) {
  var signOut = cognito.signOutUser();
  signOut.then(function(data) {
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
    addActivityLogs({email: authData[0]});
    console.log('===post login ===', data.sessionToken);
    data.redirectUrl = '/';
    res.cookie('drive-it-access-token', data.sessionToken);
    res.status(200).json(data);
  }, function(err) {
    res.status(500).json(err);
  });
}

exports.userSignUp = function (req, res) {
  var authData = getAuthInfo(req),
      signUp = cognito.signUpUser.apply(null, authData);
  signUp.then(function(data) {
    console.log('===post signup data===', data);
    data.message = 'A verification code has been sent to your email. Kindly use the code to complete the process.';
    addUserEntry({email: authData[0], username: authData[1], password: authData[2]});
    res.status(200).json(data);
  }, function(err) {
    res.status(500).json(err);
  });
}

exports.verifySignUp = function (req, res) {
  var authData = getAuthInfo(req),
      verify = cognito.verifyUserAccount.apply(null, authData);
  verify.then(function(data) {
    console.log('===post verify data===', data);
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

function addUserEntry (data) {
  var params =  {
        TableName: "Users",
        Item: {
          userid: data.email,
          name: data.username,
          email: data.email,
          password: data.password,
          fileLogs: [],
          activityLogs: []
        }
      };

  docClient.put(params, function (err, data) {
    if (err) {
      console.log('error', err);
    } else {
      console.log('success', data);
    }
  });
}

function addActivityLogs (data) {
  var record = {
        activity: 'User Sign In',
        status: 'success',
        timestamp: new Date().toJSON()
      },
      params =  {
        TableName: "Users",
        Key:{
          userid: data.email,
          email: data.email
        },
        UpdateExpression: "set #activityLogs = list_append(#activityLogs, :record)",
        ExpressionAttributeNames: {
          '#activityLogs' : 'activityLogs'
        },
        ExpressionAttributeValues:{
            ":record": [record]
        },
        ReturnValues:"UPDATED_NEW"
      };

  docClient.update(params, function (err, data) {
    if (err) {
      // console.log('activity error', err);
    } else {
      // console.log('activity success', data);
    }
  });
}

exports.checkUserSession = checkUserSession;
