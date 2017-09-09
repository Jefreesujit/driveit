
function userSignIn (header) {
  $.ajax({
    url:'/api/user-sign-in',
    method: 'post',
    headers: {
      Authorization: 'basic ' + header
    },
    success: function(response) {
      $('#login-info-text').html('');
      $('#login-info-text').removeClass('error');
      localStorage.setItem('accessToken', response.sessionToken);
      localStorage.setItem('username', response.username)
      window.location = response.redirectUrl;
    },
    error: function (err) {
      $('#login-info-text').html(err.responseJSON.message);
      $('#login-info-text').addClass('error');
      $('#overlaySpinner').hide();
    }
  });
}

function userSignUp (header) {
  $.ajax({
    url:'/api/user-sign-up',
    method: 'post',
    headers: {
      Authorization: 'basic ' + header
    },
    success: function(response) {
      $('#reg-info-text').html('');
      $('#reg-info-text').removeClass('error');
      $('#register-section').addClass('hide');
      $('#verify-section').removeClass('hide');
      $('#verify-email').val(response.email);
      $('#verify-email').prop("readonly", true);
      $('#verify-info-text').html(response.message);
      $('#overlaySpinner').hide();
    },
    error: function (err) {
      $('#reg-info-text').html(err.responseJSON.message);
      $('#reg-info-text').addClass('error');
      $('#overlaySpinner').hide();
    }
  });
}

function signUpVerify (header) {
  $.ajax({
    url:'/api/verify-sign-up',
    method: 'post',
    headers: {
      Authorization: 'basic ' + header
    },
    success: function(response) {
      $('#verify-info-text').html('');
      $('#verify-info-text').removeClass('error');
      $('#register').addClass('hide');
      $('#login').removeClass('hide');
      $('#login-info-text').html(response.message);
      $('#login-info-text').removeClass('error');
      $('#overlaySpinner').hide();
    },
    error: function (err) {
      $('#verify-info-text').html(err.responseJSON.message);
      $('#verify-info-text').addClass('error');
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
      password = $('#log-password').val(),
      header = btoa(email+':'+password);

  $('#overlaySpinner').show();
  userSignIn(header);
  return false;
});

$('#register-form').on('submit', function() {
  var email = $('#reg-email').val(),
      password = $('#reg-password').val(),
      username = $('#reg-username').val(),
      header = btoa(email+':'+username+':'+password);

  $('#overlaySpinner').show();
  userSignUp(header);
  return false;
});

$('#pr-form').on('submit', function() {
  var email = $('#pr-email').val();
  return false;
});

$('#verify-form').on('submit', function() {
  var email = $('#verify-email').val(),
      pin = $('#verify-code').val(),
      header = btoa(email+':'+pin);

  $('#overlaySpinner').show();
  signUpVerify(header);
  return false;
});

$(document).ready(function() {
  $('#overlaySpinner').hide();
});
