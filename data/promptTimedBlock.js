//self.port.emit('isTimedBlockUnset');
var default_prompt_time = chrome.storage.sync.get(["state", "default_prompt_time"], function(items) {
  console.log(items.state)
  if (typeof(items.state) == "undefined" || items.state == "free"){
    var time = window.prompt("I promise I'll only browse for ___ min.", items.default_prompt_time);
    chrome.storage.sync.set({"state": "countdown", 
                             "start_time": Date.now(),
                             "end_time": Date.now() + Math.round(time * 60 * 1000)
                            })
  }
});
/*
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var time = window.prompt("I promise I'll only browse for ___ min.", request.default_prompt_time);
    console.log(sendResponse)
    sendResponse({time: time});
  }
);
*/
