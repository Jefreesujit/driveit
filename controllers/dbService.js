var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

exports.getFileLogs = function (req, res) {

}

exports.getActivityLogs = function (req, res) {

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
