
function getProfileInfo () {
  $('#overlaySpinner').show();
  $.ajax({
    url:'api/get-profile-info',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem("accessToken")
    },
    success: function(response) {
      var keys = Object.keys(response);
      var content = keys.map(function(key) {
        return (
          '<div class="user-profile email">'+
            '<span class="user-label">' + key + '</span>'+
            '<span class="user-value">' + response[key] + '</span>'+
          '</div>'
        );
      });
      $('#profileInfo').html(content);
      $('#overlaySpinner').hide();
    },
    error: function(err) {
      $('#overlaySpinner').hide();
    }
  });
}

$('#leftPaneBtn').on('click', function() {
  $('#leftPane').addClass('expanded');
  $('#sliderOverlay').addClass('show');
});

$('#sliderOverlay').on('click', function() {
  $('#leftPane').removeClass('expanded');
  $('#sliderOverlay').removeClass('show');
});

$(document).ready(function() {
  window.scrollTo(0,1);
  var name = localStorage.getItem("username");
  $('#overlaySpinner').show();
  $('#profileName').text(name);
  $('#profileIcon').html(name[0]);
  getProfileInfo();
});
