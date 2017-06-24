function refreshList () {
  $('#overlaySpinner').show();
  $('#fileList').html('');
  getFilesList();
}

function getBodyContent (data) {
  if (data.length > 0) {
    $('#noFileSection').hide();
    $('#fileListHeader').show();
  } else {
    $('#fileListHeader').hide();
    $('#noFileSection').show();
  }
}

function deleteFile (fileKey) {
  $('#overlaySpinner').show();
  $.ajax({
    url:'api/delete-file/'+fileKey,
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem("accessToken")
    },
    success: function(response) {
      refreshList();
    },
    error: function(err) {
      console.log('file delete error', err);
      $('#overlaySpinner').hide();
    }
  });
}

function getFilesList () {
  var authHeader = 'Bearer ' + sessionStorage.getItem("accessToken");
  $.ajax({
    url:'/api/get-files-list',
    method: 'get',
    headers: {
      Authorization: authHeader
    },
    success: function(response) {
      console.log(response);
      if (response.sessionToken) {
        sessionStorage.setItem('accessToken', response.sessionToken);
      }
      getBodyContent(response.Contents);
      response.Contents.map(function(file, index) {
        $('#fileList').append(
          '<div class="file-row" id="fileId_'+index+'">'+
            '<div class="file-name">'+file.Key+'</div>'+
            '<div class="file-date">'+file.LastModified+'</div>'+
            '<div class="file-size">'+file.Size+' Bytes </div>'+
            '<div class="file-actions">'+
              '<a class="download-btn" id="download-btn" href="/api/get-file/'+file.Key+'?Authorization='+authHeader+'">Download</button>'+
              '<a class="delete-btn" id="delete-file-btn" onClick="deleteFile(\'' + file.Key + '\')">Delete</button>'+
            '</div>'+
          '</div>'
        );
      });
      $('#overlaySpinner').hide();
    },
    error: function(err) {
      console.log('file fetch error', err);
      $('#overlaySpinner').hide();
    }
  });
}

$('#uploadBtn').on('click', function() {
  if ($('#uploadBtn').hasClass('active')) {
    $('#floatOver').addClass('hide-overlay');
    $('#uploadBtn').removeClass('active');
  } else {
    $('#floatOver').removeClass('hide-overlay');
    $('#uploadBtn').addClass('active');
    $('.dropzone.dz-started .dz-message').show();
  }
});

var dragTimer;
$(document).on('dragover', function(e) {
  var dt = e.originalEvent.dataTransfer;
  if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
    $('#floatOver').removeClass('hide-overlay');
    $('#uploadBtn').addClass('active');
    window.clearTimeout(dragTimer);
  }
});

$(document).on('dragleave', function(e) {
  if (e.originalEvent.pageX != 0 || e.originalEvent.pageY != 0) {
        return false;
  }
  dragTimer = window.setTimeout(function() {
    $('#floatOver').addClass('hide-overlay');
    $('#uploadBtn').removeClass('active');
  }, 25);
});

$(document).ready(function() {
  $('#overlaySpinner').show();
  $('#fileListHeader').hide();
  $('#noFileSection').hide();
  getFilesList();
  Dropzone.options.fileDropzone = {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem("accessToken")
    },
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 25, // MB
    complete: function(file, done) {
      $('.dz-messge').show();
      $('.dz-preview').hide('');
      $('#floatOver').addClass('hide-overlay');
      $('#uploadBtn').removeClass('active');
      refreshList();
    },
    error: function(file, done) {
      $('.dz-preview').hide('');
      $('#floatOver').addClass('hide-overlay');      
    }
  };
});
