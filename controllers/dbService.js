var AWS = require('aws-sdk');

AWS.config.update({
  region: "us-west-2"
});

var docClient = new AWS.DynamoDB.DocumentClient();

exports.getActivityLogs = function (req, res) {
  var params =  {
    TableName: "Users",
    ProjectionExpression: "fileLogs,activityLogs",
    FilterExpression: "#email = :username",
    ExpressionAttributeNames: {
      "#email": "email",
    },
    ExpressionAttributeValues: {
      ":username": req.user.data.username
    }
  };

  docClient.scan(params, function (err, data) {
    if (err) {
      //console.log('log fetch error', err);
      res.status(500).json(err);
    } else {
      res.status(200).json({
        fileLogs: data.Items[0].fileLogs,
        accessToken: (req.user && req.user.tokens) ? req.user.tokens.sessionToken : undefined
      });
    }
  });
}

exports.addFileLogs = function (data) {
  var record = {
        fileName: data.fileName,
        fileOperation: data.operation,
        status: 'SUCCESS',
        timestamp: new Date().toJSON()
      },
      params =  {
        TableName: "Users",
        Key:{
          userid: data.email,
          email: data.email
        },
        UpdateExpression: "set #fileLogs = list_append(#fileLogs, :record)",
        ExpressionAttributeNames: {
          '#fileLogs' : 'fileLogs'
        },
        ExpressionAttributeValues:{
            ":record": [record]
        },
        ReturnValues:"UPDATED_NEW"
      };

  docClient.update(params, function (err, data) {
    if (err) {
      // console.log('file error', err);
    } else {
      // console.log('file success', data);
    }
  });
}

exports.addUserEntry = function (data) {
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
      // console.log('error', err);
    } else {
      // console.log('success', data);
    }
  });
}

exports.addActivityLogs = function (data) {
  var record = {
        activity: data.action,
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
