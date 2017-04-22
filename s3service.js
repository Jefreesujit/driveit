var AWS = require('aws-sdk');
var fs = require('fs');

var bucketName = 'jefreesujit.com';
var s3 = new AWS.S3({
  accessKeyId: 'AKIAJOL562VDTNEAJ4UQ',
  secretAccessKey: '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',
  signatureVersion: 'v4',
  params: {
    Bucket: bucketName
  }
});

exports.upload = function (req, res) {
  var file = req.files.file;
  fs.readFile(file.path, function (err, data) {
    var params = { Key: file.originalFilename, Body: data} ;
    s3.upload(params, function(err, putData) {
      fs.unlink(file.path);  // delete the temp file
      if (err) {
        res.status(500).send(err); // err on file upload
      } else {
        console.log("Successfully uploaded data to " + bucketName + "/" + file.originalFilename);
        res.status(200).send(true);
      }
    });
  });
};

exports.listFiles = function (req, res) {
  s3.listObjects({}, function(err, data) {
    if (err) {
      res.status(500).send(err); // err on file upload
    } else {
      res.status(200).send(data);
    }
  });
};

exports.getFile = function (req, res) {
  var params = {Key: req.params.fileKey};
  s3.getObject(params, function(err, data) {
    if (err) {
      res.status(500).send(err); // err on file upload
    } else {
      res.setHeader('Content-disposition', 'attachment; filename='+req.params.fileKey);
      res.send(new Buffer(data.Body)); // data.body => buffer stream
    }
  });
};

exports.deleteFile = function (req, res) {
  var params = {Key: req.params.fileKey};
  s3.deleteObject(params, function(err, data) {
    if (err) {
      res.status(500).send(err); // err on file upload
    } else {
      res.status(200).send(data);
    }
  });
};
