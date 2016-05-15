chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { 
  // Move this to the setting page
  //chrome.storage.sync.set({"state": "free", "start_time": Date.now()})
  chrome.storage.sync.set({"default_prompt_time":1});
  chrome.storage.sync.set({"block_time":1});
  console.log(tab.url)
  console.log(changeInfo)
  /*
  console.log(tab)
  */
  // TODO; make the blacklist customizable
  //if (tab.url.includes("facebook.com") && tab.status == "complete"){
  if (tab.url.includes("facebook.com") && change && change.status == "loading"){
    // if state == none
    chrome.storage.sync.get(["state", "end_time"], function(items){
      console.log(items)
      if (typeof(items.state) == "undefined" || items.state == "free"){
        chrome.tabs.executeScript(tabId, {file: "data/promptTimedBlock.js"});
      }
        /*
        chrome.tabs.sendMessage(tabId, {default_prompt_time: 10}, function(response) {
          console.log("Got response")
          console.log(response);
        });
        */
        // set countdown state
        // set timer to block
      // if state == countdown
      if (items.state && items.state == "countdown"){
        // if still valid
        console.log("Chrome restarted at " + Date() + " last countdown should start at  " + (new Date(items.end_time)).toString())
        if (Date.now() < items.end_time){
          // set timer to block
          console.log("Chrome restarted, re-enable the timer at " + (new Date(items.end_time)).toString())
          chrome.alarms.create("block", {"when":items.end_time});
        }
        // if already expired
        else {
          console.log("Chrome restarted, countdown expired, block right away")
          block();
          // block right away
        }

      }
      // if state == block
      if (items.state && items.state == "blocking"){
        console.log("Chrome restarted at " + Date() + " last blocking should start at  " + (new Date(items.end_time)).toString())
        // if still valid
        if (Date.now() < items.end_time){
          block()
          // block right away
        }

        else {
          unblock()


        }
      }
        // if already expired
          // set state to unblock
        //chrome.tabs.executeScript(tabId, {file: "data/block.js"});
        // set timer to none

    })
  }
});

chrome.storage.onChanged.addListener(function(changes, namespace){
  console.log(changes)
  if (changes.state && changes.state.newValue == "countdown"){
    console.log("State changed to countdown at " + Date())
    console.log("Current state starts at " + (new Date(changes.start_time.newValue)).toString())
    console.log(changes)
    console.log("Set blocking alarm at " + (new Date(changes.end_time.newValue)).toString())
    chrome.alarms.create("block", {"when":changes.end_time.newValue});
  }
  else if (changes.state && changes.state.newValue == "blocking"){
    console.log("State changed to blocking at " + Date())
    console.log("Current state starts at " + (new Date(changes.start_time.newValue)).toString())
    console.log(changes)
    console.log("Set unblocking alarm at " + (new Date(changes.end_time.newValue)).toString())
    chrome.alarms.create("unblock", {"when":changes.end_time.newValue});
  }
})

chrome.alarms.onAlarm.addListener(function( alarm ) {
  console.log("Got an alarm!", alarm);
  if (alarm.name == "block"){
    block()
  }

  else if (alarm.name == "unblock"){
    unblock()
  }
});

function block() {
  // TODO: dynamic url list
  chrome.tabs.query({"url": ["*://*.facebook.com/*"]}, function(tabs){
    console.log(tabs)
    for (var tab of tabs){
      console.log("blocking tab " + tab.url)
      chrome.tabs.executeScript(tab.id, {file: "data/block.js"});
    }
  })

  chrome.storage.sync.get(["end_time", "block_time"], function(items){
    var time = items.block_time;
    console.log("Setting state to blocking from " + new Date(items.end_time) + " to " + new Date(items.end_time + Math.round(time * 60 * 1000)))
    chrome.storage.sync.set({"state": "blocking", 
                             "start_time": items.end_time,
                             "end_time": items.end_time + Math.round(time * 60 * 1000)
                            })
  })
}

function unblock(){
    chrome.storage.sync.set({"state": "free", 
                             "start_time": Date.now(),
                             "end_time": undefined
                            });
}
