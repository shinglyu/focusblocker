self.port.emit('isTimedBlockUnset');
self.port.on('askTimedBlock', function(){
  var time = window.prompt('Block all blacklisted websites in ___ minutes'); 
  self.port.emit('setTimedBlock', time);
})
