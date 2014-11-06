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
      logError('Error: See the console for more');
      console.log('ERROR:', err, err.stack)
    } else {
      logSuccess('Uploaded successfully');
    };
  });
};
