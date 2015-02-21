var buttons = require('sdk/ui/button/action');
var data = require("sdk/self").data;
var prefs = require("sdk/simple-prefs").prefs;
var pageMod = require("sdk/page-mod");
var timer = require('sdk/timers'); var tabs = require('sdk/tabs');
var ss = require("sdk/simple-storage");
var workers = []

var timerPromptPageMod;

var blacklist = [
  //'*.youtube.com', 
  '*.facebook.com', 
  'https://twitter.com/*', 
  '*.cheezburger.com', 
  'http://feedly.com/*'
]

var pageModInst;

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

function block(){ //min
   if (typeof ss.storage.expireTime === "undefined"){
     ss.storage.expireTime = new Date( new Date().getTime() + prefs.blockTimeout * 60 * 1000 )
   }
   console.log(ss.storage.expireTime)
   //TODO: clear the start block time
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
          worker.port.emit('askTimedBlock', 'I promise I\'ll only browse for ___ minutes')
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
require("sdk/simple-prefs").on("enableTimedBlock", function(){
  if (prefs.enableTimedBlock){
    prompt_for_timed_block();
  }
  else {
    timerPromptPageMod.destroy()
  }
});
