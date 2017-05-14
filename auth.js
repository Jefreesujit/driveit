var AWS = require('aws-sdk');
require('colors');
// The parameters required to intialize the Cognito Credentials object.
// If you are authenticating your users through one of the supported
// identity providers you should set the Logins object with the provider
// tokens. For example:
// Logins: {
//   graph.facebook.com : facebookResponse.authResponse.accessToken
// }
var COGNITO_SYNC_TOKEN,
    COGNITO_SYNC_COUNT,
    COGNITO_DATASET_NAME = 'User',
    COGNITO_IDENTITY_ID,
    COGNITO_IDENTITY_POOL_ID = "us-west-2:84112f2b-037f-457e-9cb8-2227f7b6b44b",
    params = {
      IdentityPoolId: COGNITO_IDENTITY_POOL_ID
    };

// set the Amazon Cognito region
AWS.config.region = 'us-west-2';
// initialize the Credentials object with our parameters
// AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
var cognitoSyncClient = new AWS.CognitoSync();
// We can set the get method of the Credentials object to retrieve
// the unique identifier for the end user (identityId) once the provider
// has refreshed itself

function getCognitoId () {
  // AWS.config.credentials is instantiated on userSignIn function itself
  AWS.config.credentials.get(function(err) {
    if (err) {
      console.log("Error: "+err);
      return;
    }
    console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);

    COGNITO_IDENTITY_ID = AWS.config.credentials.identityId;

    getCognitoSyncClient();

    // var syncClient = new AWS.CognitoSyncManager();
    // syncClient.openOrCreateDataset('myDataset', function(err, dataset) {
    //   dataset.put('myKey', 'myValue', function(err, record){
    //      dataset.synchronize({
    //         onSuccess: function(data, newRecords) {
    //             // Your handler code here
    //             console.log(data, newRecords);
    //         }
    //      });
    //   });
    // });

    // Other service clients will automatically use the Cognito Credentials provider
    // configured in the JavaScript SDK.


  });
}

function getCognitoSyncClient () {
  cognitoSyncClient.listRecords({
    DatasetName: COGNITO_DATASET_NAME,
    IdentityId: COGNITO_IDENTITY_ID,
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID
  }, function(err, data) {
    if ( !err ) {
      console.log("listRecords: ".green + JSON.stringify(data));
      COGNITO_SYNC_TOKEN = data.SyncSessionToken;
      COGNITO_SYNC_COUNT = data.DatasetSyncCount;
      console.log("SyncSessionToken: ".green + COGNITO_SYNC_TOKEN);           /* successful response */
      console.log("DatasetSyncCount: ".green + COGNITO_SYNC_COUNT);
      addRecord();
    } else {
      console.log('error', err);
    }
  });
}

function addRecord () {
    var params = {
    DatasetName: COGNITO_DATASET_NAME, /* required */
    IdentityId: COGNITO_IDENTITY_ID, /* required */
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID, /* required */
    SyncSessionToken: COGNITO_SYNC_TOKEN, /* required */
    RecordPatches: [
      {
        Key: 'USER_ID', /* required */
        Op: 'replace', /* required */
        SyncCount: COGNITO_SYNC_COUNT, /* required */
        Value: 'user-'+COGNITO_IDENTITY_ID
      }
    ]
  };

  cognitoSyncClient.updateRecords(params, function(err, data) {
    if (err) console.log("updateRecords: ".red + err, err.stack); /* an error occurred */
    else     console.log("Value: ".green + JSON.stringify(data));           /* successful response */
  });
}

module.exports = getCognitoId;
