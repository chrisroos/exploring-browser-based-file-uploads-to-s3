$(function() {
  AWS.config.update({
    accessKeyId: window.awsAccessKeyId,
    secretAccessKey: window.awsSecretAccessKey
  });
  AWS.config.region = window.awsRegion;

  window.bucket = new AWS.S3({params: {Bucket: window.awsS3Bucket}});

  var fileChooser = document.getElementById('file-chooser');
  var button = document.getElementById('upload-button');

  var toggleChunkSizeInput = function() {
    var uploadType = $('input[name=uploadType]:checked').val();
    if (uploadType == 'single') {
      $('#chunkSizeInMb').prop('disabled', true);
    } else {
      $('#chunkSizeInMb').prop('disabled', false);
    };
  };

  $('input[name=uploadType]').click(function() {
    toggleChunkSizeInput();
  });

  toggleChunkSizeInput();

  button.addEventListener('click', function() {
    var file = fileChooser.files[0];
    if (file) {
      var uploadType = $('input[name=uploadType]:checked').val();

      if (uploadType == 'single') {
        uploadFile(file);
      } else {
        startMultipartUpload(file);
      };

    } else {
      log('Nothing to upload.');
    };
  }, false);
});
