function userSignIn () {
  $.post('/api/user-sign-in',function() {

  });
}

function userSignUp () {
  $.ajax({
    url:'/api/user-sign-up',
    method: 'post',
    data: {
      userName: '',
      password: ''
    },
    success: function() {},
    error: function () {}
  });
}

function signUpVerify () {
  $.post('/api/verify-sign-up',function() {

  });
}

function forgotPassword () {
  $.post('/api/verify-sign-up',function() {

  });
}

function makeRequest(url, data, callBack) {
  $.ajax({
      url: url,
      method: 'post',
      data: data,
      success: function (response) {
        return {
          type: 'success',
          data: response
        };
      },
      error: function (err) {
        return {
          type: 'error',
          data: err
        };
      }
    });
}