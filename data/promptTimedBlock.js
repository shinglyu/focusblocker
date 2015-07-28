self.port.emit('isTimedBlockUnset');
self.port.on('askTimedBlock', function(data){
  var time = window.prompt(data.msg, data.time); 
  self.port.emit('setTimedBlock', time);
})
