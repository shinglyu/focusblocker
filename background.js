// Check if the a blacklisted site is loaded and setup blocking
chrome.webNavigation.onCommitted.addListener(function(navInfo){
  // TODO: find a way to early return. Maybe cache the blacklisted tabIds?

  reset_default_if_setting_is_invalid();

  console.debug(navInfo)

  chrome.storage.sync.get(["state", "start_time", "end_time", "blacklist"], function(items){
    // TODO: Do we need to re-parse everytime?
    var urls = parseBlacklist(items.blacklist);
    chrome.tabs.query({"url": urls}, function(tabs){
      var tab_ids = tabs.map(function(tab){return tab.id});
      // Check if the current tab is in the blacklisted tabs
      if (tab_ids.indexOf(navInfo['tabId']) >= 0){

        // FREE and invalid state
        if (typeof(items.state) == "undefined" || items.state == "free"){
          console.debug("Notifing the block time");
          startCountdown();
        }

        // COUNTDOWN
        if (items.state && items.state == "countdown"){
          console.debug("Browser restarted at " + Date() + " last countdown should end at  " + (new Date(items.end_time)).toString())
          if (Date.now() < items.end_time){
            console.debug("Browser restarted, re-enable the timer for " + (new Date(items.end_time)).toString())
            chrome.alarms.create("block", {"when":items.end_time});
          }
          else {
            console.debug("Browser restarted, countdown expired, block right away")
            block();
          }
        }

        // BLOCKING
        if (items.state && items.state == "blocking"){
          console.debug("Browser restarted at " + Date() + " last blocking should start at  " + (new Date(items.start_time)).toString() + " and end at " + (new Date(items.end_time)).toString())
          if (Date.now() < items.end_time){
            console.debug("Browser restarted, resuming the block until " + (new Date(items.end_time)).toString());
            block();
          }
          else {
            console.debug("Browser restarted, block expired, unblock now.");
            unblock();
          }
        }
      }
    })
  })
});

// Handle timed block/unblock
chrome.alarms.onAlarm.addListener(function( alarm ) {
  console.debug("Got an alarm!", alarm);
  if (alarm.name == "block"){
    block()
  }

  else if (alarm.name == "unblock"){
    unblock()
  }
});

// Set a timer to transition to next state when state changes
chrome.storage.onChanged.addListener(function(changes, namespace){
  console.debug(changes)
  if (changes.state && changes.state.oldValue == changes.state.newValue) {
    console.debug("No state change, skip");
    return;
  }
  if (changes.state && changes.state.newValue == "countdown"){
    console.debug("State changed to countdown at " + Date())
    console.debug("Current state starts at " + (new Date(changes.start_time.newValue)).toString())
    console.debug(changes)
    console.debug("Set blocking alarm at " + (new Date(changes.end_time.newValue)).toString())
    chrome.alarms.create("block", {"when":changes.end_time.newValue});
  }
  else if (changes.state && changes.state.newValue == "blocking"){
    console.debug("State changed to blocking at " + Date())
    console.debug("Current state starts at " + (new Date(changes.start_time.newValue)).toString())
    console.debug(changes)
    console.debug("Set unblocking alarm at " + (new Date(changes.end_time.newValue)).toString())
    chrome.alarms.create("unblock", {"when":changes.end_time.newValue});
  }
});

// Utility functions below
function startCountdown() {
  var default_prompt_time = chrome.storage.sync.get({
    // Getting the default
    state: "free",
    default_prompt_time: 10,
  }, function(items) {
    if (typeof(items.state) == "undefined" || items.state == "free"){
        time = items.default_prompt_time; // FIXME: Redundant, don't do this assignment
        // TODO: what if user blocks the notification?
        /*
        chrome.notifications.getPermissionLevel(function(level){
          console.debug(level);
        })
        */
        // Show a notification of remaining time
        chrome.notifications.create("countdown", {
          type: "basic",
          title: "FocusBlocker", 
          message: "You have " + time + " min left",
          iconUrl: "data/noicon-64.png"
        });
        console.debug("Notification created")
      }
      console.debug("Setting the state to countdown");
      chrome.storage.sync.set({"state": "countdown", 
                               "start_time": Date.now(),
                               "end_time": Date.now() + Math.round(time * 60 * 1000)
                              })
    });
  }

function reset_default_if_setting_is_invalid() {
  // FIXME: hard-coded default
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
    })
  });
}

function block() {
  // TODO: dynamic url list
  chrome.storage.sync.get(["blacklist"], function(items){
    var urls = parseBlacklist(items.blacklist);
    chrome.tabs.query({"url": urls}, function(tabs){
      console.debug(tabs)
      for (var tab of tabs){
        console.debug("blocking tab " + tab.url)
        chrome.notifications.create("countdown", {
          type: "basic",
          title: "FocusBlocker", 
          message: "Sorry, you need to focus",
          iconUrl: "data/noicon-64.png"
        });
        chrome.tabs.executeScript(tab.id, {file: "data/block.js"});
      }
    });
  });

  chrome.storage.sync.get(["state", "end_time", "block_time"], function(items){
    if (items.state !== "blocking"){
      var time = items.block_time;
      console.debug("Setting state to blocking from " + new Date(items.end_time) + " to " + new Date(items.end_time + Math.round(time * 60 * 1000)))
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
