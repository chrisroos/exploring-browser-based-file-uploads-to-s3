var queuedChunks = [];
var completedChunks = [];



var chunkFile = function(file) {
  var chunkSizeInMB = 10; // AWS S3 has a 5MB minimum chunk size
  var chunkSize = chunkSizeInMB * 1024 * 1024;
  var numberOfChunks = Math.ceil(file.size / chunkSize);
  var fileChunks = [];

  for (var partNumber = 1; partNumber <= numberOfChunks; partNumber ++) {
    var startByte = (partNumber - 1) * chunkSize;
    var endByte = partNumber * chunkSize;
    var chunk = file.slice(startByte, endByte);

    fileChunks.push({
      'partNumber': partNumber,
      'body': chunk,
      'etag': null
    });
  };

  return fileChunks;
};



var queueChunks = function(chunks) {
  $(chunks).each(function() {
    queuedChunks.push(this);
  });
};



var startMultipartUpload = function(file) {
  start();

  var fileChunks = chunkFile(file);
  queueChunks(fileChunks);
  log('INFO:', queuedChunks.length, 'chunks queued');

  var params = {
    'Key': file.name,
    'ContentType': file.type
  };
  window.bucket.createMultipartUpload(params, function(err, data) {
    if (err) {
      log('ERROR:', err, err.stack);
    } else {
      uploadParts(data.UploadId, file);
    };
  });
};



var uploadParts = function(uploadId, file) {
  $(queuedChunks).each(function() {
    var chunk = this;
    log('DEBUG:', 'chunk', chunk);
    uploadPart(uploadId, file, chunk);
  });
};



var uploadPart = function(uploadId, file, chunk) {
  var params = {
    'Key': file.name,
    'UploadId': uploadId,
    'PartNumber': chunk.partNumber,
    'Body': chunk.body
  };
  log('INFO:', 'Uploading part number', chunk.partNumber);
  window.bucket.uploadPart(params, function(err, data) {
    if (err) {
      log('ERROR', err, err.stack);
    } else {
      log('INFO:', 'Uploaded part number', chunk.partNumber);
      chunk.etag = data.ETag;
      moveChunkToCompletedQueue(chunk);
      checkAndFinaliseUpload(uploadId, file);
    };
  });
};



var moveChunkToCompletedQueue = function(chunk) {
  var indexOfQueuedChunk = null;

  for (var i = 0; i < queuedChunks.length; i++) {
    if (queuedChunks[i].partNumber == chunk.partNumber) {
      indexOfQueuedChunk = i;
    };
  };

  queuedChunks.splice(indexOfQueuedChunk, 1); // Remove chunk from queue
  completedChunks.push(chunk);
};



var checkAndFinaliseUpload = function(uploadId, file) {
  if (queuedChunks.length > 0) {
    return;
  }

  var params = {
    'Key': file.name,
    'UploadId': uploadId,
    'MultipartUpload': {
      'Parts': []
    }
  };

  var sortedChunks = completedChunks.sort(function(chunkA, chunkB) {
    return chunkB.partNumber < chunkA.partNumber;
  });

  $(sortedChunks).each(function() {
    params['MultipartUpload']['Parts'].push({
      'ETag': this.etag,
      'PartNumber': this.partNumber
    });
  });

  window.bucket.completeMultipartUpload(params, function(err, data) {
    finish();

    if (err) {
      log('ERROR', err, err.stack);
    } else {
      log('DEBUG:', 'Data:', data);
    };
  });
};


$(function() {
  window.button.addEventListener('click', function() {
    var file = window.fileChooser.files[0];
    if (file) {
      startMultipartUpload(file);
    };
  });
});
