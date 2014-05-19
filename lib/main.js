var buttons = require('sdk/ui/button/action');
//var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var prefs = require("sdk/simple-prefs").prefs;
var pageMod = require("sdk/page-mod");
var timer = require('sdk/timers');
var workers = []

var pageModInst;



var button = buttons.ActionButton({
     id: "mozilla-link",
      label: "Start blocking",
      icon: {
             "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
     },
      onClick: handleClick
});

function handleClick(state) {
     //set expire time in pref, so won't loss after restart
     var rawExpTime = new Date(); //TODO: variable timeout
     rawExpTime.setMinutes(rawExpTime.getMinutes() + prefs.blockTimeout);
     prefs.expireTime = rawExpTime.toISOString();

     tryBlock()
     //change icon
     //change state (enable cancel?)
}

function block(){
   console.log('Start blocking')
   pageModInst = pageMod.PageMod({
        include: ['*.facebook.com', '*.cheezburger.com'],
        contentScript: 'document.body.innerHTML = "<h1>BLOCKED</h1>";',
        contentScriptWhen: 'ready',
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

tryBlock();
//main
//tryblock()
//if expire time > now
//   block()
//else 
//   unblock()
/*
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var widget = widgets.Widget({
     id: "mozilla-link",
      label: "Mozilla website",
      contentURL: require("sdk/self").data.url("icon-16.png"),
      onClick: function() {
             tabs.open("http://developer.mozilla.org/");
               }
});
*/
