var selectedArray = [],
    selectedId;

function refreshList () {
  $('#overlaySpinner').show();
  $('#fileList').html('');
  $('#actionPane').addClass('hide');
  getFilesList();
}

function getBodyContent (data) {
  if (data.length > 0) {
    $('#noFileSection').hide();
    $('#topPane').show();
  } else {
    $('#topPane').hide();
    $('#noFileSection').show();
  }
}

function bytesToSize (bytes) {
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
      i,
      result;
  if (bytes === 0) {
    result = '0 Byte';
  } else if (bytes === 1) {
    result = '1 Byte';
  } else {
    i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    i = i < sizes.length ? i : (sizes.length - 1);
    result = +(bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  }
  return result;
}

function deleteFile (fileKey) {
  $('#overlaySpinner').show();
  $.ajax({
    url:'api/delete-file/'+fileKey,
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem("accessToken")
    },
    success: function(response) {
      refreshList();
    },
    error: function(err) {
      $('#overlaySpinner').hide();
    }
  });
}

function getFilesList () {
  var authHeader = 'Bearer ' + localStorage.getItem("accessToken");
  $.ajax({
    url:'/api/get-files-list',
    method: 'get',
    headers: {
      Authorization: authHeader
    },
    success: function(response) {
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
      }
      getBodyContent(response.Contents);
      response.Contents.map(function(file, index) {
        var modifiedDate = new Date(file.LastModified).toDateString().substring(4),
            encodeKey = encodeURI(file.Key);
        $('#fileList').append(
          '<div class="file-row" ondblclick="openFile(this)" onclick="selectFile(this)" id="fileId_'+index+'" data-key='+encodeKey+'>'+
            '<div class="file-name data-key='+encodeKey+'">'+file.Key+'</div>'+
            '<div class="file-date data-key='+encodeKey+'">'+ modifiedDate +'</div>'+
            '<div class="file-size data-key='+encodeKey+'">'+ bytesToSize(file.Size) +'</div>'+
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

function selectFile(file) {
  var id = '#'+$(file).attr('id'),
      key = $(file).data('key'),
      authHeader = 'Bearer ' + localStorage.getItem("accessToken"),
      fileurl = '/api/get-file/'+key+'?Authorization='+authHeader,
      iframeUrl = 'https://docs.google.com/gview?url=https://driveit.us-west-2.elasticbeanstalk.com' + fileurl + '&embedded=true';

  if($(id).hasClass('selected')) {
    $(id).removeClass('selected');
    selectedId = '';
    $('#actionPane').addClass('hide');
  } else {
    $(selectedId).removeClass('selected');
    $(id).addClass('selected');
    $('#downloadBtn').attr('href', fileurl);
    // $('#fileViewer').attr('src', iframeUrl);
    selectedId = id;
    $('#actionPane').removeClass('hide');
  }

  // if($(id).hasClass('selected')) {
  //   $(id).removeClass('selected');
  //   selectedArray.splice(selectedArray.indexOf(key), 1);
  // } else {
  //   $(id).addClass('selected');
  //   selectedArray.push(key);
  // }
}

$('#deleteFileBtn').on('click', function(event) {
  var delKey = $(selectedId).data('key');
  deleteFile(delKey); 
})

function openFile (file) {
  var id = '#'+$(file).attr('id'),
      key = $(file).data('key'),
      authHeader = 'Bearer ' + localStorage.getItem("accessToken"),
      fileurl = '/api/get-file/'+key+'?Authorization='+authHeader,
      iframeUrl = 'https://docs.google.com/gview?url=https://driveit.us-west-2.elasticbeanstalk.com' + fileurl + '&embedded=true';

  $('#fileViewer').attr('src', iframeUrl);
  $('#fileViewOverlay').removeClass('hide');
}

$('#previewBtn').on('click', function(event) {
  openFile(this);
});

$('#closeFileView').on('click', function () {
  $('#fileViewOverlay').addClass('hide');
  $('#fileViewer').attr('src', '');
});

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
  var name = localStorage.getItem("username");
  $('#overlaySpinner').show();
  $('#noFileSection').hide();
  $('#profileName').text(name);
  $('#profileIcon').html(name[0]);
  getFilesList();
  Dropzone.options.fileDropzone = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem("accessToken")
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
