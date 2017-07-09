// 'use strict';

// AWS Cognito for authenticating user
// https://github.com/aws/amazon-cognito-identity-js

var Cog = require('amazon-cognito-identity-js');
var AWS = require('aws-sdk');
require('amazon-cognito-js');
require('colors');
var jwkToPem = require('jwk-to-pem');

//import { userPool, USERPOOL_ID, IDENTITY_POOL_ID } from './aws_profile'
// var uuid = require('node-uuid');

// https://github.com/aws/amazon-cognito-js/
// entire cognito sync

var CognitoUserPool = Cog.CognitoUserPool,
	CognitoUserAttribute = Cog.CognitoUserAttribute,
	CognitoUser = Cog.CognitoUser,
	AuthenticationDetails = Cog.AuthenticationDetails,
	CognitoIdentityCredentials = Cog.CognitoIdentityCredentials,
	WebIdentityCredentials = Cog.WebIdentityCredentials;

var userData = {
    UserPoolId : 'us-west-2_YA4EOBm4d',
    ClientId : '4n3bl6imsur2pd79dj6lle8a8q'
};

var USERPOOL_ID = 'cognito-idp.us-west-2.amazonaws.com/us-west-2_YA4EOBm4d';
var IDENTITY_POOL_ID = 'us-west-2:84112f2b-037f-457e-9cb8-2227f7b6b44b';


var userPool = new CognitoUserPool(userData);

// get the jwt token set for userpool id, to validate against the api calls
var jwtTokenSet = {"keys":[
	{"alg":"RS256","e":"AQAB","kid":"TiGFVEk127LB0De5GxZ2PHul8EprtWLwJERnw52k97k=","kty":"RSA","n":"gEtZ6rjjDUEJfu3b7USScTBpuyEC2-PVS5H4Hi2Gowz_SGHE1CJc0D1qcMkqzx9GsAlDkSrvDk6YPkLaufRzkXG2wQx_ZS6_E2FDxftYbm2CQc4Ct9obSqDViIG9a95oAEN8Fs1ft4l7QyqEmxces8hcgNjCXCQc1eiGjo_iwZdh0lj-WA49vPxvmQ-2JOfmeSgb7puRa3oSOSj9brd5ic9CcJc8R7skSLMwdq8Tw9kkD2KolJvFa2x91E-kYzzCKGW47geUsLVLlQEEB-Z1IwpZWz6U_0hL29FuOi5oAP0CDaoJmFOllHIrYqrY5DKNOEmX6Y4yakCpCOmdBIaTZw","use":"sig"},
	{"alg":"RS256","e":"AQAB","kid":"vxMqpjNLIYNUKiPDnLOlzWmxDKVpN0hNm5MCqJV5bC4=","kty":"RSA","n":"3SRmAmPIA9i-79kV_sglG_APsT_MioLRNikIxJQavYqaSbvywnB5G5bJyzIi8a0G2m-D3cGMPzOn-NinviWrI3PRIzD7WH3lp8VC5xQEztJKC4i0QjwiCpLOgIXFBl_qAHVsIrDmm1o1RmV8iNvWN5mYLODCONaGtBwqQUsScCoTkqE-Gtri7Fv3mvVknCGsMSckKY9TIoFRBW7UK8qDIOckR4yH291gGu8ADLSetGHpgqjnZWb1WOFVnzod5oaOgCtnTtd83h9ywHqi3DjJ2adyp17Ij3GyHNP3MfvRKtc4kdkEscK90rzXbLcTBAd9qM-oF-J16bud0RTMdOLz-w","use":"sig"}
]};

// iterate and create pem keys for each JWT key token set
var pems = {},
	keys = jwtTokenSet.keys;

for(var i = 0; i < keys.length; i++) {
    //Convert each key to PEM
    var key_id = keys[i].kid;
    var modulus = keys[i].n;
    var exponent = keys[i].e;
    var key_type = keys[i].kty;
    var jwk = { kty: key_type, n: modulus, e: exponent};
    var pem = jwkToPem(jwk);
    pems[key_id] = pem;
}

// console.log(pems);

// // we create an array of all attributes, without the `custom:` prefix.
// // This will be used for building the React-Redux object in plain JS, hence no AWS Cognito related name requirements
// var landlordAttrs = ["email", "agentName", "id"]
// // we create an array of all our desired attributes for changing, and we loop through this array to access the key name.
// // This will be used for AWS Cognito related name requirements
// var attrs = ["custom:agentName"]



// sign up user with the 3 paramesters we require (AWS itself only requires 2: email and password)
exports.signUpUser = function (email, name, password){
	// instantiate a promise so we can work with this async easily
	var p = new Promise((res, rej)=>{
		// create an array of attributes that we want
		var attributeList = []
		// create the attribute objects in plain JS for each parameter we want to save publically (aka NOT the password)
		var dataEmail = {
		    Name : 'email',
		    Value : email
		}
		var dataName = {
		    Name : 'name',
		    Value : name
		}
		var dataGender = {
		    Name : 'gender',
		    Value : 'male'
		}
		// take each attribute object and turn it into a CognitoUserAttribute object
		var attributeEmail = new CognitoUserAttribute(dataEmail)
		var attributeName = new CognitoUserAttribute(dataName)
		var attributeGender = new CognitoUserAttribute(dataGender)
		// add each CognitoUserAttribute to the attributeList array
		attributeList.push(attributeEmail, attributeName, attributeGender)
		// call the signUp method of our userPool, passing in email+password as the first 2 args (the two that AWS requires)
		// and as the 3rd arg pass in the attributeList array, followed by `null` as the 4th arg
		// finally as the 5th (last) arg, pass in the callback function that has the error or result from AWS
		userPool.signUp(email, password, attributeList, null, function(err, result){
		    if (err) {
		        rej(err)
						return
		    }
				// resolve the promise with whatever attributes you need
				// in this case, we return an object with only the email attribute because we will save that to localStorage
		    res({email})
		})
	})
	return p;
}

// sign in user with 2 parameters (email and password)
exports.signInUser = function (email, password){
	// use a promise to handle async
	var p = new Promise((res, rej)=>{
		// create an `AuthenticationDetails` Cognito object filled with the email+password
		var authenticationDetails = new AuthenticationDetails({
			Username: email,
			Password: password
		})
		// create a `CognitoUser` object filled with a username and identity pool
		var userData = {
			Username: email,
			Pool: userPool
		}
		var cognitoUser = new CognitoUser(userData)
		// call the `authenticateUser` method from Cognito, passing in the `CognitoUser` object and the `AuthenticationDetails` object
		authenticateUser(cognitoUser, authenticationDetails)
			// check if there is an S3 album for the user, and if not, then create one
			.then((data)=>{
				// if successfully authenticated, build the user object to return to the Redux state to use
				res(data);
			})
			.catch((err)=>{
				// if failure, reject the promise
				rej(err)
			})
	})
	return p;
}

// authenticate a user with its `CognitoUser` and `AuthenticationDetails` AWS objects
function authenticateUser(cognitoUser, authenticationDetails){
	// use a promise to handle async
	console.log('entered authenticateUser');
	var p = new Promise((res, rej)=>{
		// call the `authenticateUser` method of the `CognitoUser` object, passing in the `AuthenticationDetails`
		cognitoUser.authenticateUser(authenticationDetails, {
					// handle if successfull
	        onSuccess: function (result) {
							// save the jwtToken on localStorage for access elsewhere in app
	            // localStorage.setItem('user_token', result.accessToken.jwtToken);
	            console.log("======== VIEW THE REFRESH TOKEN =========")
	            // console.log(localStorage.getItem('user_token'))
	            console.log("======== VIEW THE AUTHENICATION RESULT =========")
	            // console.log(result);

							// To
			    		// Edge case, AWS Cognito does not allow for the Logins attr to be dynamically generated. So we must create the loginsObj beforehand
	            var loginsObj = {
	                // For the object's key name, use the USERPOOL_ID taken from our shared aws_profile js file
									// For the object's value, use the jwtToken received in the success callback
	                [USERPOOL_ID]: result.getIdToken().getJwtToken()
	            }
							// in order to use other AWS services (such as S3), we need the correct AWS credentials
							// we set these credentials by passing in a `CognitoIdentityCredentials` object that has our identity pool id and logins object
							// we are logging into an AWS federated identify pool
				AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId : IDENTITY_POOL_ID, // your identity pool id here
	                Logins : loginsObj
	            })
					// then we refresh our credentials to use the latest one that we set
	            AWS.config.credentials.refresh(function(){
	            	//console.log(AWS.config.credentials)
	            })
				// resolve the promise to move on to next step after authentication
	            res({
	            	success: true,
	            	idToken: result.idToken.jwtToken,
	            	sessionToken: result.accessToken.jwtToken,
	            	refreshToken: result.refreshToken.token
	            });
	        },
					// if there was a failure, we reject the promise
	        onFailure: function(err) {
	            console.log('onFailure', err)
	            rej(err)
	        },
	        newPasswordRequired: function(userAttributes, requiredAttributes) {
	            // User was signed up by an admin and must provide new 
	            // password and required attributes, if any, to complete 
	            // authentication.

	            // userAttributes: object, which is the user's current profile. It will list all attributes that are associated with the user. 
	            // Required attributes according to schema, which don’t have any values yet, will have blank values.
	            // requiredAttributes: list of attributes that must be set by the user along with new password to complete the sign-in.

	            console.log('userAttributes', userAttributes);
	            console.log('requiredAttributes', requiredAttributes);

	            var newPassword = 'P@ssW0rd',
	            	attributesData = {
	            		gender: 'male',
  						name: 'Auto Generated Name',
	            	};
	            // Get these details and call 
	            // newPassword: password that user has given
	            // attributesData: object with key as attribute name and value that the user has given.
	            cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, this);
	        }
	    })
	})
	return p
}

// // buildUserObject() gets the user attributes from Cognito and creates an object to represent our user
// // this will be used by the Redux state so that we can reference the user
// function buildUserObject(cognitoUser){
// 	var p = new Promise((res, rej)=>{
// 		// call the cognito function `getUserAttributes()`
// 		cognitoUser.getUserAttributes(function(err, result) {
// 	        if (err) {
// 	            console.log(err);
// 	    				rej(err)
// 							return
// 	        }
// 					// instantiate an empty object
// 	        let userProfileObject = {}
// 					// loop through the userAttributes and append to `userProfileObject` as attributes
// 					for (let i = 0; i < result.length; i++) {
// 						// custom Cognito attributes will be prefixed with `custom:`, so we must strip away that from the string
// 		        if(result[i].getName().indexOf('custom:') >= 0){
// 		    		let name = result[i].getName().slice(7, result[i].getName().length)
// 		    		userProfileObject[name] = result[i].getValue()
// 		    	}else{
// 						// normal Cognito attributes will not be prefixed with `custom:` so we can use use the string immediately
// 		    		userProfileObject[result[i].getName()] = result[i].getValue()
// 		    	}
// 		    }
// 	      // and now our user profile object is complete and we resolve the promise to move on to the next step
// 	      res(userProfileObject)
// 	    })
// 	})
// 	return p
// }

// when users sign up, they need to verify their account
// verification requires their unique identifier (in this case, their email) and the verification PIN
exports.verifyUserAccount = function (email, pin) {
	var p = new Promise((res, rej)=>{
		// we create an object to hold our userData that will be used to create our `cognitoUser` object
		// we cannot just use `userPool` to instantiate a `cognitoUser` object, as no user has been signed in yet
		var userData = {
			Username: email,
			Pool: userPool
		}
		// create the `cognitoUser` object
		var cognitoUser = new CognitoUser(userData)
		// call the `confirmRegistration()` function of `cognitoUser` and pass in the verification PIN
		cognitoUser.confirmRegistration(pin, true, function(err, result) {
	        if (err) {
	            console.log(err);
		        rej(err)
	            return;
	        }
	        // if successful, we signout to refresh the cognitoUser (they will have to login again)
					// actually this is not mandatory either, but during testing I discovered that login does not immediately work after verification due to un-refreshed authentication
					// logging in again will get those authentication tokens
	        if(result == "SUCCESS") {
	        	// console.log("Successfully verified account!")
	        	// cognitoUser.signOut()
	        	res({success: true})
	        }else {
						// if otherwise failure, we reject the promise
	        	rej("Could not verify account")
	        }
	    })
	})
	return p
}

// // if we want to update the info of our user, we must pass in their unique identifier (email) and an object representing the user info
// <<<<<<< HEAD
// export function updateUserInfo(email, editedInfo){
// =======
// export function updateUserInfo(editedInfo){
// >>>>>>> CognitoUpdates/master
// 	console.log(editedInfo)
// 	var p = new Promise((res, rej)=>{
// 		// we create an array for our attributes that we want to update, and push all `CognitoUserAttribute` objects into it
// 		var attributeList = []
// 		// loop through the `attrs` array to create our `CognitoUserAttribute` objects
// 		for(let a = 0; a<attrs.length; a++){
// 			if(editedInfo[attrs[a]]){
// 				console.log(editedInfo[attrs[a]])
// 				// using the attr[position] to get our key name, we can find the value via editedInfo[attr[position]]
// 				let attribute = {
// 		        Name : attrs[a],
// 		        Value : editedInfo[attrs[a]]
// 		    }
// 				// convert into `CognitoUserAttribute` object
// 		    let x = new CognitoUserAttribute(attribute)
// 				// add it to the `attributeList` array
// 		    attributeList.push(x)
// 			}
// 		}
// 		console.log(attributeList)
// 		// instantiate the `cognitoUser` from our userPool (we can do this because the user is already signed in if they are attempting to change their attributes)
//     var cognitoUser = userPool.getCurrentUser()
// 		// get the latest cognito session so that we can `updateAttributes()`
//     cognitoUser.getSession(function(err, result) {
//         if (result) {
// 					// if we successfully got the latest session, we can `updateAttributes()` from 'cognitoUser', passing in the `attributeList` array
//           cognitoUser.updateAttributes(attributeList, function(err, result) {
// 						// reject promise if the update attempt failed
// 		        if (err) {
// 		            console.log(err);
// 	        			rej(err)
// 		            return;
// 		        }
// 						// we user `setTimeout()` to give AWS some time to update the user properties
// <<<<<<< HEAD
// 		        setTimeout(()=>{
// =======
// >>>>>>> CognitoUpdates/master
// 							// then we get the latest user attributes
// 			        cognitoUser.getUserAttributes(function(err, result) {
// 								// reject promise if failed
// 				        if (err) {
// 				            console.log(err);
// 	        					rej(err)
// 				            return;
// 				        }
// 								// if success, then `buildUserObject()` again and resolve the promise with `userProfileObject`
//  				        buildUserObject(cognitoUser)
// 				        	.then((userProfileObject)=>{
// <<<<<<< HEAD
// 				        		res(userProfileObject)
// 				        	})
// 				    	})
// 		        }, 500)
// =======
// 										console.log(userProfileObject)
// 				        		res(userProfileObject)
// 				        	})
// 				    	})
// >>>>>>> CognitoUpdates/master
// 		    });
//       }
//     });
// 	})
// 	return p
// }

// // if a user forgets a password, we can instantiate the password reset process (requiring an email)
// export function forgotPassword(email){
// 	var p = new Promise((res, rej)=>{
// 		// we create the `userData` object to create a `cognitoUser`
//  		var userData = {
// 			Username: email,
// 			Pool: userPool
// 		}
// 		// we must create a new `cognitoUser` instead of using `userPool` since no user is currently logged in
// 		var cognitoUser = new CognitoUser(userData)

// 		// call the `forgotPassword()` function of `cognitoUser`
// 		cognitoUser.forgotPassword({

// 					// we are resolving the `cognitoUser` in our promise because the React component will use it to call `cognitoUser.confirmPassword()`
// 					// thats also why we pass in the `forgotPassword` `this` to be used in the React component

// 					// if successful, then we can resolve the promise with cognitoUser and the `this` declaration from the React component that calls `forgotPassword()`
// 					// but we may also resolve the promise with the third function `inputVerificationCode()` which handles behind the scenes of `forgotPassword()`
// 	        onSuccess: function (result) {
// 	            console.log('call result: ' + result);
// 							// res({
// 							// 	cognitoUser: cognitoUser,
// 							//	thirdArg: this
// 							// })
// 	        },
// 					// if failure, reject the promise
// 	        onFailure: function(err) {
// 		        rej(err)
// 	        },
// 	        // Optional automatic callback that passes in `data` object from `forgotPassword()` and resolve the same was as `onSuccess`
// 					// `inputVerificationCode()` handles behind the scenes of `forgotPassword()`, but we don't actually use it. Its here if needed in the future.
// 	        inputVerificationCode: function(data) {
// 	            //console.log('Code sent to: ' + data)
// 	            res({
// 	            	cognitoUser: cognitoUser,
// 	            	thirdArg: this
// 	            })
// 	        }
// 	    })
// 	})
// 	return p
// }

// // reset the verification PIN for verifying a new user
// export function resetVerificationPIN(email){
// 	var p = new Promise((res, rej)=>{
// 		// create the `userData` object for instantiating a new `cognitoUser` object
// 		var userData = {
// 			Username: email,
// 			Pool: userPool
// 		}
// 		// create the `cognitoUser` object
// 		var cognitoUser = new CognitoUser(userData)
// 		// and call the `resendConfirmationCode()` of `cognitoUser`
// 		cognitoUser.resendConfirmationCode(function(err, result) {
// 					// reject promise if confirmation code failed
// 	        if (err) {
// 	          console.log(err);
// 		        rej(err)
// <<<<<<< HEAD
// 						return
// =======
// >>>>>>> CognitoUpdates/master
// 	        }
// 					// resolve if successfull
// 	        res()
// 	    })
// 	})
// 	return p
// }

// // for automatic signin of a user (so they don't have to login each time)
exports.retrieveUserFromLocalStorage = function (email) {
	var p = new Promise((res, rej)=>{
			// grab the `cognitoUser` object from `userPool`
			// this is possible without login because we had already logged in before (whereas verifyPIN and resetPassword have not)
	    // var cognitoUser = userPool.getCurrentUser();
	    //console.log('email', email);
		var userData = {
			Username: email,
			Pool: userPool
		}
		// create the `cognitoUser` object
		var cognitoUser = new CognitoUser(userData);
		//console.log('cognitoUser', cognitoUser);
	    console.log("Getting cognitoUser from local storage...")
	    if (cognitoUser != null) {
	    	//console.log('Fix login issue', cognitoUser.username);
					// get the latest session from `cognitoUser`
	        cognitoUser.getSession(function(err, session) {
							// if failed to get session, reject the promise
	            if (err) {
	            	console.log('get session error', err)
	                rej(err)
					return;
	            }
				// check that the session is valid
	            console.log('session validity: ' + session.isValid());
	            //console.log(session);
							// save to localStorage the jwtToken from the `session`
	            // localStorage.setItem('user_token', session.getAccessToken().getJwtToken());
	            // Edge case, AWS Cognito does not allow for the Logins attr to be dynamically generated. So we must create the loginsObj beforehand
	            var loginsObj = {
	                // our loginsObj will just use the jwtToken to verify our user
	                [USERPOOL_ID] : session.getIdToken().getJwtToken()
	            }
							// create a new `CognitoIdentityCredentials` object to set our credentials
							// we are logging into a AWS federated identity pool
			    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId : IDENTITY_POOL_ID, // your identity pool id here
	                Logins : loginsObj
	            })
							// refresh the credentials so we can use it in our app
	            AWS.config.credentials.refresh(function(){
	            	//console.log(AWS.config.credentials)
								// resolve the promise by again building the user object to be used in our React-Redux app
	            	res({
		            	idToken: session.idToken.jwtToken,
		            	sessionToken: session.accessToken.jwtToken,
		            	refreshToken: session.refreshToken.token
	            	})
	            })
	        });
	    }else{
				// if failure, reject the promise
	    	rej('Failed to retrieve user from localStorage')
	    }
	})
	return p;
}

// signout the current user
exports.signOutUser = function (email) {
	var p = new Promise((res, rej) => {
		// since the user is already logged in, we can instantiate `cognitoUser` with `userPool`
		var userData = {
			Username: email,
			Pool: userPool
		}
		// create the `cognitoUser` object
		var cognitoUser = new CognitoUser(userData);
		console.log('signOut', cognitoUser.signOut);
		cognitoUser.signOut();
		res(email);
	});
	return p;
}

// // login to cognito using Facebook instead of an AWS email/password login flow
// // requires first logging in with Facebook and passing in the result of the login function to `registerFacebookLoginWithCognito()`
// export function registerFacebookLoginWithCognito(response){
// 	console.log("registerFacebookLoginWithCognito")
// 	console.log(response)
// 	// Check if the user logged in successfully.
// 	  if (response.authResponse) {

// 	    console.log('You are now logged in.');

// 	    // Add the Facebook access token to the Cognito credentials login map
// 			// we pass in the accessToken from the fb response into our `CognitoIdentityCredentials`
// 	    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// 				// we are logging into an AWS federated identify pool, for facebook login
// 	      IdentityPoolId: IDENTITY_POOL_ID,
// 	      Logins: {
// 	         'graph.facebook.com': response.authResponse.accessToken
// 	      }
// 	    })

// 	    // AWS Cognito Sync to sync Facebook
// 			// aka refreshing the credentials to use thorughout our app
// 	    AWS.config.credentials.get(function() {
// 		    var client = new AWS.CognitoSyncManager();
// 		    console.log(AWS.config.credentials)
// 		});

// 	  } else {
// 	    console.log('There was a problem logging you in.');
// 	  }
// }

/* ==================================== */

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

exports.getCognitoId = function () {
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

