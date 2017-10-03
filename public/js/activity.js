function getBodyContent (data) {
  if (data && data.length) {
    $('#noFileSection').hide();
    $('#fileListHeader').show();
  } else {
    $('#fileListHeader').hide();
    $('#noFileSection').show();
  }
}

function getFilesList () {
  var authHeader = 'Bearer ' + localStorage.getItem("accessToken");
  $.ajax({
    url:'/api/get-activity-logs',
    method: 'get',
    headers: {
      Authorization: authHeader
    },
    success: function(response) {
      if (response.sessionToken) {
        localStorage.setItem('accessToken', response.accessToken);
      }
      getBodyContent(response.fileLogs);
      response.fileLogs.map(function(file, index) {
        $('#fileList').append(
          '<div class="file-row" id="fileId_'+index+'" data-key='+file.Key+'>'+
            '<div class="file-name">'+file.fileName+'</div>'+
            '<div class="file-operation">'+ file.fileOperation +'</div>'+
            '<div class="file-status">'+ file.status +'</div>'+
            '<div class="file-timestamp">'+file.timestamp+'</div>'+
          '</div>'
        );
      });
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
  var name = localStorage.getItem("username");
  $('#overlaySpinner').show();
  $('#noFileSection').hide();
  $('#profileName').text(name);
  $('#profileIcon').html(name[0]);
  getFilesList();
});
