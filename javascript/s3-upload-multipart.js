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
  log([queuedChunks.length, 'chunks queued'].join(' '));

  var params = {
    'Key': file.name,
    'ContentType': file.type
  };
  window.bucket.createMultipartUpload(params, function(err, data) {
    if (err) {
      log('Error: See the console for more');
      console.log('ERROR:', err, err.stack)
    } else {
      uploadParts(data.UploadId, file);
    };
  });
};



var uploadParts = function(uploadId, file) {
  $(queuedChunks).each(function() {
    var chunk = this;
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
  log(['Uploading part number', chunk.partNumber].join(' '));
  window.bucket.uploadPart(params, function(err, data) {
    if (err) {
      log('Error: See the console for more');
      console.log('ERROR:', err, err.stack)
    } else {
      log(['Uploaded part number', chunk.partNumber].join(' '));
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
      log('Error: See the console for more');
      console.log('ERROR:', err, err.stack)
    } else {
      logSuccess('Uploaded successfully');
    };
  });
};
