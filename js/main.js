function refreshList () {
  $('#overlaySpinner').show();
  $('#fileList').html('');
  getFilesList();
}

function deleteFile (fileKey) {
  $('#overlaySpinner').show();
  $.post("api/delete-file/"+fileKey, function() {
    refreshList();
  })
  .fail(function(err) {
    console.log('file delete error', err);
    $('#overlaySpinner').hide();
  });
}

function getFilesList () {
  $.get('/api/get-files-list', function(response) {
    response.Contents.map(function(file, index) {
      $('#fileList').append(
        '<div class="file-row" id="fileId_'+index+'">'+
          '<div class="file-name">'+file.Key+'</div>'+
          '<div class="file-date">'+file.LastModified+'</div>'+
          '<div class="file-size">'+file.Size+' Bytes </div>'+
          '<div class="file-actions">'+
            '<a class="download-btn" id="download-btn" href="/api/get-file/'+file.Key+'">Download</button>'+
            '<a class="delete-btn" id="delete-file-btn" onClick="deleteFile(\'' + file.Key + '\')">Delete</button>'+
          '</div>'+
        '</div>'
      );
    });
    $('#overlaySpinner').hide();
  })
  .fail(function(err) {
    console.log('file fetch error', err);
    $('#overlaySpinner').hide();
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

$(document).ready(function() {
  $('#overlaySpinner').show();
  getFilesList();
  Dropzone.options.fileDropzone = {
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 25, // MB
    complete: function(file, done) {
      $('.dz-messge').show();
      $('.dz-preview.dz-file-preview').html('');
      $('#floatOver').addClass('hide-overlay');
      refreshList();
    },
    error: function(file, done) {
      $('.dz-preview.dz-file-preview').html('');
      $('#floatOver').addClass('hide-overlay');      
    }
  };
});

