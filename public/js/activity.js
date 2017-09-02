function getBodyContent (data) {
  if (data.length > 0) {
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
        localStorage.setItem('accessToken', response.sessionToken);
      }
      getBodyContent(response.Contents);
      response.Contents.map(function(file, index) {
        var modifiedDate = new Date(file.LastModified).toDateString().substring(4);
        $('#fileList').append(
          '<div class="file-row" id="fileId_'+index+'" data-key='+file.Key+'>'+
            '<div class="file-name">'+file.Key+'</div>'+
            '<div class="file-date">'+ modifiedDate +'</div>'+
            '<div class="file-size">'+ bytesToSize(file.Size) +'</div>'+
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
      $('#overlaySpinner').hide();
    }
  });
}
