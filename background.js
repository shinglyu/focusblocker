chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { 
  // Set default
  chrome.storage.sync.get({ 
    state: "free",
    default_prompt_time: 10,
    block_time: 50,
    blacklist: "*://*.facebook.com/*"
  }, function(items){
    chrome.storage.sync.set({
      state: items.state,
      default_prompt_time: items.default_prompt_time,
      block_time: items.block_time,
      blacklist: items.blacklist
    });
  });
  //console.log(tab.url)
  //console.log(changeInfo)
  chrome.storage.sync.get(["state", "end_time", "blacklist"], function(items){
    var urls = parseBlacklist(items.blacklist);
    chrome.tabs.query({"url": urls}, function(tabs){
      var tab_ids = tabs.map(function(tab){return tab.id;});
      if (tab_ids.indexOf(tabId) >= 0 && changeInfo && changeInfo.status == "loading"){
        //console.log(items)
        if (typeof(items.state) == "undefined" || items.state == "free"){
          chrome.tabs.executeScript(tabId, {file: "data/promptTimedBlock.js"});
        }
        if (items.state && items.state == "countdown"){
          //console.log("Chrome restarted at " + Date() + " last countdown should start at  " + (new Date(items.end_time)).toString())
          if (Date.now() < items.end_time){
            //console.log("Chrome restarted, re-enable the timer at " + (new Date(items.end_time)).toString())
            chrome.alarms.create("block", {"when":items.end_time});
          }
          else {
            //console.log("Chrome restarted, countdown expired, block right away")
            block();
          }
        }
        if (items.state && items.state == "blocking"){
          //console.log("Chrome restarted at " + Date() + " last blocking should end at  " + (new Date(items.end_time)).toString())
          if (Date.now() < items.end_time){
            block();
          }
          else {
            unblock();
          }
        }
      }
    });

  });

});

chrome.storage.onChanged.addListener(function(changes, namespace){
  //console.log(changes)
  if (changes.default_prompt_time) {
    //console.log("Setting the default, don't do anything.");
    return;
  }
  if (changes.state && changes.state.newValue == "countdown"){
    //console.log("State changed to countdown at " + Date())
    //console.log("Current state starts at " + (new Date(changes.start_time.newValue)).toString())
    //console.log(changes)
    //console.log("Set blocking alarm at " + (new Date(changes.end_time.newValue)).toString())
    chrome.alarms.create("block", {"when":changes.end_time.newValue});
  }
  else if (changes.state && changes.state.newValue == "blocking"){
    //console.log("State changed to blocking at " + Date())
    //console.log("Current state starts at " + (new Date(changes.start_time.newValue)).toString())
    //console.log(changes)
    //console.log("Set unblocking alarm at " + (new Date(changes.end_time.newValue)).toString())
    chrome.alarms.create("unblock", {"when":changes.end_time.newValue});
  }
});

chrome.alarms.onAlarm.addListener(function( alarm ) {
  //console.log("Got an alarm!", alarm);
  if (alarm.name == "block"){
    block();
  }

  else if (alarm.name == "unblock"){
    unblock();
  }
});

function block() {
  // TODO: dynamic url list
  chrome.storage.sync.get(["blacklist"], function(items){
    var urls = parseBlacklist(items.blacklist);
    chrome.tabs.query({"url": urls}, function(tabs){
      //console.log(tabs)
      for (var tab of tabs){
        //console.log("blocking tab " + tab.url)
        chrome.tabs.executeScript(tab.id, {file: "data/block.js"});
      }
    });
  });

  chrome.storage.sync.get(["state", "end_time", "block_time"], function(items){
    if (items.state !== "blocking"){
      var time = items.block_time;
      //console.log("Setting state to blocking from " + new Date(items.end_time) + " to " + new Date(items.end_time + Math.round(time * 60 * 1000)))
      chrome.storage.sync.set({"state": "blocking", 
                               "start_time": items.end_time,
                               "end_time": items.end_time + Math.round(time * 60 * 1000)
                              });
    }
  });
}

function unblock(){
    chrome.storage.sync.set({"state": "free", 
                             "start_time": Date.now(),
                             "end_time": undefined
                            });
}

function parseBlacklist(blacklist){
  return blacklist.split('\n').map(function(item){return item.trim();});
}
