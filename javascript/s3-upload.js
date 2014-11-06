var uploadFile = function(file) {
  start();

  var params = {
    'Key': file.name,
    'ContentType': file.type,
    'Body': file
  };

  window.bucket.putObject(params, function(err, data) {
    finish();

    if (err) {
      log('Error!');
    } else {
      log('Uploaded successfully.');
    };
  });
};

$(function() {
  window.button.addEventListener('click', function() {
    var file = window.fileChooser.files[0];
    if (file) {
      uploadFile(file);
    } else {
      log('Nothing to upload.');
    };
  }, false);
});
