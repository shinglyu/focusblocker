var buttons = require('sdk/ui/button/action');
//var tabs = require("sdk/tabs");
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
             "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
     },
      onClick: handleClick
});

function handleClick(state) {
     //set expire time in pref, so won't loss after restart
     var rawExpTime = new Date(); 
     rawExpTime.setMinutes(rawExpTime.getMinutes() + prefs.blockTimeout);
     prefs.expireTime = rawExpTime.toISOString();

     var popupScript = "for each (var elem in document.getElementsByName('blocktime')){" + 
                       "elem.innerHTML = '" + prefs.blockTimeout + " min'};" + 
                       "for each (var elem in document.getElementsByName('gracetime')){" + 
                       "elem.innerHTML = '" + prefs.graceTimeout + " min'};";  

     var panel = require("sdk/panel").Panel({                                    
        contentURL: data.url("block_popup.html"),
        contentScript: popupScript
     });                                                                         
     panel.show() 
     
     tryBlock()
     //change icon
     //change state (enable cancel?)
}

function block(){
   console.log('Start blocking')
   pageModInst = pageMod.PageMod({
      include: ['*.facebook.com', '*.cheezburger.com', 'http://feedly.com/*'],//TODO: from prefs
        //contentScript: 'document.body.innerHTML = "<h1>BLOCKED</h1>";',
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
      pageModInst = pageMod.PageMod({
         include: ['*.facebook.com', '*.cheezburger.com', 'http://feedly.com/*'],//TODO: from prefs
           contentScript: 'timer.setTimeout(function(){ alert("You\'ve been browsing for too long, please start blocking")},' +  prefs.warnTime + ');';
           contentScriptWhen: 'ready',
           attachTo: ["existing", "top"]
      });
   }
}

tryBlock();
timedWarning();
require("sdk/simple-prefs").on("enableTimedWarning", timedWarning);
//disable timedwarnworker if unchecked

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
