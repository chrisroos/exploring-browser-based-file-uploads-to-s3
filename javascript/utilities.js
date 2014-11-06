var start = function() {
  reset();
  recordStartedAt();
};

var finish = function() {
  recordFinishedAt();
  printDuration();
};

var reset = function() {
  $('#startedAt').text('');
  $('#finishedAt').text('');
  $('#duration').text('');
  $('#log').html('');
};

var recordStartedAt = function() {
  window.startedAt = new Date();
  $('#startedAt').text(window.startedAt);
};

var recordFinishedAt = function() {
  window.finishedAt = new Date();
  $('#finishedAt').text(window.finishedAt);
};

var printDuration = function() {
  var durationInMS = window.finishedAt - window.startedAt;
  var durationInS = durationInMS / 1000;
  $('#duration').text(durationInS);
};

var log = function() {
  var text = Array.prototype.join.call(arguments, ' ');
  var entry = $('<li>').addClass('list-group-item').text(text);
  $('#log').append(entry);
};
