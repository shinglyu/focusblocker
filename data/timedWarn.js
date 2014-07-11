self.on("message", function(warnTime)
{
   setTimeout(function(){ alert("Don\'t you have work to do? Block it now.")}, warnTime*1000*60);
});

