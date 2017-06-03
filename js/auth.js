
function userSignIn () {
  var userName = $('#userName').val(),
      password = $('#password').val();

  $.ajax({
    url:'/api/user-sign-in',
    method: 'post',
    data: {
      userName: 'admin',
      password: 'P@ssW0rd'
    },
    success: function(response) {
      console.log(response.data);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function userSignUp () {
  var userName = $('#userName').val(),
      password = $('#password').val(),
      emailId = $('#emailId').val(),
      gender = $('#gender').val();

  $.ajax({
    url:'/api/user-sign-up',
    method: 'post',
    data: {
      emailId: 'jefree.sujit@gmail.com',
      userName: 'admin',
      password: 'P@ssW0rd',
      gender: 'male'
    },
    success: function(response) {
      console.log(response.data);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function signUpVerify () {
  var emailId = $('#emailId').val(),
      verificationPin = $('#verificationPin').val();

  $.ajax({
    url:'/api/verify-sign-up',
    method: 'post',
    data: {
      emailId: '',
      verificationPin: ''
    },
    success: function(response) {
      console.log(response.data);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

function forgotPassword () {
  var emailId = $('#emailId').val();

  $.ajax({
    url:'/api/forgot-password',
    method: 'post',
    data: {
      email: ''
    },
    success: function(response) {
      console.log(response.data);
    },
    error: function (err) {
      console.log(err);
    }
  });
}

$('#login-tab').on('click', function() {
  $('#tab-indicator').removeClass('slide');
  $('#register').addClass('hide');
  $('#login').removeClass('hide');
});

$('#register-tab').on('click', function() {
  $('#tab-indicator').addClass('slide');
  $('#login').addClass('hide');
  $('#register').removeClass('hide');
});

// function makeRequest(url, data, callBack) {
//   $.ajax({
//       url: url,
//       method: 'post',
//       data: data,
//       success: function (response) {
//         return {
//           type: 'success',
//           data: response
//         };
//       },
//       error: function (err) {
//         return {
//           type: 'error',
//           data: err
//         };
//       }
//     });
// }

$(document).ready(function() {
  $('#overlaySpinner').hide();

  $()
});