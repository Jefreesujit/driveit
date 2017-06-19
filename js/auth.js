
function userSignIn (data) {
  $.ajax({
    url:'/api/user-sign-in',
    method: 'post',
    data: data,
    success: function(response) {
      console.log(response.sessionToken);
      sessionStorage.setItem('accessToken', response.sessionToken);
      window.location = response.redirectUrl;
    },
    error: function (err) {
      console.log(err);
      $('#overlaySpinner').hide();
    }
  });
}

function userSignUp (data) {
  $.ajax({
    url:'/api/user-sign-up',
    method: 'post',
    data: data,
    success: function(response) {
      console.log(response);
      $('#register-section').addClass('hide');
      $('#verify-section').removeClass('hide');
      $('#verify-email').val(response.email);
      $('#verify-email').prop("readonly", true);
      $('#overlaySpinner').hide();
    },
    error: function (err) {
      console.log(err);
      $('#overlaySpinner').hide();
    }
  });
}

function signUpVerify (data) {
  $.ajax({
    url:'/api/verify-sign-up',
    method: 'post',
    data: data,
    success: function(response) {
      console.log(response);
      $('#register').addClass('hide');
      $('#login').removeClass('hide');
      $('#overlaySpinner').hide();
    },
    error: function (err) {
      console.log(err);
      $('#overlaySpinner').hide();
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

// attaching events

$('#login-tab').on('click', function() {
  $('#tab-indicator').removeClass('slide');
  $('#register').addClass('hide');
  $('#login').removeClass('hide');
});

$('#forgot-password').on('click', function() {
  $('#login-section').addClass('hide');
  $('#password-reset').removeClass('hide');
});

$('#login-back').on('click', function() {
  $('#password-reset').addClass('hide');
  $('#login-section').removeClass('hide');
});

$('#verify-code-input').on('click', function() {
  $('#register-section').addClass('hide');
  $('#verify-section').removeClass('hide');
});

$('#register-back').on('click', function() {
  $('#verify-section').addClass('hide');
  $('#register-section').removeClass('hide');
});

$('#register-tab').on('click', function() {
  $('#tab-indicator').addClass('slide');
  $('#login').addClass('hide');
  $('#register').removeClass('hide');
});

$('#login-form').on('submit', function() {
  var email = $('#log-email').val(),
      password = $('#log-password').val();
  $('#overlaySpinner').show();
  console.log({email, password});
  userSignIn({email, password});
  return false;
});

$('#register-form').on('submit', function() {
  var email = $('#reg-email').val(),
      password = $('#reg-password').val(),
      username = $('#reg-username').val();
  $('#overlaySpinner').show();
  userSignUp({email, username, password});
  console.log({email, username, password});
  return false;
});

$('#pr-form').on('submit', function() {
  var email = $('#pr-email').val();
  // $('#overlaySpinner').show();
  console.log({email});
  return false;
});

$('#verify-form').on('submit', function() {
  var email = $('#verify-email').val(),
      pin = $('#verify-code').val();
  $('#overlaySpinner').show();
  signUpVerify({email, pin});
  console.log({email, pin});
  return false;
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
});
