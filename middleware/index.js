var authCtrl = require('../controllers/authService');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

function getAuthToken(req) {
  if (req.headers.authorization) {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.Authorization) {
    return req.query.Authorization.split(' ')[1];
  }
}

exports.rawBodyParser = function (req, res, next) {
  bodyParser.raw({
    limit: '50mb'
  })(req, res, next);
}

exports.jsonBodyParser = function (req, res, next) {
  bodyParser.json()(req, res, next);
}

exports.encodedBodyParser = function (req, res, next) {
  bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
  })(req, res, next);
}

// should be moved to middleware
exports.jwtValidator = function (req, res, next) {
  var authToken = getAuthToken(req);
  if (!authToken) {
    console.log('Access token not found');
    res.status(401).send('UnAuthorized: Invalid access token');
    return;
  }

  // pems genenrated from jwt token set based on userpool id and region
  var pems = {
    'TiGFVEk127LB0De5GxZ2PHul8EprtWLwJERnw52k97k=': '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAgEtZ6rjjDUEJfu3b7USScTBpuyEC2+PVS5H4Hi2Gowz/SGHE1CJc\n0D1qcMkqzx9GsAlDkSrvDk6YPkLaufRzkXG2wQx/ZS6/E2FDxftYbm2CQc4Ct9ob\nSqDViIG9a95oAEN8Fs1ft4l7QyqEmxces8hcgNjCXCQc1eiGjo/iwZdh0lj+WA49\nvPxvmQ+2JOfmeSgb7puRa3oSOSj9brd5ic9CcJc8R7skSLMwdq8Tw9kkD2KolJvF\na2x91E+kYzzCKGW47geUsLVLlQEEB+Z1IwpZWz6U/0hL29FuOi5oAP0CDaoJmFOl\nlHIrYqrY5DKNOEmX6Y4yakCpCOmdBIaTZwIDAQAB\n-----END RSA PUBLIC KEY-----\n',
    'vxMqpjNLIYNUKiPDnLOlzWmxDKVpN0hNm5MCqJV5bC4=': '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA3SRmAmPIA9i+79kV/sglG/APsT/MioLRNikIxJQavYqaSbvywnB5\nG5bJyzIi8a0G2m+D3cGMPzOn+NinviWrI3PRIzD7WH3lp8VC5xQEztJKC4i0Qjwi\nCpLOgIXFBl/qAHVsIrDmm1o1RmV8iNvWN5mYLODCONaGtBwqQUsScCoTkqE+Gtri\n7Fv3mvVknCGsMSckKY9TIoFRBW7UK8qDIOckR4yH291gGu8ADLSetGHpgqjnZWb1\nWOFVnzod5oaOgCtnTtd83h9ywHqi3DjJ2adyp17Ij3GyHNP3MfvRKtc4kdkEscK9\n0rzXbLcTBAd9qM+oF+J16bud0RTMdOLz+wIDAQAB\n-----END RSA PUBLIC KEY-----\n' 
  };

  var decodedJwt = jwt.decode(authToken, {complete: true});
  var kid = decodedJwt ? decodedJwt.header.kid : null;
  var pem = pems[kid];

  if (!pem) {
    console.log('Invalid access token');
    res.status(401).send('UnAuthorized: Invalid access token');
  }

  // in future, use socket.io to push the sessionToken, once expired
  jwt.verify(authToken, pem, { issuer: decodedJwt.payload.iss }, function(err, payload) {
    req.user = req.user || {};
    if(err && err.name === 'TokenExpiredError') {
      authCtrl.checkUserSession(function(data) {
        req.user.tokens = data;
        req.user.data = jwt.decode(data.sessionToken, {complete: true}).payload;
        next();
      }, function(err) {
        console.log(err);
        res.status(401).send('UnAuthorized: Invalid access token');
      });
    } else if (err) {
      console.log(err);
      res.status(401).send('UnAuthorized: Invalid access token');      
    } else {
      req.user.data = payload;
      next();
    }
  });
}
