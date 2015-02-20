var buttons = require('sdk/ui/button/action');
var data = require("sdk/self").data;
var prefs = require("sdk/simple-prefs").prefs;
var pageMod = require("sdk/page-mod");
var timer = require('sdk/timers'); var tabs = require('sdk/tabs');
var ss = require("sdk/simple-storage");
var workers = []

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
     //set expire time in pref, so won't loss after restart
     //var rawExpTime = new Date(); 
     //rawExpTime.setMinutes(rawExpTime.getMinutes() + prefs.blockTimeout); //FIXME: use time difference
     //ss.storage.expireTime = rawExpTime.toISOString(); //FIXME: change to Date obj
     
     tryBlock()
}

function block(){ //min
   console.log('Start blocking')
   if (typeof ss.storage.expireTime === "undefined"){
     ss.storage.expireTime = new Date( new Date().getTime() + prefs.blockTimeout * 60 * 1000 )
   }
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
}

function unblock(){
   console.log('Blocking expired')
   workers.forEach(function(worker){
      console.log(workers)
      console.log(worker)
      worker.destroy()
   });
   if (pageModInst) {
      pageModInst.destroy();
   }
   else{
      console.error('Cat\'t find pageMod to destory')
   }
}

function tryBlock(){
   //var now = new Date();
   //var expireTime = new Date(ss.storage.expireTime)
   //console.log(now);
   //console.log(new Date(ss.storage.expireTime));
   //console.log(now < new Date(ss.storage.expireTime));
  console.log("Resetting")
  unblock(); //RESET
  block();
  /*
  if (typeof ss.storage.expireTime === "undefined" || new Date() > ss.storage.expireTime){
    unblock(); //RESET
    block();
  }
  else {
    unblock(); //RESET
  }
  */
}

function resumeState() {
  console.log(ss.storage.startTime)
  console.log(ss.storage.expireTime)
  var now = new Date();
  if (typeof ss.storage.expireTime === "undefined"){
    if (typeof ss.storage.startTime === "undefined"){
      // I
      console.log("0:unblock")
      unblock(); //RESET
    }
    else {
      // III
      if (now < new Date(ss.storage.startTime)){
        console.log("4: reset timeout")
        timer.setTimeout(tryBlock, new Date(ss.storage.startTime) - now);
      }
      else {
        console.log("5: block from now")
        tryBlock();
      }
    }
  }
  else {
    // II & IV
    if (now > new Date(ss.storage.expireTime)){
      console.log("3: unblock")
      unblock();
    }
    else {
      console.log("2: block to old expiration")
      tryBlock();
    }
  }
}

/*
function timedWarning(){
   if (prefs.enableTimedWarning){
      console.log("Setting warning popup: " + prefs.warnTime);
      pageModInst = pageMod.PageMod({
         include: ['*.facebook.com', '*.cheezburger.com', 'http://feedly.com/*', 'https://twitter.com'],//TODO: from prefs
           //contentScript: 'setTimeout(function(){ alert("Don\'t you have work to do? Block it now.")},' +  prefs.warnTime*1000*60 + ')\;',
           contentScriptFile: data.url('timedWarn.js'),
           contentScriptWhen: 'start',
           attachTo: ["existing", "top"],
           onAttach: function(worker){
              worker.postMessage(prefs.warnTime);
           }
      });
   }
}
*/

function prompt_for_timed_block(){
  var timerPrompt = pageMod.PageMod({
    include: blacklist,
    contentScriptFile: data.url('promptTimedBlock.js'), //TODO: verify valid number
    contentScriptWhen: 'start',
    onAttach: function(worker) {
      worker.port.on('isTimedBlockUnset', function(time_min) {
        if (typeof ss.storage.startTime !== "undefined" && new Date() < new Date(ss.storage.startTime)) {
          console.log("The start blocking timer is already set to " + ss.storage.startTime)
        }
        else {
          console.log("Asking the content script to ask for timed block")
          worker.port.emit('askTimedBlock')
        }
      })

      worker.port.on('setTimedBlock', function(time_min) {
        //TODO: verify valid number
        console.log("timer set to ", time_min)
        ss.storage.startTime = new Date(new Date().getTime() + time_min * 60 * 1000)
        console.log(ss.storage.startTime.toISOString())
        timer.setTimeout(tryBlock, ss.storage.startTime - new Date().getTime())
      });
    }
  });
}


resumeState();
prompt_for_timed_block();
//tryBlock();
// timedWarning();
//require("sdk/simple-prefs").on("enableTimedWarning", timedWarning);
//require("sdk/simple-prefs").on("warnTime", timedWarning);

