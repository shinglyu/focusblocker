var buttons = require('sdk/ui/button/action');
var data = require("sdk/self").data;
var prefs = require("sdk/simple-prefs").prefs;
var pageMod = require("sdk/page-mod");
var timer = require('sdk/timers'); var tabs = require('sdk/tabs');
var workers = []

var pageModInst;

var button = buttons.ActionButton({
     id: "mozilla-link",
      label: "Start blocking",
      icon: {
        "16": "./noicon-16.png",
        "32": "./noicon-32.png",
        "64": "./noicon-64.png"
     },
      onClick: handleClick
});

function handleClick(state) {
     //set expire time in pref, so won't loss after restart
     var rawExpTime = new Date(); 
     rawExpTime.setMinutes(rawExpTime.getMinutes() + prefs.blockTimeout);
     prefs.expireTime = rawExpTime.toISOString();
     
     tryBlock()
}

function block(){
   console.log('Start blocking')
   pageModInst = pageMod.PageMod({
      include: ['*.facebook.com', 'https://twitter.com/*', '*.cheezburger.com', 'http://feedly.com/*'],//TODO: from prefs
        contentScriptFile: data.url('block.js'),
        //contentScriptWhen: 'ready',
        contentScriptWhen: 'start',
        attachTo: ["existing", "top"],
        onAttach: function(worker){
           workers.push(worker);
        }
   });
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
   var now = new Date();
   var expireTime = new Date(prefs.expireTime)
   //console.log(now);
   //console.log(new Date(prefs.expireTime));
   //console.log(now < new Date(prefs.expireTime));
   if (now < expireTime){
      timer.setTimeout(unblock, expireTime - now);
      block();
   }
   else{
      unblock();
   }
}

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

tryBlock();
timedWarning();
require("sdk/simple-prefs").on("enableTimedWarning", timedWarning);
require("sdk/simple-prefs").on("warnTime", timedWarning);
