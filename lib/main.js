var buttons = require('sdk/ui/button/action');
var data = require("sdk/self").data;
var prefs = require("sdk/simple-prefs").prefs;
var pageMod = require("sdk/page-mod");
var timer = require('sdk/timers'); var tabs = require('sdk/tabs');
var ss = require("sdk/simple-storage");
var workers = []

var timerPromptPageMod=null;
var pageModInst=null;

var button = buttons.ActionButton({
    id: "mozilla-link", label: "Start blocking",
      icon: {
        "16": "./noicon-16.png",
        "32": "./noicon-32.png",
        "64": "./noicon-64.png"
      },
      onClick: handleClick
});

function handleClick(state) {
  tryBlock()
}

function parseBlacklist(blacklist) {
    var parsed = blacklist.split(',').map(function (url) {
      try {
        //Try parsing, ignore if failed
        var { MatchPattern  } = require("sdk/util/match-pattern");
        var pattern = new MatchPattern(url.trim());
        return url.trim()
      } catch (e) {
        return ""
      }
    });
    parsed = parsed.filter(function(item){return item.length > 0});
    parsed = parsed.filter(function(item){return item != "*"});
    return parsed
}

exports['parseBlacklist'] = parseBlacklist;

function block(){ //min
   if (typeof ss.storage.expireTime === "undefined"){
     ss.storage.expireTime = new Date( new Date().getTime() + prefs.blockTimeout * 60 * 1000 )
   }
   //TODO: clear the start block time
  var blacklist = parseBlacklist(prefs.blacklist);
  pageModInst = pageMod.PageMod({
      include: blacklist,
      contentScriptFile: data.url('block.js'),
      //contentScriptWhen: 'ready',
      contentScriptWhen: 'start',
      attachTo: ["existing", "top"],
      onAttach: function(worker){
         workers.push(worker);
      }
   });
  timer.setTimeout(unblock, new Date(ss.storage.expireTime) - new Date());
  ss.storage.startTime = undefined;
}

function unblock(){
   workers.forEach(function(worker){
      worker.destroy()
   });
   if (pageModInst) {
      pageModInst.destroy();
   }
   else{
   }
   ss.storage.expireTime = undefined;
}

function tryBlock(){
  unblock(); //RESET
  block();
}

function resumeState() {
  var now = new Date();
  if (typeof ss.storage.expireTime === "undefined"){
    if (typeof ss.storage.startTime === "undefined"){
      // I
      unblock(); //RESET
    }
    else {
      // III
      if (now < new Date(ss.storage.startTime)){
        timer.setTimeout(tryBlock, new Date(ss.storage.startTime).getTime() - now.getTime());
      }
      else {
        ss.storage.expireTime = new Date(new Date(ss.storage.startTime).getTime() + prefs.blockTimeout * 60 * 1000);
        ss.storage.startTime = undefined;
        resumeState();
        //tryBlock();
      }
    }
  }
  else {
    // II & IV
    if (now > new Date(ss.storage.expireTime)){
      unblock();
    }
    else {
      block(); //tryBlock will reset expireTime
      //tryBlock();
    }
  }
}

function prompt_for_timed_block(){
  //timerPromptPageMod.destroy()
  var blacklist = parseBlacklist(prefs.blacklist);
  timerPromptPageMod = pageMod.PageMod({
    include: blacklist,
    contentScriptFile: data.url('promptTimedBlock.js'), //TODO: verify valid number
    contentScriptWhen: 'start',
    attachTo: ["existing", "top"],
    onAttach: function(worker) {
      worker.port.on('isTimedBlockUnset', function(time_min) {
        if (typeof ss.storage.startTime !== "undefined" && new Date() < new Date(ss.storage.startTime)) {
          return;
        }
        else if (typeof ss.storage.expireTime !== "undefined" && new Date() < new Date(ss.storage.expireTime)) {
          return;
        }
        else {
          console.log("Asking the content script to ask for timed block")
          resumeState(); //FIXME: trigger resumeState when wake notification fires
                         //Blocked by Bug 758848 
          var data = {
            'msg': 'I promise I\'ll only browse for ___ minutes',
            'time': prefs.browsingTimeout.toString()
          }
          worker.port.emit('askTimedBlock', data);
        }
      })

      worker.port.on('setTimedBlock', function(time_min) {
        //TODO: verify valid number
        if (isNaN(+time_min) || time_min === null){ //null == Cancel, but +null => 0
          worker.port.emit('askTimedBlock', 'You must set a valid number');
          return;
        }
        ss.storage.startTime = new Date(new Date().getTime() + time_min * 60 * 1000)
        timer.setTimeout(tryBlock, new Date(ss.storage.startTime).getTime() - new Date().getTime())
      });
    }
  });
}


resumeState();
if (prefs.enableTimedBlock){
  prompt_for_timed_block();
}

var sp = require("sdk/simple-prefs");
sp.on("enableTimedBlock", function(){
  if (prefs.enableTimedBlock){
    prompt_for_timed_block();
  }
  else {
    timerPromptPageMod.destroy()
  }
});

sp.on("blacklist", function(){
  timerPromptPageMod.destroy()
  if (prefs.enableTimedBlock){
    prompt_for_timed_block();
  }
});

sp.on("resetDefault", function() {
    //TODO: read from package.json after upgrading to jpm
    //var defaultValue = require("package.json").preferences.blacklist.value;
    prefs.blacklist= "*.facebook.com,https://twitter.com/*,*.cheezburger.com,http://feedly.com/*"
});
