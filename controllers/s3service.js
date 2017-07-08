var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({
  region: "us-west-2"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var bucketName = 'driveit.com';
var s3 = new AWS.S3({
  accessKeyId: 'AKIAJOL562VDTNEAJ4UQ',
  secretAccessKey: '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',
  signatureVersion: 'v4',
  params: {
    Bucket: bucketName
  }
});

function getFolderName (req) {
  console.log(req.user.data);
  return req.user.data.username.replace('@','-') + '/';
}

function formatData (req, data) {
  var formattedData = {
    Contents: data.Contents.map(function(content) {
      return {
        Size: content.Size,
        LastModified: content.LastModified,
        Key: content.Key.substring(getFolderName(req).length)
      }
    }),
    accessToken: (req.user && req.user.tokens) ? req.user.tokens.sessionToken : undefined
  }

  return formattedData;
}

exports.upload = function (req, res) {
  var file = req.files.file;
  fs.readFile(file.path, function (err, data) {
    var filePath = getFolderName(req) + file.originalFilename;
    console.log(filePath);
    var params = { Key: filePath, Body: data} ;
    s3.upload(params, function(err, putData) {
      fs.unlink(file.path);  // delete the temp file
      if (err) {
        res.status(500).send(err); // err on file upload
      } else {
        console.log("Successfully uploaded data to " + bucketName + "/" + file.originalFilename);
        addFileLogs({fileName: file.originalFilename, email: req.user.data.username, operation: 'ADD'});
        res.status(200).send(true);
      }
    });
  });
};

exports.listFiles = function (req, res) {
  s3.listObjects({
    Prefix: getFolderName(req)
  }, function(err, data) {
    if (err) {
      res.status(500).send(err); // err on file listing
    } else {
      res.status(200).send(formatData(req, data));
    }
  });
};

exports.getFile = function (req, res) {
  var params = {Key: getFolderName(req) + req.params.fileKey};
  s3.getObject(params, function(err, data) {
    if (err) {
      res.status(500).send(err); // err on file download
    } else {
      addFileLogs({fileName: req.params.fileKey, email: req.user.data.username, operation: 'DOWNLOAD'});
      res.setHeader('Content-disposition', 'attachment; filename='+req.params.fileKey);
      res.send(new Buffer(data.Body)); // data.body => buffer stream
    }
  });
};

exports.deleteFile = function (req, res) {
  var params = {Key: getFolderName(req) + req.params.fileKey};
  s3.deleteObject(params, function(err, data) {
    if (err) {
      res.status(500).send(err); // err on file deletion
    } else {
      addFileLogs({fileName: req.params.fileKey, email: req.user.data.username, operation: 'DELETE'});
      res.status(200).send(data);
    }
  });
};

function addFileLogs (data) {
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
