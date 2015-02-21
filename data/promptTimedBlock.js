self.port.emit('isTimedBlockUnset');
self.port.on('askTimedBlock', function(msg){
  var time = window.prompt(msg, '10'); 
  self.port.emit('setTimedBlock', time);
})
