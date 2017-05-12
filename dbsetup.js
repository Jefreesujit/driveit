var AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.update({
  accessKeyId: 'AKIAJOL562VDTNEAJ4UQ',
  secretAccessKey: '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',
  signatureVersion: 'v4',
  region: "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

var params = {
  TableName : "Users",
  KeySchema: [       
    { AttributeName: "userid", KeyType: "HASH"},  //Partition key
    { AttributeName: "email", KeyType: "RANGE" }  //Sort key
  ],
  AttributeDefinitions: [       
    { AttributeName: "userid", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

dynamodb.describeTable({TableName: 'Users'}, function(err, data) {
  if (err) {
    dynamodb.createTable(params, function(err, data) {
      if (err) {
        console.error("Unable to create User table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("Created User table. Table description JSON:", JSON.stringify(data, null, 2));
      }
    });
  } else {
    console.log("User table already exists", JSON.stringify(data, null, 2));
  }
});


/* 
file structure 

User [
  user1: {
    userId: "",
    name: "",
    email: "",
    pasword: "",
    fileLogs: [
      file1: {
        fileId: '',
        fileName: '',
        fileOperation: '',
        date: ''
      }
    ]
  }
]

*/
