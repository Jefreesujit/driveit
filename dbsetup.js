var AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.update({
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
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
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
    console.log(JSON.stringify(data.Table.TableName, null, 2) + " table already exists");
  }
});
