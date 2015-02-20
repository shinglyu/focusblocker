self.port.emit('isTimedBlockUnset');
self.port.on('askTimedBlock', function(){
  var time = window.prompt('I promise  I will only browse for ___ minutes', '10'); 
  self.port.emit('setTimedBlock', time);
})
